
export async function playOpenAITTS(text: string, voice: string = "onyx") {
  const apiKey = import.meta.env.API_KEY; // lub pobierz z background
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice,
      response_format: "mp3"
    })
  });

  if (!response.ok) throw new Error("TTS request failed");

  // Streamuj audio do AudioContext
  const audioContext = new AudioContext();
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, val) => acc + val.length, 0);
  const audioData = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    audioData.set(chunk, offset);
    offset += chunk.length;
  }
  const audioBuffer = await audioContext.decodeAudioData(audioData.buffer);

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
}