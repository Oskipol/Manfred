import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import models from "./modele";
import { OpenAI } from "openai";
import { send } from "process";
const storyCache = new Map();


export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const dane = models.find(model => model.name === message.Mymodel);
    const dl = message.ll as "l1" | "l2" | "l3";
    if (message.type === 'ustaw') {
      (async () => {
        try {
          
          const model = new ChatOpenAI({
            model: message.znajdz ? "gpt-5-nano" : (dane?.id || "gpt-4o-mini"), 
            apiKey: import.meta.env.API_KEY,
            temperature: dane?.temperature || 1,
          });
          const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", message.znajdz? "Jesteś asystentem przeszukującym internet. Dla poniższego tekstu znajdź strony o podobnej treści.  " : (dane?.sys_prompt || "You are a helpful assistant that summarizes websites.")],
            [
              "user", 
              `${message.znajdz? "Output: WYŁĄCZNIE pełne linki URL, odzielaj każdy link z kolei znakiem <br>, bez numeracji, bez opisu, bez dodatkowego komentarza, możliwie jak najbardziej aktualne artykuły.  Jeśli nie ma wyników — wypisz dokładnie: NO_RESULTS.  Wyniki mogą być wyłącznie po polsku lub po angielsku. Odrzuć wszystkie strony w innych językach.  Tekst do przeszukania:":(dane?.prompt || "Summarize the following webpage in a lively, creative, and easy-to-read way. - Length: • Short → 1–2 punchy sentences with a hook.  - Make it engaging, not dry.  - Use a storytelling tone that captures the reader’s attention.  - Highlight the most important insights while keeping the language simple and memorable.  ")} ${dane?.[dl] || ""} ${dane?.prompt2 || ""} {website}`
            ]
          ]);

          const promptValue = await chatPrompt.invoke({ website: message.tekst });
          const response = await model.invoke(promptValue);
          
          sendResponse(response.content);
        } catch (error) {
          console.error('Błąd AI:', error);
          sendResponse(`Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
        }
      })();
      
      return true; 
    }
    if(message.type==="sprawdz"){
      (async () => {
        try {
          const model = new ChatOpenAI({
            model: "gpt-4o-mini", 
            apiKey: import.meta.env.API_KEY,
            temperature: 0.1, // Niska temperatura dla konsystentnych wyników
          });
          
          const prompt = ChatPromptTemplate.fromMessages([
            ["system", `Jesteś ekspertem w ocenianiu odpowiedzi na pytania otwarte. Musisz zwrócić KONKRETNĄ odpowiedź, nie placeholder.

ALGORYTM OCENIANIA:
1. Sprawdź czy odpowiedź użytkownika zawiera kluczowe informacje z tekstu źródłowego
2. Uwzględnij synonimy, parafrazy i różne sposoby wyrażania tej samej myśli  
3. Oceń czy sens odpowiedzi jest zgodny z tekstem źródłowym
4. Toleruj drobne błędy językowe i stylistyczne
5. Akceptuj częściowo poprawne odpowiedzi (minimum 70% poprawności)

FORMAT ODPOWIEDZI (OBOWIĄZKOWY):
- Jeśli odpowiedź jest poprawna/częściowo poprawna: "1;Świetnie! [konkretny pozytywny komentarz]"
- Jeśli odpowiedź jest błędna: "0;[tutaj wpisz pełną, prawidłową odpowiedź na podstawie tekstu źródłowego bez znaku ;]"

PRZYKŁADY POPRAWNYCH ODPOWIEDZI:
- "1;Świetnie! Prawidłowo wskazałeś że Warszawa jest stolicą Polski."
- "0;Prawidłowa odpowiedź to: Warszawa jest stolicą Polski od 1596 roku i liczy około 1,8 miliona mieszkańców."

NIGDY nie używaj placeholderów jak "POPRAWNA_ODPOWIEDŹ" - zawsze wpisz rzeczywistą odpowiedź!`],
            ["user", `Sprawdź tę odpowiedź:

PYTANIE: ${message.pytanie}
ODPOWIEDŹ UŻYTKOWNIKA: "${message.odpowiedz}"

Na podstawie tego tekstu źródłowego:
${message.tekst}

Zwróć ocenę w wymaganym formacie z KONKRETNĄ odpowiedzią:`]
          ]);
          
          const promptValue = await prompt.invoke({});
          const response = await model.invoke(promptValue);
          
          let result = response.content.toString().trim();
          
          if (!result.match(/^[01];/)) {
            if (result.toLowerCase().includes('poprawna') || result.toLowerCase().includes('dobra')) {
              result = `1;${result}`;
            } else {
              result = `0;${result}`;
            }
          }
          
          const parts = result.split(';', 2);
          if (parts.length > 1) {
            const feedback = parts[1];
          if (feedback.includes('POPRAWNA_ODPOWIEDŹ') || 
                feedback.includes('FEEDBACK_DLA_UŻYTKOWNIKA') ||
                feedback.includes('[') && feedback.includes(']')) {
              
          if (parts[0] === '1') {
                result = '1;Odpowiedź została zaakceptowana.';
              } else {
                const shortAnswer = message.tekst.substring(0, 150) + '...';
                result = `0;Na podstawie tekstu: ${shortAnswer}`;
              }
            }
          }
          
          const finalParts = result.split(';');
          if (finalParts.length > 1 && finalParts[1].length > 200) {
            finalParts[1] = finalParts[1].substring(0, 197) + '...';
            result = finalParts.join(';');
          }
          
          sendResponse(result);
        } catch (error) {
          console.error('Błąd w przetwarzaniu wiadomości "sprawdz":', error);
          sendResponse("0,Wystąpił błąd podczas sprawdzania odpowiedzi. Spróbuj ponownie.");
        }
      })();

      return true;
    }
    if(message.type==="fisz") {
      (async () => {
        try{
          const dane2= models.find(model => model.name === "fiszki");
          const model = new ChatOpenAI({
            model: "gpt-4o-mini", 
            apiKey: import.meta.env.API_KEY,
          });
          const prompt = ChatPromptTemplate.fromMessages([
            ["system", dane2?.sys_prompt || ""],
            ["user", `${dane2?.prompt || ""} {tekst}`]
          ]);
          const promptValue = await prompt.invoke({ tekst: message.tekst });
          const response = await model.invoke(promptValue);
          
          
          try {

            let cleanedContent = response.content.toString().trim();
            
            if (cleanedContent.startsWith('```json')) {
              cleanedContent = cleanedContent.replace(/^```json\s*/, '');
            }
            if (cleanedContent.startsWith('```')) {
              cleanedContent = cleanedContent.replace(/^```\s*/, '');
            }
            if (cleanedContent.endsWith('```')) {
              cleanedContent = cleanedContent.replace(/\s*```$/, '');
            }
            
            
            const storyData1 = JSON.parse(cleanedContent);
            sendResponse(cleanedContent);
            
          } catch (parseError) {
            console.error('❌ Błąd parsowania JSON:', parseError);
            console.error('❌ Problematyczna treść:', response.content.toString().substring(0, 200) + '...');
            sendResponse("Błąd: AI nie zwróciło poprawnego JSON");
          }
          
        } catch (error) {
          console.error('❌ Błąd w przetwarzaniu wiadomości "fisz":', error);
          sendResponse("Błąd przetwarzania fiszek");
        }
      })();

      return true;
    }
    if (message.type === 'generateStory') {
      (async () => {
        try {
          const { gameState } = message;
          const tabs = await chrome.tabs.query({active: true, currentWindow: true});
          const currentUrl = tabs[0]?.url || '';
          
          const contentComplexity = Math.min(10, Math.max(3, Math.floor(gameState.text.length / 500)));
          const shouldFinish = gameState.chapter >= contentComplexity || gameState.chapter >= 101;

          const dane = models.find(model => model.name === "story") || models[0];
          
          const llm = new ChatOpenAI({
            model: "gpt-4o-mini",
            apiKey: import.meta.env.API_KEY,
            temperature: .7,
          });

          const baseLevel = Math.max(5, gameState.chapter * 5 + Math.floor(Math.random() * 10));
          const easyChoice = Math.max(1, gameState.level - 5);
          const normalChoice = gameState.level + 2;
          const hardChoice = gameState.level + 8;

          const systemPrompt = `Jesteś Narratorem i tworzysz interaktywną historię fantasy na podstawie tekstu źródłowego. 
Twoim celem jest uczyć gracza, wplatając wiedzę w fabułę w angażujący sposób.

Zasady ogólne:
- Historia podzielona jest na rozdziały (chapter).
- Każdy rozdział = maksymalnie 3–4 zdania narracji.
- Narracja MUSI zawierać element edukacyjny (knowledge) pochodzący ze źródła.
- Knowledge:
  • ma być naturalnie wplecioną częścią fabuły (nie oddzielny wykład).  
  • bohaterowie, miejsca, artefakty, dialogi lub wydarzenia mają być nośnikiem wiedzy.  
  • w każdym rozdziale przekaż jak najwięcej kluczowych informacji ze źródła.  
  • używaj prostych metafor i obrazowych porównań, żeby ułatwić zapamiętanie.  
  • jeśli treść jest techniczna (np. nauki ścisłe) → przedstaw ją jako magia, artefakt, zaklęcie.  
  • jeśli humanistyczna (historia, literatura) → jako opowieści, pieśni bardów, inskrypcje, rozmowy.
- Unikaj kopiowania treści ze źródła – zawsze przekształcaj je w fabularne, kreatywne obrazy, ale nazw, imion i terminów nie zmieniaj.
- Każdy rozdział kończy się 2–3 wyborami gracza (choices), które pomagają lepiej zrozumieć wiedzę.
- Dodaj pole choice_levels → liczby poziomów wymaganych dla każdego wyboru.
- Każdy rozdział ma required_level rosnący wraz z chapterem, jednak na jednym chapterze poziomy wyborów MUSZĄ być różne:
  • Chapter 1 = lvl 1
  • Chapter 2 = lvl 5–10
  • Chapter 3 = lvl 15–20
  • …aż do max lvl 100.
- Historia musi zmierzać ku zakończeniu:
  • Jeśli treść źródłowa się wyczerpie → zamknij opowieść.  
  • Jeśli chapter > 10 → zakończ historię w ostatnim rozdziale.
- Odpowiedz TYLKO czystym JSON (bez dodatkowych komentarzy, bez \`\`\`).
- title: max 4 słowa, chwytliwe, oddające klimat rozdziału.
- image_prompt: opis sceny z rozdziału w stylu Darkest Dungeon (mroczny, gotycki, kreskówkowy klimat).
- WAŻNE: choices muszą być tablicą stringów, NIE obiektów!
- Struktura: chapter, required_level, narration, knowledge, choices, choice_levels, image_prompt, title`;

          const finishPrompt = shouldFinish ? "TO OSTATNI ROZDZIAŁ! Zakończ historię. Ustaw choices i choice_levels na puste tablice." : "";

          const userContent = `Treść edukacyjna: ${gameState.text}
KLUCZOWE ZASADY:
1. Każdy rozdział eksploruje INNY fragment treści edukacyjnej.  
2. Narracja musi się rozwijać logicznie, a bohater zmieniać i przechodzić nowe wyzwania.  
3. NIE wolno powtarzać sytuacji, lokacji, ani wiedzy z poprzednich rozdziałów.  
4. Każdy rozdział MUSI zawierać nowy aspekt edukacyjny.

PROGRESJA FABUŁY:
- Rozdziały 1–2: wprowadzenie świata i pierwsze wyzwania.  
- Rozdziały 3–4: rozwój konfliktu, nowe lokacje.  
- Rozdziały 5–6: komplikacje, głębsze zrozumienie tematu.  
- Rozdziały 7–8: kulminacja, najtrudniejsze wyzwania.  
- Rozdziały 9+: rozwiązanie konfliktów, finał.  

KONTEKST GRY:
- Aktualny rozdział: ${gameState.chapter}
- Poziom gracza: ${gameState.level}
- Poprzednie rozdziały i wybory: ${gameState.history.join(' → ')}
- Ostatnie wybory gracza: ${gameState.choices.slice(-3).join(', ')}

WAŻNE ZASADY:
- NIE POWTARZAJ treści z poprzednich rozdziałów
- Każdy rozdział musi wprowadzać NOWY WAŻNY aspekt z treści edukacyjnej
- Narracja musi ROZWIJAĆ historię, nie powtarzać ją
- Jeśli to rozdział ${gameState.chapter}, skup się na ${gameState.chapter === 1 ? 'wprowadzeniu bohatera' : gameState.chapter === 2 ? 'pierwszym wyzwaniu' : gameState.chapter === 3 ? 'rozwijaniu fabuły' : 'nowych komplikacjach'}

UŻYTE TEMATY DO UNIKANIA: ${gameState.history.length > 0 ? 'Unikaj ponownego używania tych tematów: ' + gameState.history.map((h: string) => h.split(':')[1]).join(', ') : 'Brak poprzednich tematów'}

${finishPrompt}

Stwórz UNIKATOWY rozdział fantasy z NOWYM aspektem edukacyjnym!`;

          const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
          ];

          const response = await llm.invoke(messages);
          
          let storyData;
          try {
            const cleanResponse = response.content.toString().replace(/```json\s*|\s*```/g, '').trim();
            storyData = JSON.parse(cleanResponse);
            
            const baseLevel = Math.max(1, gameState.chapter * 8 - 3);
            const maxLevel = Math.min(100, baseLevel + 15);
            storyData.required_level = Math.max(baseLevel, Math.min(maxLevel, storyData.required_level || baseLevel));
            
         
            if (storyData.choices && Array.isArray(storyData.choices)) {
              storyData.choices = storyData.choices.map((choice: any) => {
                if (typeof choice === 'object' && choice !== null) {
                  return choice.choice || choice.text || choice.name || 'Wybór';
                }
                return String(choice);
              });
            }
           
            
          } catch (parseError) {
            console.error('Błąd parsowania JSON:', parseError);
            sendResponse({
              success: false,
              error: "Błąd formatowania odpowiedzi AI"
            });
            return;
          }

          sendResponse({
            success: true,
            story: storyData,
            isFinished: shouldFinish || !storyData.choices || storyData.choices.length === 0
          });

        } catch (error) {
          console.error('Błąd generowania historii:', error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Nieznany błąd'
          });
        }
      })();
      
      return true;
    }
    if (message.type === 'obraz') {
      (async () => {
        try {
          const openai = new OpenAI({ apiKey: import.meta.env.API_KEY });
          const response = await openai.images.generate({model: "dall-e-3", n: 1, prompt: message.prompt, size: "1024x1024", quality: "standard", style: "vivid"});
          if (response.data && response.data[0] && response.data[0].url) {
            sendResponse({ success: true, url: response.data[0].url });
          } else {
            sendResponse({
              success: false,
              error: "Brak danych obrazu lub URL"
            });
          }
        } catch (error) {
          console.error('Błąd generowania obrazu:', error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Nieznany błąd'
          });
        }
      })();
      return true;
    }
  });
});



