import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import EditorPanel from "./components/EditorPanel";
import ResponsePanel from "./components/ResponsePanel";
import Loader from "./components/Loader";

// Starter code samples for a clean user demonstration
const STARTER_CODES = {
  javascript: `// Vulnerable JavaScript Example
function processUserLogin(username, password) {
  // SQL Injection vulnerability - dynamic string construction
  let query = "SELECT * FROM users WHERE user = '" + username + "' AND pass = '" + password + "'";
  console.log("Running SQL: " + query);
  
  // High-risk Eval statement
  let isAdmin = eval("username === 'admin'");
  
  return { query, isAdmin };
}

// Invoke authentication
processUserLogin("john_doe", "superSecret123");`,

  python: `# Bubble Sort Example
def bubble_sort(arr):
    n = len(arr)
    # Unused placeholder variable
    temp = None
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                # Swap elements
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

# Call the bubble sort
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers)
print("Sorted array:", sorted_numbers)`,

  cpp: `#include <iostream>

// Unoptimized Recursive Fibonacci (bottleneck)
int fibonacci(int n) {
    if (n <= 1)
        return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int val = 12;
    std::cout << "Fibonacci(" << val << ") = " << fibonacci(val) << std::endl;
    return 0;
}`,

  java: `import java.util.*;

public class SearchLogic {
    // Unnecessary recursive linear search (potential stack overflow)
    public static int linearSearchRecursive(int[] arr, int target, int index) {
        if (index >= arr.length) {
            return -1;
        }
        if (arr[index] == target) {
            return index;
        }
        return linearSearchRecursive(arr, target, index + 1);
    }

    public static void main(String[] args) {
        int[] data = {3, 5, 7, 9, 11};
        System.out.println("Element index: " + linearSearchRecursive(data, 9, 0));
    }
}`,

  go: `package main

import "fmt"

// Goroutine leak risk - unbuffered channel blocking
func leakWorker(ch chan int) {
	fmt.Println("Worker started")
	// Will block forever if no receiver reads
	ch <- 42 
}

func main() {
	ch := make(chan int)
	go leakWorker(ch)
	fmt.Println("Main routine completed")
}`,
  html: `<!DOCTYPE html>
<html>
<head>
    <title>Dynamic Input Test</title>
</head>
<body>
    <input type="text" id="userInput" />
    <button onclick="writeToDoc()">Submit</button>
    <script>
        // XSS Vulnerability - innerHTML injection from user inputs
        function writeToDoc() {
            var input = document.getElementById("userInput").value;
            document.write("<div>User Input: " + input + "</div>");
        }
    </script>
</body>
</html>`,
  css: `/* Unoptimized styling configuration */
.card-container {
    display: block;
    float: left;
    width: 300px;
    margin: 10px;
    padding: 20px;
    background-color: rgb(255, 255, 255);
}
.card-container:hover {
    transition: all 0.5s ease-in-out; /* Transitions layout float trigger */
    margin: 15px; 
}`,
  typescript: `// TypeScript parameter constraints issue
interface UserData {
  id: number;
  meta: any; // Type 'any' bypasses standard lint checks
}

function updateUserData(user: UserData): string {
  // Potential nullpointer exception if meta is undefined
  return user.meta.name.toString();
}`
};

const BACKEND_URL = "http://127.0.0.1:5000";

export default function App() {
  const [mode, setMode] = useState("review");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(STARTER_CODES.javascript);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(true);
  const [error, setError] = useState(null);
  
  // Maintain distinct caches for the outputs of different modes
  const [outputs, setOutputs] = useState({
    review: null,
    architecture: null,
    dsa: null
  });

  // Automatically update the starter code when the user changes languages
  useEffect(() => {
    if (STARTER_CODES[language]) {
      setCode(STARTER_CODES[language]);
    }
  }, [language]);

  // Query backend status on startup to verify connectivity and API key settings
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        if (response.ok) {
          const status = await response.json();
          setApiConfigured(status.api_key_configured);
        } else {
          setApiConfigured(false);
        }
      } catch (err) {
        console.error("Backend health check failed:", err);
        setApiConfigured(false);
      }
    };
    checkBackendHealth();
  }, []);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError("Please write or paste some code before submitting for analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, mode, language })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An error occurred while compiling your code review.");
      }

      setOutputs((prev) => ({
        ...prev,
        [mode]: result
      }));
    } catch (err) {
      console.error("Analysis API failed:", err);
      setError(err.message || "Failed to connect to the backend analysis server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <Header
        mode={mode}
        setMode={setMode}
        language={language}
        setLanguage={setLanguage}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        apiConfigured={apiConfigured}
      />

      <div className="workspace-layout">
        {/* Monaco Editor Panel (Left) */}
        <EditorPanel
          code={code}
          onChange={setCode}
          language={language}
          setLanguage={setLanguage}
        />

        {/* Structured Output Panel (Right) */}
        <ResponsePanel
          data={outputs[mode]}
          mode={mode}
          language={language}
          error={error}
        />

        {/* Loading Overlay */}
        <Loader isVisible={isAnalyzing} />
      </div>
    </div>
  );
}
