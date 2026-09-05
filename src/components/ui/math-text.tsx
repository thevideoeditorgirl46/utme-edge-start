import katex from "katex";
import React, { useMemo } from "react";

interface MathTextProps {
  content: string;
  className?: string;
}

type TextPart =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "math";
      value: string;
      displayMode: boolean;
    }
  | {
      type: "image";
      src: string;
      alt: string;
    };

/**
 * Parses a string containing LaTeX math formulas ($...$, $$...$$, \(...\), \[...\])
 * and markdown images (![alt](url)).
 */
function parseContent(text: string): TextPart[] {
  if (!text) return [];

  const parts: TextPart[] = [];

  // Match:
  // 1. Markdown images: !\[(.*?)\]\((.*?)\)
  // 2. Block math: \$\$[\s\S]*?\$\$ or \\\[[\s\S]*?\\\]
  // 3. Inline math: \$[^\$\n]+?\$ or \\\([\s\S]*?\\\)
  const regex =
    /(!\[(.*?)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\))|(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])|(\$[^$\n]+?\$|\\\([\s\S]*?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
      });
    }

    const fullMatch = match[0];

    // Case 1: Markdown image
    if (fullMatch.startsWith("![") && match[2] !== undefined && match[3] !== undefined) {
      parts.push({
        type: "image",
        alt: match[2] || "Diagram",
        src: match[3],
      });
    }
    // Case 2: Display math ($$...$$ or \[...\])
    else if (fullMatch.startsWith("$$") && fullMatch.endsWith("$$")) {
      parts.push({
        type: "math",
        value: fullMatch.slice(2, -2).trim(),
        displayMode: true,
      });
    } else if (fullMatch.startsWith("\\[") && fullMatch.endsWith("\\]")) {
      parts.push({
        type: "math",
        value: fullMatch.slice(2, -2).trim(),
        displayMode: true,
      });
    }
    // Case 3: Inline math ($...$ or \(...\))
    else if (fullMatch.startsWith("$") && fullMatch.endsWith("$")) {
      parts.push({
        type: "math",
        value: fullMatch.slice(1, -1).trim(),
        displayMode: false,
      });
    } else if (fullMatch.startsWith("\\(") && fullMatch.endsWith("\\)")) {
      parts.push({
        type: "math",
        value: fullMatch.slice(2, -2).trim(),
        displayMode: false,
      });
    } else {
      parts.push({
        type: "text",
        value: fullMatch,
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return parts;
}

export function MathText({ content, className = "" }: MathTextProps) {
  const parts = useMemo(() => parseContent(content), [content]);

  if (!parts.length) return null;

  // Plain text optimization
  if (parts.length === 1 && parts[0]?.type === "text") {
    return <span className={className}>{parts[0].value}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.type === "text") {
          return <React.Fragment key={idx}>{part.value}</React.Fragment>;
        }

        if (part.type === "image") {
          return (
            <span
              key={idx}
              className="my-3 block overflow-hidden rounded-xl border border-border bg-card"
            >
              <img
                src={part.src}
                alt={part.alt}
                loading="lazy"
                className="max-h-72 w-auto object-contain mx-auto"
              />
            </span>
          );
        }

        if (part.type === "math") {
          try {
            const html = katex.renderToString(part.value, {
              displayMode: part.displayMode,
              throwOnError: false,
              output: "htmlAndMathml",
              trust: true,
              strict: false,
            });

            return (
              <span
                key={idx}
                className={
                  part.displayMode
                    ? "my-2 block overflow-x-auto text-center font-normal"
                    : "inline-block px-0.5 align-baseline font-normal"
                }
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <code
                key={idx}
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
              >
                ${part.value}$
              </code>
            );
          }
        }

        return null;
      })}
    </span>
  );
}
