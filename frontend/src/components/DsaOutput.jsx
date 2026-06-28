import React, { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, CheckSquare, HelpCircle } from "lucide-react";

export default function DsaOutput({ data }) {
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="output-content" style={{ padding: "1.5rem" }}>
      {/* Underlying Logic overview */}
      <div className="card">
        <div className="card-title" style={{ color: "var(--text-primary)" }}>
          <BookOpen size={16} style={{ color: "var(--accent-secondary)" }} />
          <span>Underlying Algorithmic Logic</span>
        </div>
        <p style={{
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap"
        }}>
          {data?.underlying_logic || "No algorithmic breakdown generated."}
        </p>
      </div>

      {/* Accordion Questions */}
      <div className="card">
        <div className="card-title" style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
          <HelpCircle size={16} style={{ color: "var(--accent-primary)" }} />
          <span>Targeted Technical Interview Questions</span>
        </div>

        {(!data?.questions || data.questions.length === 0) ? (
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            No interview questions generated.
          </p>
        ) : (
          <div className="dsa-accordion">
            {data.questions.map((q) => {
              const isOpen = openAccordion === q.id;
              const diffClass = q.difficulty ? q.difficulty.toLowerCase() : "medium";
              return (
                <div key={q.id} className="dsa-item">
                  <button className="dsa-trigger" onClick={() => toggleAccordion(q.id)}>
                    <div className="dsa-header-left">
                      <span className={`dsa-badge ${diffClass}`}>
                        {q.difficulty || "Medium"}
                      </span>
                      <span style={{ fontWeight: 600 }}>Question {q.id}: {q.concept}</span>
                    </div>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isOpen && (
                    <div className="dsa-content">
                      <div className="dsa-concept">Core Focus: {q.concept}</div>
                      <div style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: "0.938rem", marginBottom: "0.75rem" }}>
                        {q.question}
                      </div>
                      
                      <div className="dsa-hints-title">
                        <CheckSquare size={13} style={{ display: "inline", marginRight: "0.25rem", verticalAlign: "middle", color: "var(--accent-success)" }} />
                        Expected Key Points / Answer Guidelines:
                      </div>
                      <div 
                        className="dsa-hints"
                        style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)", marginTop: "0.35rem", lineHeight: "1.5" }}
                      >
                        {q.expected_answer_hints}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
