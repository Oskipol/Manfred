import { model } from "@/ai/chain";
import { Document } from "@langchain/core/documents";
import { promptTemplate } from "./promptTemplate";
export async function summarize(retriever: any) {
    const docs = await retriever.getRelevantDocuments('');
    const context = docs.map((d: Document) => d.pageContent).join('\n')

    const messages = await promptTemplate(context, "Summarize the page")
    const llm = model
    console.log('generowanie odpowiedzi')
    const summary = await llm.generate([messages])
    return summary.generations[0][0].text
}