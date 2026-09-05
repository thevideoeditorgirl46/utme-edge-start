import katex from "katex";
import React, { useMemo } from "react";

interface MathTextProps {
  content: string;
  className?: string;
}

type TextPart = {
  type: "text" | "math";
  value: string;
  displayMode: boolean;
};

function parseLatex(text: string): TextPart[] {
  if (!text) return [];

  const parts: TextPart[] = [];
  // Regex to match $$...$$, $...$, \[...\], or \(...\)
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
        displayMode: false,
      });
    }

    const raw = match[0];
    let math = raw;
    let displayMode = false;

    if (raw.startsWith("$$") && raw.endsWith("$$")) {
      math = raw.slice(2, -2).trim();
      displayMode = true;
    } else if (raw.startsWith("$") && raw.endsWith("$")) {
      math = raw.slice(1, -1).trim();
      displayMode = false;
    } else if (raw.startsWith("\\[") && raw.endsWith("\\]")) {
      math = raw.slice(2, -2).trim();
      displayMode = true;
    } else if (raw.startsWith("\\(") && raw.endsWith("\\)")) {
      math = raw.slice(2, -2).trim();
      displayMode = false;
    }

    parts.push({
      type: "math",
      value: math,
      displayMode,
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      value: text.slice(lastIndex),
      displayMode: false,
    });
  }

  return parts;
}

export function MathText({ content, className = "" }: MathTextProps) {
  const parts = useMemo(() => parseLatex(content), [content]);

  // If no math markers found, render plain text
  if (parts.length === 1 && parts[0]?.type === "text") {
    return <span className={className}>{parts[0].value}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.type === "text") {
          return <React.Fragment key={idx}>{part.value}</React.Fragment>;
        }

        try {
          const html = katex.renderToString(part.value, {
            displayMode: part.displayMode,
            throwOnError: false,
            output: "htmlAndMathml",
          });

          return (
            <span
              key={idx}
              className={part.displayMode ? "my-2 block text-center" : "inline-block px-0.5"}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={idx}>${part.value}$</span>;
        }
      })}
    </span>
  );
}
