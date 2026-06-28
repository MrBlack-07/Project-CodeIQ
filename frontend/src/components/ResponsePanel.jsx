import React from "react";
import { AlertCircle, Terminal, HelpCircle } from "lucide-react";
import ReviewOutput from "./ReviewOutput";
import ArchitectureOutput from "./ArchitectureOutput";
import DsaOutput from "./DsaOutput";

export default function ResponsePanel({ data, mode, language, error }) {
  if (error) {
    return (
      <div className="pane pane-right" style={{ padding: "1.5rem" }}>
        <div className="error-banner">
          <AlertCircle size={20} />
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Analysis Error</h4>
            <p>{error}</p>
          </div>
        </div>
        <div className="empty-state" style={{ height: "calc(100% - 80px)" }}>
          <HelpCircle />
          <h3>Unable to display analysis</h3>
          <p>Please resolve the error above and submit your code again.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pane pane-right">
        <div className="empty-state">
          <Terminal />
          <h3>System Idle</h3>
          <p>Paste code in the editor, select your mode, and click "Run Review" to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pane pane-right" style={{ display: "flex", flexDirection: "column" }}>
      {mode === "review" && <ReviewOutput data={data} language={language} />}
      {mode === "architecture" && <ArchitectureOutput data={data} />}
      {mode === "dsa" && <DsaOutput data={data} />}
    </div>
  );
}
