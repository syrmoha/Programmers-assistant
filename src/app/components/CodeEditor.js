'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'php', label: 'PHP' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
];

const DEFAULT_CODE = {
  javascript: `// اكتب كود JavaScript هنا\nfunction hello() {\n  console.log("مرحباً بالعالم!");\n}\n\nhello();`,
  python: `# اكتب كود Python هنا\ndef hello():\n    print("مرحباً بالعالم!")\n\nhello()`,
  php: `<?php\n// اكتب كود PHP هنا\nfunction hello() {\n    echo "مرحباً بالعالم!";\n}\n\nhello();\n?>`,
  cpp: `#include <iostream>\nusing namespace std;\n\n// اكتب كود C++ هنا\nint main() {\n    cout << "مرحباً بالعالم!" << endl;\n    return 0;\n}`,
  java: `// اكتب كود Java هنا\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("مرحباً بالعالم!");\n    }\n}`,
};

export default function CodeEditor({ onSendCode, activeMode }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE.javascript || '');

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (DEFAULT_CODE[newLang] && (!code || Object.values(DEFAULT_CODE).includes(code))) {
      setCode(DEFAULT_CODE[newLang]);
    }
  };

  const handleSendToAI = useCallback(() => {
    if (code.trim()) {
      onSendCode(code, language);
    }
  }, [code, language, onSendCode]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  const handleExport = useCallback(() => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      php: 'php',
      cpp: 'cpp',
      java: 'java',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      sql: 'sql',
      json: 'json',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
    };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

  const modeLabels = {
    generate: 'إرسال للتوليد',
    debug: 'إرسال لحل الخطأ',
    explain: 'إرسال للشرح',
    optimize: 'إرسال للتحسين',
    chat: 'إرسال للمساعد',
  };

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <select
          className="editor-lang-select"
          value={language}
          onChange={handleLanguageChange}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <div className="editor-actions">
          <button className="editor-action-btn" onClick={handleCopy} title="نسخ الكود">
            📋 نسخ
          </button>
          <button className="editor-action-btn" onClick={handleExport} title="تصدير الكود">
            💾 تصدير
          </button>
          <button className="editor-action-btn primary" onClick={handleSendToAI}>
            🤖 {modeLabels[activeMode] || modeLabels.chat}
          </button>
        </div>
      </div>
      <div className="editor-body">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 8,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderLineHighlight: 'all',
          }}
        />
      </div>
    </div>
  );
}
