import { ChatOpenAI } from "@langchain/openai";

//model -> nazwa modelu ktory używamy, mozna eksperymentować z roznymi modelami tylko nie z %
// openAIApiKey powinno teoretycznie przyjmowac wartosc klucz
// pozniej mozna jeszcze dodać takie parametry jak temperature(kontrola kreatywności i halucynacjii), 
// tokens ilosc maksymalnie uzytych tokenów
const model = new ChatOpenAI({
    openAIApiKey: "wpisz w te miejsce klucz",
    model: "o4-mini",
})

//w nawiasie po invoke należy wpisać pytanie jakie chce się zadać chatu
// mozna tam też wsadzic zmienną typu string z treścia pytania
// sluzy do tego funkcja prompt templates
const response = model.invoke('Hello')
console.log(response)

//problem jest taki, że wiele wersji ignoruje mozliwosc dodania recznie klucz
// i wymaga go jako zmiennej srodowiskowej