import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { model } from "@/ai/chain";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function rag(url: any, question: string) {
    const loader = new CheerioWebBaseLoader(url, {
        selector: 'p'
    });
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50
    });

    const docsSplit = await textSplitter.splitDocuments(docs);

    const vectorStore = await MemoryVectorStore.fromDocuments(
        docsSplit,
        new OpenAIEmbeddings(),
    );

    const retriever = vectorStore.asRetriever()

    const relevantDocs = await retriever.getRelevantDocuments(question)

    const context = relevantDocs.map((d) => d.pageContent).join('\n--\n')
    
    const prompt = ChatPromptTemplate.fromTemplate(`
    You are an assistant. Use the following context to answer the question.
    Context:
    {context}

    Question:
    {question}

    Answer:`);


    const llm = model
    const chain = prompt.pipe(llm);

    const response = await chain.invoke({ context, question});
    return response.text ?? response.content ?? "";
}