import React from "react";
import { Terminal, Code, Cpu, ShieldCheck } from "lucide-react";

export default function Header({
  mode,
  setMode,
  language,
  setLanguage,
  onAnalyze,
  isAnalyzing,
  apiConfigured
}) {
  const modes = [
    { id: "review", label: "Core Review", icon: ShieldCheck },
    { id: "architecture", label: "Architecture & UML", icon: Cpu },
    { id: "dsa", label: "DSA & Interview", icon: Code }
  ];

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "cpp", label: "C++" },
    { value: "java", label: "Java" },
    { value: "go", label: "Go" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "typescript", label: "TypeScript" }
  ];

  return (
    <header className="panel-header" style={{ height: "64px", padding: "0 1.5rem" }}>
      <div className="panel-title" style={{ fontSize: "1.1rem" }}>
        <Terminal size={22} className="accent-secondary" />
        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
          Antigravity <span style={{ color: "var(--accent-secondary)", fontWeight: 500 }}>CodeIQ</span>
        </span>
      </div>

      <div className="panel-controls" style={{ gap: "1rem" }}>
        {/* Mode Selector Segment */}
        <div style={{
          display: "flex",
          backgroundColor: "var(--bg-app)",
          borderRadius: "8px",
          padding: "2px",
          border: "1px solid var(--border-color)"
        }}>
          {modes.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "6px",
                  border: "none",
                  background: active ? "var(--bg-surface-elevated)" : "transparent",
                  color: active ? "var(--accent-secondary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.813rem",
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
              >
                <Icon size={14} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Language dropdown */}
        <select
          className="select-input"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {languages.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        {/* Status Indicator */}
        {!apiConfigured && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--accent-warning)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              backgroundColor: "rgba(245, 158, 11, 0.05)"
            }}
          >
            No API Key Configured
          </span>
        )}

        {/* Analyze trigger button */}
        <button
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Run Review"}
        </button>
      </div>
    </header>
  );
}
