// src/components/ai/OminiChatWidget.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  RiSparkling2Fill,
  RiCloseLine,
  RiSendPlane2Fill,
  RiFileCopyLine,
  RiCheckLine,
  RiLock2Line,
  RiArrowRightUpLine,
  RiCompass3Line,
  RiRefreshLine,
} from "react-icons/ri";
import { API_BASE_URL } from "../../constants/api";

function formatMarkdown(content) {
  if (!content) return "";
  // Simple, resilient markdown renderer that doesn't require heavy dependencies
  const lines = content.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${idx}`}
            className="my-2 p-3 rounded-lg text-xs font-mono overflow-x-auto select-all"
            style={{ backgroundColor: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={idx} className="font-bold text-sm mt-3 mb-1" style={{ color: "var(--text-primary)" }}>
          {line.replace("### ", "")}
        </h4>
      );
      return;
    }
    if (line.startsWith("#### ")) {
      elements.push(
        <h5 key={idx} className="font-semibold text-xs mt-2 mb-1" style={{ color: "var(--text-primary)" }}>
          {line.replace("#### ", "")}
        </h5>
      );
      return;
    }

    // Bullet list
    if (line.startsWith("* ") || line.startsWith("- ")) {
      const text = line.substring(2);
      elements.push(
        <li key={idx} className="ml-4 list-disc text-xs my-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {parseInlineFormatting(text)}
        </li>
      );
      return;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={idx} className="ml-4 list-decimal text-xs my-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {parseInlineFormatting(line.replace(/^\d+\.\s/, ""))}
        </li>
      );
      return;
    }

    // Normal paragraph
    if (line.trim().length > 0) {
      elements.push(
        <p key={idx} className="text-xs my-1 leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {parseInlineFormatting(line)}
        </p>
      );
    } else {
      elements.push(<div key={idx} className="h-1" />);
    }
  });

  return elements;
}

function parseInlineFormatting(text) {
  // Handles **bold** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold" style={{ color: "var(--text-primary)" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded text-[11px] font-mono"
          style={{ backgroundColor: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", color: "var(--accent-primary)" }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function OminiChatWidget() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isAllowed, setIsAllowed] = useState(true);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hello! I am **Omini**, your growth and outreach copilot inside OmniPlus+.\n\nAsk me about safe WhatsApp warming, cold email copy formulas, overcoming Google Maps result caps, or debugging your campaigns!",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const messagesEndRef = useRef(null);

  // Check license status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/omini/status`);
        if (res.data) {
          setIsAllowed(Boolean(res.data.allowed));
        }
      } catch (err) {
        // Fallback to checking general license info
        try {
          const licRes = await axios.get(`${API_BASE_URL}/system/license`);
          const tier = licRes.data?.license?.tier || "";
          setIsAllowed(tier.includes("Suite") || tier.includes("Pro") || tier.includes("All-in-One"));
        } catch {
          setIsAllowed(true);
        }
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleLauncherClick = () => {
    if (!isAllowed) {
      setShowLockedModal(true);
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setInputPrompt("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/omini/chat`, {
        messages: newMessages,
        currentRoute: location.pathname,
      });

      if (res.data?.reply?.text) {
        setMessages([...newMessages, { role: "assistant", content: res.data.reply.text }]);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setIsAllowed(false);
        setShowLockedModal(true);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "⚠️ I encountered a temporary connection issue. Please verify your settings or try again.",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const quickPrompts = [
    { label: t("omini.prompt_cold_email", "Write a high-converting cold email"), prompt: "Can you write a high-converting, 50-word cold outreach email template with personalization variables?" },
    { label: t("omini.prompt_whatsapp_warmup", "Safe WhatsApp warmup schedule"), prompt: "What is the safest warmup schedule for a new WhatsApp number to prevent number bans?" },
    { label: t("omini.prompt_gmap_matrix", "Tips for Google Maps grid scraper"), prompt: "How should I structure postal codes and sub-regions in the Google Maps Grid Matrix tool to get 500+ leads?" },
  ];

  return (
    <>
      {/* Floating Circular Launcher */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={handleLauncherClick}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer grad-bg"
          style={{
            boxShadow: "0 8px 30px rgba(124, 58, 237, 0.45)",
          }}
          title="Omini AI Copilot"
        >
          {isOpen ? (
            <RiCloseLine className="text-2xl text-white transition-transform group-hover:rotate-90" />
          ) : (
            <RiSparkling2Fill className="text-2xl text-white animate-pulse" />
          )}

          {/* Locked Badge if on free tier */}
          {!isAllowed && (
            <span
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-amber-300 bg-amber-500 text-[10px] text-white shadow"
              title="Locked for Free tier"
            >
              <RiLock2Line />
            </span>
          )}

          {/* Pulse animation ring */}
          <span className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-30 animate-ping pointer-events-none" />
        </button>
      </div>

      {/* Slide-Over Chat Drawer */}
      {isOpen && (
        <aside
          className="fixed bottom-24 right-6 z-50 flex h-[620px] w-[420px] max-w-[calc(100vw-32px)] flex-col rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl transition-all duration-300"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Drawer Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{
              backgroundColor: "var(--bg-surface-2)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="grad-ring flex h-9 w-9 items-center justify-center rounded-xl text-white shadow">
                <RiSparkling2Fill className="text-base" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {t("omini.title", "Omini AI Copilot")}
                  </h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: "rgba(147, 51, 234, 0.15)", color: "var(--accent-primary)" }}
                  >
                    PRO
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <RiCompass3Line />
                  <span className="truncate max-w-[200px]">{location.pathname}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([messages[0]])}
                title="Reset conversation"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <RiRefreshLine />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <RiCloseLine className="text-lg" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div
            className="flex gap-2 overflow-x-auto px-4 py-2 text-xs scrollbar-none"
            style={{
              backgroundColor: "var(--bg-app)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp.prompt)}
                disabled={loading}
                className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer"
                style={{
                  backgroundColor: "var(--bg-surface-2)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-primary)";
                  e.currentTarget.style.color = "var(--accent-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((m, idx) => {
              const isAssistant = m.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                >
                  <div
                    className="relative group max-w-[90%] rounded-2xl p-3.5 shadow-sm"
                    style={
                      isAssistant
                        ? {
                            backgroundColor: "var(--bg-surface-2)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                          }
                        : {
                            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                            color: "#ffffff",
                          }
                    }
                  }
                >
                  {isAssistant ? (
                    <div>{formatMarkdown(m.content)}</div>
                  ) : (
                    <p className="text-xs leading-relaxed">{m.content}</p>
                  )}

                  {/* Copy Button on Assistant Bubble */}
                  {isAssistant && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.content, idx)}
                      title="Copy response"
                      className="absolute top-2 right-2 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        color: copiedIdx === idx ? "#10b981" : "var(--text-muted)",
                      }}
                    >
                      {copiedIdx === idx ? <RiCheckLine /> : <RiFileCopyLine />}
                      <span>{copiedIdx === idx ? t("omini.copied", "Copied!") : t("omini.copy", "Copy")}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 px-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <RiSparkling2Fill className="animate-spin" style={{ color: "var(--accent-primary)" }} />
              <span>Omini is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          className="p-3"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={t("omini.placeholder", "Ask Omini about lead scraping, cold email, WhatsApp anti-ban...")}
              disabled={loading}
              className="flex-1 rounded-xl px-3.5 py-2.5 text-xs outline-none transition"
              style={{
                backgroundColor: "var(--bg-surface-2)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent-primary)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-subtle)"; }}
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl grad-bg text-white transition disabled:opacity-40 cursor-pointer"
              title={t("omini.send", "Send")}
            >
              <RiSendPlane2Fill className="text-sm" />
            </button>
          </form>
        </div>
      </aside>
    )}

    {/* Locked Tier Teaser Modal */}
    {showLockedModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center items-center"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl grad-ring text-white shadow-lg">
            <RiLock2Line className="text-2xl" />
          </div>

          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {t("omini.locked_title", "Omini AI Copilot Locked")}
            </h3>
            <p className="text-xs mt-1 leading-relaxed max-w-xs" style={{ color: "var(--text-secondary)" }}>
              {t(
                "omini.locked_desc",
                "Omini AI Copilot is an exclusive feature for Outreach Pro & Omni All-in-One Suite license holders. Unlock real-time campaign copy, anti-ban pacing advice, and extraction tips."
              )}
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowLockedModal(false);
                navigate("/settings");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl grad-bg py-2.5 text-sm font-semibold text-white shadow-lg cursor-pointer"
            >
              <span>{t("omini.upgrade_cta", "Upgrade License to Unlock")}</span>
              <RiArrowRightUpLine />
            </button>
            <button
              type="button"
              onClick={() => setShowLockedModal(false)}
              className="py-2 text-xs transition cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
