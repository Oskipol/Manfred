import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Annotation, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { api_key } from "@/api";

const llm = new ChatOpenAI({
  model: "gpt-5-mini",
  apiKey: api_key,
});

const chatsBySessionId: Record<string, InMemoryChatMessageHistory> = {};

async function loadCurrentUrl(url: string) {
    const cheerioLoader = new CheerioWebBaseLoader(url);
    const docs = await cheerioLoader.load();
    const rawContent = docs.map(doc => doc.pageContent).join('\n\n')

    return rawContent
}

let rawContent = '';

export async function chatWithModel(url: string, question: string, session: string) {

    const promptTemplate = ChatPromptTemplate.fromTemplate(`
        Kontekst dokumentu:
        {context}

        Historia rozmowy:
        {chat_history}

        Aktualne pytanie użytkownika:
        {question}

        Na podstawie historii rozmowy i kontekstu odpowiedz w sposób spójny.
    `);

    const StateAnnotation  = Annotation.Root({
        url: Annotation<string>(),
        rawContent: Annotation<string>(),
        processedContent: Annotation<string>(),
        question: Annotation<string>(),
        answer: Annotation<string>(),
    })

    const InputStateAnnotation = Annotation.Root({
        question: Annotation<string>,
    });

    const load = async (state: typeof StateAnnotation.State) => {
        if(rawContent == '') {
            console.log('ladowanie danych')
            rawContent = await loadCurrentUrl(state.url)
            console.log('dane zaladowane')
        }
        else {
            console.log('dane już były ładowane wcześniej')
        }
        return { rawContent }
    }

    const retrieve = async (state: typeof StateAnnotation.State) => {
        console.log('czysczenie danych')
        let content = state.rawContent;

        content = content.replace(/\s+/g, ' ').trim();

        return { processedContent: content }
    }

    const generate = async (state: typeof StateAnnotation.State, options: { configurable?: { sessionId?: string}}) => {
        const sessionId = options.configurable?.sessionId ?? 'default';
        let chatHistory: InMemoryChatMessageHistory | undefined = chatsBySessionId[sessionId];
        if(!chatHistory) {
            chatHistory = new InMemoryChatMessageHistory();
            chatsBySessionId[sessionId] = chatHistory;
        }

        const historyMessages = await chatHistory.getMessages()

         const historyString = historyMessages.length > 0 
            ? historyMessages.map(msg => {
                const role = msg instanceof HumanMessage ? 'Użytkownik' : 'Asystent';
                return `${role}: ${msg.content}`;
              }).join('\n')
            : 'Brak poprzedniej historii rozmowy.';

        const messages = await promptTemplate.invoke({
            context: state.processedContent, 
            question: state.question,
            chat_history: historyString,
        })

        const response = await llm.invoke(messages);
        const answer = response.content as string;

        await chatHistory.addUserMessage(state.question);
        await chatHistory.addAIMessage(answer);

        return { answer }
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

    const result = await graph.invoke(
        { url, question },
        { configurable: { sessionId: session } }
    );

    return result.answer
}