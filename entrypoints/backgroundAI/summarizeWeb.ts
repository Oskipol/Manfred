import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Annotation, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';

export async function summarizeWeb(url: string | undefined, model: ChatOpenAI, prompt: ChatPromptTemplate) {
    const StateAnnotation = Annotation.Root({
        url: Annotation<string>(),
        rawContent: Annotation<string>(),
        processedContent: Annotation<string>(),
        question: Annotation<string>(),
        answer: Annotation<string>(),
    });

    const promptTemplate = prompt;
    const llm = model;

    const load = async (state: typeof StateAnnotation.State) => {
        if(url == undefined) {
            return 'Niepoprawny URL'
        }

        const cheerioLoader = new CheerioWebBaseLoader(state.url)

        const docs = await cheerioLoader.load();

        const rawContent = docs.map((doc: { pageContent: any; }) => doc.pageContent).join('\n\n')

        console.log('dane zaladowane')
        return { rawContent}
    }

    const retrieve = async (state: typeof StateAnnotation.State) => {
        console.log('czysczenie danych')
        let content = state.rawContent;

        content = content.replace(/\s+/g, ' ').trim();

        return { processedContent: content }
    }

    const generate = async (state: typeof StateAnnotation.State) => {
        console.log('generowanie odpowiedzi')
        const messages = await promptTemplate.invoke({
            context: state.processedContent, 
            question: state.question,
        })

        const response = await llm.invoke(messages);

        return { answer: response.content as string }
    }

    const graph = new StateGraph(StateAnnotation)
        .addNode('load', load)
        .addNode('retrieve', retrieve)
        .addNode('generate', generate)
        .addEdge('__start__', 'load')
        .addEdge('load', 'retrieve')
        .addEdge('retrieve', 'generate')
        .addEdge('generate', '__end__')
        .compile()

    let input = { url: url }
    const result = await graph.invoke(input)

    return result.answer
}