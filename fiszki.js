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
    
    model: "gpt-5-mini",
})

//tworzenie schematu prompta w miejsce website zostanie załadowana treśc strony
const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a teacher creating a set of short questions and brief answers. You provide the questions and answers in the following format: @@@ question1 ### answer1 @@@ question2 ### answear2 @@@  example: @@@ In what year was JavaScript invented? ### 1995 @@@ Who created the theory of relativity? ### Albert Einstein @@@ "],
  [
    "user",
    "Create a set of 10 sets questions and answers about the given website website: {website}"
  ]
]);

//tworzenie prompta. Do schematu prompta daje konkretną tresc strony
const promptValue = await chatPrompt.invoke({ website: tekst });

//otrzymanie odpowiedzi na prompt
const response = await model.invoke(promptValue);
//wystwietlenie odpowiedzi
console.log(response.content)
console.log(typeof response.content)
console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiii")

// wyciagam z odpowiedzi modela tylko string z odpowiedzia
const responseString = response.content
console.log(typeof responseString)

// rozdzielam jeden wielki string response na liste zlaczonych pytan i odpowiedzi
const zestawy = responseString.split("@@@");
console.log(zestawy);

// rozdzielam stringi wewnatrz listy na pytania i odpowiedzi
const pytania_i_odpowiedzi = zestawy.map(element => element.split("###"));
console.log(pytania_i_odpowiedzi);
//pytania_i_odpowiedzi jest listą list , gdzie wewnętrzne listy składają się z dwóch elementów: 
// pierwszy jest pytaniem, drugi jest odpowiedzią na nie
// jedyny problem to że zdażają się puste listy to będzie trzeba je usunąć
// warto byłoby sprawdzić czy te pytania i odpowiedzi mają sens


