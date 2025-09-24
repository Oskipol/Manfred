import { useState } from "react";

const Roadmapa = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [session] = useState("moja-sesja-123"); // ID sesji

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://pl.wikipedia.org/wiki/Polska_na_Dru%C5%BCynowych_Mistrzostwach_Europy_w_Lekkoatletyce_2010", // możesz zmienić na dynamiczny
          question,
          session,
        }),
      });

      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      console.error("Błąd:", err);
      setAnswer("❌ Wystąpił błąd podczas komunikacji z AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>RoadMapa - plan rozwoju</h2>
      <p>Tutaj będzie mapa</p>
      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <label>
          Zapytaj AI o roadmapę:
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ marginLeft: 8, width: 300 }}
            disabled={loading}
          />
        </label>
        <button
          type="submit"
          disabled={loading || !question}
          style={{ marginLeft: 8 }}
        >
          {loading ? "Wysyłanie..." : "Wyślij"}
        </button>
      </form>
      {answer && (
        <div
          style={{
            marginTop: 16,
            background: "#050404ff",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <strong>Odpowiedź AI:</strong>
          <div>{answer}</div>
        </div>
      )}
    </div>
  );
};

export default Roadmapa;