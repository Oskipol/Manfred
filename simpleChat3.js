import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import fs from "fs/promises";


const tekst = await fs.readFile("website.txt", "utf8");
// można podejrzzec czy dobrze nam się strona pobrała
//console.log(tekst);

//model -> nazwa modelu ktory używamy, mozna eksperymentować z roznymi modelami tylko nie z chat 5
// openAIApiKey powinno teoretycznie przyjmowac wartosc klucz
// pozniej mozna jeszcze dodać takie parametry jak temperature(kontrola kreatywności i halucynacjii), 
// tokens ilosc maksymalnie uzytych tokenów
const model = new ChatOpenAI({
    
    model: "o4-mini",
})

//tworzenie schematu prompta w miejsce website zostanie załadowana treśc strony
const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant that summarizes websites."],
  [
    "user",
    "Summarize the page in less than 700 characters. This should be a continuous text. Highlight the most important information. website: {website}"
  ]
]);

//tworzenie prompta. Do schematu prompta daje konkretną tresc strony
const promptValue = await chatPrompt.invoke({ website: tekst });

//otrzymanie odpowiedzi na prompt
const response = await model.invoke(promptValue);
//wystwietlenie odpowiedzi
console.log(response.content)
