import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Code2, Upload, FileCode } from "lucide-react";

const EXTENSION_MAP = {
  js: "javascript",
  jsx: "javascript",
  py: "python",
  cpp: "cpp",
  h: "cpp",
  hpp: "cpp",
  cc: "cpp",
  java: "java",
  go: "go",
  html: "html",
  htm: "html",
  css: "css",
  ts: "typescript",
  tsx: "typescript"
};

export default function EditorPanel({ code, onChange, language, setLanguage }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleEditorChange = (value) => {
    onChange(value || "");
  };

  const processFile = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        onChange(content);
        
        // Detect language based on extension
        const ext = file.name.split(".").pop().toLowerCase();
        const detectedLang = EXTENSION_MAP[ext];
        if (detectedLang && setLanguage) {
          setLanguage(detectedLang);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="pane pane-left"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ position: "relative" }}
    >
      <div className="panel-header">
        <div className="panel-title">
          <Code2 size={16} />
          <span>Source Code Editor</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Upload Button */}
          <button className="upload-btn" onClick={triggerFileUpload} title="Upload code file">
            <Upload size={12} />
            <span>Upload File</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: "none" }}
            accept=".js,.jsx,.py,.cpp,.h,.hpp,.cc,.java,.go,.html,.htm,.css,.ts,.tsx"
          />
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            {language}
          </div>
        </div>
      </div>
      
      <div className="editor-wrapper">
        {/* Drag and Drop Visual Overlay */}
        {isDragging && (
          <div className="drag-overlay">
            <div className="drag-overlay-content">
              <FileCode size={48} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop code file here</h3>
              <p style={{ fontSize: "0.813rem", color: "var(--text-secondary)" }}>
                We'll automatically load and configure the language
              </p>
            </div>
          </div>
        )}
        
        <div className="editor-container">
          <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "var(--font-mono)",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              padding: { top: 16 },
              wordWrap: "on",
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8
              },
              lineNumbersMinChars: 3
            }}
          />
        </div>
      </div>
    </div>
  );
}

