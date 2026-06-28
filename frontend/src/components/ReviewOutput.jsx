import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check, ShieldAlert, Cpu, Layers, Bug, ClipboardCheck } from "lucide-react";

export default function ReviewOutput({ data, language }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (data?.optimized_code) {
      navigator.clipboard.writeText(data.optimized_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview & Complexity", icon: Cpu },
    { id: "security", label: "Security & Syntax", icon: ShieldAlert },
    { id: "linebyline", label: "Line-by-Line", icon: Layers },
    { id: "optimized", label: "Optimized Code", icon: Bug }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tab bar */}
      <div className="tab-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Icon size={14} />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab contents */}
      <div className="output-content">
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="card" style={{ borderLeft: "4px solid var(--accent-primary)" }}>
                <div className="card-title">
                  <Cpu size={16} style={{ color: "var(--accent-primary)" }} />
                  <span>Time Complexity</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.5rem 0", color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                  {data?.complexity?.time || "N/A"}
                </div>
                <div style={{ fontSize: "0.813rem", color: "var(--text-secondary)" }}>
                  Asymptotic runtime complexity behavior.
                </div>
              </div>

              <div className="card" style={{ borderLeft: "4px solid var(--accent-secondary)" }}>
                <div className="card-title">
                  <Layers size={16} style={{ color: "var(--accent-secondary)" }} />
                  <span>Space Complexity</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.5rem 0", color: "var(--accent-secondary)", fontFamily: "var(--font-mono)" }}>
                  {data?.complexity?.space || "N/A"}
                </div>
                <div style={{ fontSize: "0.813rem", color: "var(--text-secondary)" }}>
                  Total memory allocations required.
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Bottleneck Explanation</div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {data?.complexity?.explanation || "No explanation provided."}
              </p>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div>
            {/* Syntax Errors Card */}
            <div className="card">
              <div className="card-title" style={{ color: "var(--text-primary)" }}>
                Syntax & Code Quality Issues
              </div>
              {(!data?.syntax_errors || data.syntax_errors.length === 0) ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  backgroundColor: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "6px",
                  color: "#a7f3d0",
                  fontSize: "0.875rem"
                }}>
                  <ClipboardCheck size={18} style={{ color: "var(--accent-success)" }} />
                  <span>No syntax errors or compiler warnings detected in this review.</span>
                </div>
              ) : (
                data.syntax_errors.map((err, idx) => (
                  <div key={idx} style={{
                    borderLeft: `3px solid ${err.severity === "error" ? "var(--accent-danger)" : "var(--accent-warning)"}`,
                    backgroundColor: err.severity === "error" ? "rgba(239, 68, 68, 0.05)" : "rgba(245, 158, 11, 0.05)",
                    padding: "0.75rem 1rem",
                    borderRadius: "0 6px 6px 0",
                    marginBottom: "0.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start"
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: err.severity === "error" ? "#fda4af" : "#fde047" }}>
                        {err.severity === "error" ? "Compilation Error" : "Style Warning"}
                      </div>
                      <div style={{ fontSize: "0.813rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        {err.description}
                      </div>
                    </div>
                    {err.line && <span className="line-badge">Line {err.line}</span>}
                  </div>
                ))
              )}
            </div>

            {/* Security Vulnerabilities Card */}
            <div className="card">
              <div className="card-title" style={{ color: "var(--text-primary)" }}>
                Security Vulnerabilities
              </div>
              {(!data?.security_vulnerabilities || data.security_vulnerabilities.length === 0) ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  backgroundColor: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "6px",
                  color: "#a7f3d0",
                  fontSize: "0.875rem"
                }}>
                  <ClipboardCheck size={18} style={{ color: "var(--accent-success)" }} />
                  <span>No security exploits or vulnerabilities (SQLi, eval, etc.) found.</span>
                </div>
              ) : (
                data.security_vulnerabilities.map((vuln, idx) => (
                  <div key={idx} className="vuln-item">
                    <div className="vuln-header">
                      <span className="vuln-title">{vuln.type}</span>
                      {vuln.line && <span className="line-badge">Line {vuln.line}</span>}
                    </div>
                    <div className="vuln-desc">{vuln.description}</div>
                    <div className="vuln-remediation">Remediation: {vuln.remediation}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "linebyline" && (
          <div className="card" style={{ padding: "0.75rem" }}>
            {(!data?.line_by_line || data.line_by_line.length === 0) ? (
              <p style={{ padding: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                No line-by-line annotations generated.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="explain-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Line</th>
                      <th style={{ width: "35%" }}>Code Snippet</th>
                      <th>Logical Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.line_by_line.map((item, idx) => (
                      <tr key={idx}>
                        <td className="explain-line-num">{item.line}</td>
                        <td className="explain-code"><code>{item.code}</code></td>
                        <td className="explain-text">{item.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "optimized" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "450px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem"
            }}>
              <span style={{ fontSize: "0.813rem", color: "var(--text-secondary)" }}>
                AI Refactored, Cleaned, & Hardened version:
              </span>
              <button
                className="btn"
                onClick={handleCopy}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.75rem",
                  backgroundColor: copied ? "rgba(16, 185, 129, 0.15)" : "var(--bg-surface-elevated)",
                  color: copied ? "var(--accent-success)" : "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px"
                }}
              >
                {copied ? (
                  <>
                    <Check size={12} style={{ marginRight: "0.25rem" }} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={12} style={{ marginRight: "0.25rem" }} /> Copy Code
                  </>
                )}
              </button>
            </div>
            
            <div style={{ flex: 1, border: "1px solid var(--border-color)", borderRadius: "6px", overflow: "hidden", minHeight: "350px" }}>
              <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                theme="vs-dark"
                value={data?.optimized_code || ""}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  wordWrap: "on",
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
