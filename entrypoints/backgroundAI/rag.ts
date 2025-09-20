import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from 'langchain/document';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { pull } from 'langchain/hub';
import { Annotation, StateGraph } from '@langchain/langgraph';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { api_key } from '@/api';

const llm = new ChatOpenAI({
  model: "gpt-5-mini",
  apiKey: api_key,
  temperature: 0
});

const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-large'
});

const vectorStore = new MemoryVectorStore(embeddings)

export async function rag(url: string) {
    const cheerioLoader = new CheerioWebBaseLoader('https://www.lipsum.com/')

    const docs = await cheerioLoader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000, chunkOverlap: 200
    })

    const allSplits = await splitter.splitDocuments(docs);

    await vectorStore.addDocuments(allSplits);

    const promptTemplate = await pull<ChatPromptTemplate>('rlm/rag-prompt')

    const InputStateAnnotation = Annotation.Root({
        question: Annotation<string>,
    });

    const StateAnnotation = Annotation.Root({
        question: Annotation<string>,
        context: Annotation<Document[]>,
        answer: Annotation<string>,
    });

    const retrieve = async (state: typeof InputStateAnnotation.State) => {
        const retrievedDocs = await vectorStore.similaritySearch(state.question)
        return { context: retrievedDocs}
    }

    const generate = async (state: typeof StateAnnotation.State) => {
        const docsContent = state.context.map((doc: { pageContent: any; }) => doc.pageContent).join('\n');
        const messages = await promptTemplate.invoke({question: state.question, context: docsContent})
        const response = await llm.invoke(messages);
        return { answer: response.content}
    }

    const graph = new StateGraph(StateAnnotation)
        .addNode('retrieve', retrieve)
        .addNode('generate', generate)
        .addEdge('__start__', 'retrieve')
        .addEdge('retrieve', 'generate')
        .addEdge('generate', '__end__')
        .compile()

    let input = { question: 'Summarize this text' }
    const result = await graph.invoke(input)

    return result.answer
}