import { pull } from 'langchain/hub'
import { ChatPromptTemplate } from '@langchain/core/prompts'

export async function promptTemplate(context: string, question: string) {
    const promptTemplate = await pull<ChatPromptTemplate>('rlm/rag-prompt');

    const examplePrompt = await promptTemplate.invoke({
        context: context,
        question: question,
    });

    const exampleMessages = examplePrompt.messages;

    return exampleMessages
}