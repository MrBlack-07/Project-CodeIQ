import React, { useState, useEffect } from "react";

const STEPS = [
  "Parsing code structure...",
  "Packaging environment details...",
  "Querying Google Gemini AI...",
  "Enforcing strict JSON outputs...",
  "Formatting syntax diagnostics...",
  "Generating final code metrics..."
];

export default function Loader({ isVisible }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="loader-overlay">
      <div className="spinner"></div>
      <div className="loader-status">Processing Your Code</div>
      <div className="loader-sub">{STEPS[currentStep]}</div>
    </div>
  );
}
