import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    openAIApiKey: "KLUCZ_API",
    model: "gpt-5-nano",
});

