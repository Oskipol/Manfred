import { ChatOpenAI } from "@langchain/openai";

export const model = new ChatOpenAI({
    openAIApiKey: "KLUCZ_API",
    model: "gpt-5-nano",
    streaming: true,
});

