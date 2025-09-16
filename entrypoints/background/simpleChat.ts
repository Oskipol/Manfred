import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "@/ai/chain";

export async function summarizeWeb(retriever: any): Promise<string> {
    const relevantDocs = await retriever.getRelevantDocs('main content')

    const webContent = relevantDocs.map((doc: any) => doc.pageContent).join('\n\n')

    const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant that summarizes websites."],
    [
        "user",
        "Summarize the page in less than 700 characters. This should be a continuous text. Highlight the most important information. website: {website}"
    ]
    ]);

    const promptValue = await chatPrompt.invoke({ website: webContent});

    const response = await model.invoke(promptValue);

    return response.content as string;
}