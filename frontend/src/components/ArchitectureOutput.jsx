import React, { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { Cpu, GitBranch, Share2, Database, AlertTriangle } from "lucide-react";

// Initialize Mermaid.js configuration
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    themeVariables: {
      background: "#090d16",
      primaryColor: "#6366f1",
      primaryTextColor: "#f8fafc",
      lineColor: "#22314d",
      secondaryColor: "#06b6d4"
    }
  });
} catch (e) {
  console.error("Failed to initialize Mermaid:", e);
}

// Subcomponent to render Mermaid code safely
function MermaidRenderer({ chart }) {
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!chart) {
      setSvgContent("");
      return;
    }
    setError(null);
    setSvgContent("");

    // Create unique ID for the rendering run
    const elementId = `mermaid-render-${Math.floor(Math.random() * 100000)}`;

    const renderChart = async () => {
      try {
        const cleanChart = chart.replace(/```mermaid/g, "").replace(/```/g, "").trim();
        const { svg } = await mermaid.render(elementId, cleanChart);
        setSvgContent(svg);
      } catch (err) {
        console.error("Mermaid rendering failed:", err);
        setError(err.message || "Syntactical diagram parse error.");
        
        // Remove standard generated elements from DOM if they failed
        const badEl = document.getElementById(elementId);
        if (badEl) badEl.remove();
        const bindEl = document.getElementById(`d${elementId}`);
        if (bindEl) bindEl.remove();
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div style={{ width: "100%" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "var(--accent-warning)",
          fontSize: "0.813rem",
          marginBottom: "0.5rem",
          backgroundColor: "rgba(245, 158, 11, 0.05)",
          padding: "0.5rem 0.75rem",
          borderRadius: "4px",
          border: "1px solid rgba(245, 158, 11, 0.2)"
        }}>
          <AlertTriangle size={16} />
          <span>Could not render diagram canvas. Showing raw markup instead.</span>
        </div>
        <pre style={{
          fontSize: "0.813rem",
          fontFamily: "var(--font-mono)",
          color: "var(--text-secondary)",
          background: "var(--bg-app)",
          padding: "1rem",
          borderRadius: "6px",
          overflowX: "auto"
        }}>
          {chart}
        </pre>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--text-muted)", fontSize: "0.813rem" }}>
        <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", marginBottom: 0 }}></div>
        <span>Rendering diagram workspace...</span>
      </div>
    );
  }

  return (
    <div 
      className="mermaid-container"
      ref={containerRef} 
      dangerouslySetInnerHTML={{ __html: svgContent }} 
    />
  );
}

export default function ArchitectureOutput({ data }) {
  const [activeTab, setActiveTab] = useState("design");

  const tabs = [
    { id: "design", label: "System Design", icon: Cpu },
    { id: "relations", label: "Code Relationships", icon: GitBranch },
    { id: "uml", label: "UML Diagrams", icon: Share2 },
    { id: "er", label: "Data Schemas (ER)", icon: Database }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tabs */}
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

      {/* Tab Panel contents */}
      <div className="output-content">
        {activeTab === "design" && (
          <div>
            <div className="card">
              <div className="card-title">Architectural System Overview</div>
              <p style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap"
              }}>
                {data?.system_design || "No design overview was generated."}
              </p>
            </div>

            <div className="card">
              <div className="card-title">Data Flow Sequencing</div>
              <p style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap"
              }}>
                {data?.data_flow || "No data flow details generated."}
              </p>
            </div>
          </div>
        )}

        {activeTab === "relations" && (
          <div className="card">
            <div className="card-title">Component-Level Interactions</div>
            {(!data?.relationships || data.relationships.length === 0) ? (
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                No relationships or calls found inside the provided scope.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {data.relationships.map((rel, index) => (
                  <div key={index} style={{
                    backgroundColor: "rgba(9, 13, 22, 0.4)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem"
                  }}>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", fontSize: "0.813rem" }}>
                      <code style={{ color: "var(--accent-secondary)", fontWeight: 600 }}>{rel.caller}</code>
                      <span style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        backgroundColor: "rgba(99, 102, 241, 0.15)",
                        color: "var(--accent-primary)",
                        padding: "0.05rem 0.4rem",
                        borderRadius: "4px",
                        fontStyle: "italic"
                      }}>{rel.relationship_type}</span>
                      <code style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{rel.callee}</code>
                    </div>
                    <div style={{ fontSize: "0.813rem", color: "var(--text-secondary)" }}>
                      {rel.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "uml" && (
          <div className="card">
            <div className="card-title">Interactive UML Sequence / Class Diagram</div>
            {data?.uml_diagram ? (
              <MermaidRenderer chart={data.uml_diagram} />
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                No UML diagram definition is available.
              </p>
            )}
          </div>
        )}

        {activeTab === "er" && (
          <div className="card">
            <div className="card-title">Entity Relationships & Schema Structures</div>
            {data?.er_diagram ? (
              <MermaidRenderer chart={data.er_diagram} />
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                No database relationships or entity-relationship configurations found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
