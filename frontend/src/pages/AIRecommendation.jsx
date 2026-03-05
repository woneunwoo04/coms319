import React, { useState } from "react";

export default function AIRecommendation() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChatSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", text: trimmed };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextHistory,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();
      const replyText =
        data.reply?.trim() || "Sorry, I can’t generate a response right now.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: replyText },
      ]);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("❌ AI Chat Error:", err);
      setError("Our AI barista is busy. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfaf7] p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-[#a3754f]">
            AI Extras
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#3c2f2f]">
            ☕ Café Delight AI Barista
          </h1>
          <p className="text-[#6d4c3d]">
            One friendly AI now handles both live chat and curated drink & dessert picks.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="bg-white rounded-2xl shadow-md p-6 border border-[#f1e4d5] flex flex-col space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-[#3c2f2f]">
                Live Conversation + Recommendations
              </h2>
              <p className="text-sm text-[#7a5a46]">
                Share a craving, mood, or pairing question and the AI barista will reply while surfacing the best menu matches.
              </p>
            </div>

            <div className="flex-1 border rounded-xl p-4 bg-[#fffaf3] overflow-y-auto space-y-3 max-h-80">
              {messages.length === 0 && (
                <p className="text-sm text-[#9a7a64]">
                  Try typing "I need something chocolatey for dessert" to get started.
                </p>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}-${msg.text.slice(0, 6)}`}
                  className={`rounded-lg px-4 py-2 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-white border border-[#ecd8c4] text-[#3c2f2f]"
                      : "bg-[#3c2f2f] text-white self-end ml-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <form onSubmit={handleChatSubmit} className="flex gap-3">
              <input
                className="flex-grow border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d4b49c]"
                placeholder="Ask for a vibe, flavor, or pairing suggestion"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#3c2f2f] text-white rounded-lg px-4 py-2 hover:bg-[#2a1f1f] min-w-[110px]"
                disabled={loading}
              >
                {loading ? "Brewing..." : "Send"}
              </button>
            </form>

            <p className="text-xs text-[#9a7a64]">
              The conversation automatically powers the picks shown on the right.
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-md p-6 border border-[#f1e4d5] space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-[#3c2f2f]">
                Drink & Dessert Picks
              </h2>
              <p className="text-sm text-[#7a5a46]">
                Suggestions refresh every time the AI replies, blending both sips and sweets from the menu.
              </p>
            </div>

            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <div
                    key={`${rec.name}-${idx}`}
                    className="bg-[#fdf7f0] border border-[#f1e4d5] rounded-lg p-4 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#3c2f2f]">{rec.name}</h3>
                      {rec.type && (
                        <span className="text-xs uppercase tracking-[0.2em] text-[#a3754f]">
                          {rec.type === "dessert" ? "Dessert" : "Drink"}
                        </span>
                      )}
                    </div>
                    <p className="text-[#5c4637] text-sm">{rec.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#9a7a64]">
                  Ask the barista something tasty to see curated picks appear here.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
