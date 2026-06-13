"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildFinancialContext } from "@/lib/buildContext";
import type { Transaction, CreditCard, PersonalCredit } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  transactions: Transaction[];
  cards: CreditCard[];
  credits: PersonalCredit[];
}

const SUGGESTIONS = [
  "¿Cuánto estoy gastando en total este mes?",
  "¿En qué categoría gasto más?",
  "¿Cuál es mi deuda total contando tarjetas y créditos?",
  "¿Qué crédito me conviene liquidar primero?",
  "¿Cuánto pago mensualmente en compromisos financieros?",
];

export function FinChat({ transactions, cards, credits }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const systemPrompt = buildFinancialContext(transactions, cards, credits);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // Placeholder mientras espera respuesta
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: systemPrompt || undefined,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || "Error desconocido");

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: data.text };
        return updated;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al conectar con el asistente";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: msg };
        return updated;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const hasData = transactions.length > 0 || cards.length > 0 || credits.length > 0;

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 200px)", minHeight: "400px" }}>
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Asistente financiero FinBot</p>
              <p className="mt-1 text-xs text-gray-400 max-w-xs">
                {hasData
                  ? "Tengo acceso a tus datos financieros. Pregúntame lo que quieras."
                  : "Aún no tienes datos cargados. Puedes preguntar igualmente, pero sin contexto financiero."}
              </p>
            </div>
            {hasData && (
              <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2.5",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                msg.role === "user" ? "bg-gray-900" : "bg-white border border-gray-200"
              )}
            >
              {msg.role === "user" ? (
                <User size={13} className="text-white" />
              ) : (
                <Bot size={13} className="text-gray-700" />
              )}
            </div>

            {/* Burbuja */}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "rounded-tr-sm bg-gray-900 text-white"
                  : "rounded-tl-sm bg-white border border-gray-100 text-gray-800"
              )}
            >
              {msg.content === "" && msg.role === "assistant" ? (
                <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Loader2 size={12} className="animate-spin" />
                  Pensando...
                </span>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta..."
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  );
}
