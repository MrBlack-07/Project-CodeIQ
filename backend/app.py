import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for frontend integration
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Verify Gemini API Key configuration
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    logger.warning("GEMINI_API_KEY is not set in the environment or .env file.")
else:
    genai.configure(api_key=api_key)

# System prompts for different modes
PROMPTS = {
    "review": """You are an expert software engineer and security specialist.
Analyze the provided code and return a JSON object.
You must strictly follow this JSON schema:
{
  "syntax_errors": [
    {
      "line": 10,
      "description": "Short explanation of the syntax or lint issue",
      "severity": "error"
    }
  ],
  "security_vulnerabilities": [
    {
      "line": 15,
      "type": "SQL Injection",
      "description": "Vulnerability details",
      "remediation": "How to resolve the issue"
    }
  ],
  "complexity": {
    "time": "O(N log N)",
    "space": "O(N)",
    "explanation": "Brief explanation of complexity bottlenecks."
  },
  "line_by_line": [
    {
      "line": 1,
      "code": "def process_data(data):",
      "explanation": "Explain what this line or block does."
    }
  ],
  "optimized_code": "Optimized, cleaned up, and secure version of the code."
}
""",
    "architecture": """You are a Principal Software Architect.
Analyze the provided code and return a JSON object describing the system design, relationships, diagrams, and data flow.
You must strictly follow this JSON schema:
{
  "system_design": "Detailed system design documentation covering structure and architecture design patterns used.",
  "relationships": [
    {
      "caller": "function_name or class_name",
      "callee": "function_name or class_name",
      "relationship_type": "calls / instantiates / inherits / uses",
      "description": "Brief explanation of how they interact."
    }
  ],
  "uml_diagram": "Mermaid.js diagram representing code dependencies or sequences. Always start with 'classDiagram' or 'sequenceDiagram'. Do NOT wrap it in HTML comments or tags. Use double quotes around labels with symbols or spaces.",
  "er_diagram": "Mermaid.js Entity Relationship diagram representing database tables or model classes. Start with 'erDiagram' if applicable, otherwise provide a structured text representation of the model structure.",
  "data_flow": "Step by step description of how data flows through this program."
}
""",
    "dsa": """You are an Elite Computer Science Professor and Technical Interviewer.
Analyze the provided code's underlying algorithm, logic, and design patterns.
You must strictly follow this JSON schema:
{
  "underlying_logic": "Deep dive analysis of the algorithms, data structures, and paradigms used.",
  "questions": [
    {
      "id": 1,
      "question": "Advanced question targeting concepts related to or extending the code's logic (e.g. tree traversals, dynamic programming, scaling issues, graph representations).",
      "concept": "Name of the target concept (e.g., Recursion, Memoization, Graph BFS)",
      "difficulty": "Easy / Medium / Hard",
      "expected_answer_hints": "Detailed bullet points of elements the candidate should state to successfully answer this question."
    }
  ]
}
Generate exactly 3 to 5 highly relevant DSA interview questions.
"""
}

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "api_key_configured": api_key is not None and len(api_key) > 0
    })

@app.route("/api/analyze", methods=["POST"])
def analyze_code():
    if not api_key:
        return jsonify({
            "error": "Gemini API key is not configured on the backend. Please check your .env file."
        }), 500

    try:
        data = request.json or {}
        code = data.get("code", "").strip()
        mode = data.get("mode", "review").strip().lower()
        language = data.get("language", "plaintext").strip()

        if not code:
            return jsonify({"error": "Code content cannot be empty."}), 400

        if mode not in PROMPTS:
            return jsonify({"error": f"Invalid mode. Choose from {list(PROMPTS.keys())}."}), 400

        system_instruction = PROMPTS[mode]
        
        # We will use the standard gemini-2.5-flash model for fast, structured analysis
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction
        )

        user_content = f"Language: {language}\n\nCode to analyze:\n```\n{code}\n```"

        logger.info(f"Submitting analysis request for mode: {mode}, language: {language}")

        # Request a JSON output format from Gemini
        response = model.generate_content(
            user_content,
            generation_config={"response_mime_type": "application/json"}
        )

        if not response or not response.text:
            return jsonify({"error": "Empty response received from Gemini API."}), 500

        # Attempt to parse response as JSON to verify structural compliance
        try:
            parsed_json = json.loads(response.text)
            return jsonify(parsed_json)
        except json.JSONDecodeError as je:
            logger.error(f"Failed to parse Gemini response as JSON: {response.text}")
            return jsonify({
                "error": "The AI model returned invalid JSON. Please try again.",
                "raw_response": response.text
            }), 500

    except Exception as e:
        logger.exception("An error occurred during code analysis")
        return jsonify({
            "error": f"Internal Server Error: {str(e)}"
        }), 500

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    app.run(host="127.0.0.1", port=port, debug=debug)
