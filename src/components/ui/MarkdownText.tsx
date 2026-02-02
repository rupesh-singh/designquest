'use client';

import React from 'react';

interface MarkdownTextProps {
  children: string;
  className?: string;
}

/**
 * Simple markdown renderer for question text.
 * Supports: **bold**, `code`, ```code blocks```, - lists
 */
export function MarkdownText({ children, className = '' }: MarkdownTextProps) {
  const renderMarkdown = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';
    let keyIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for code block start/end
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLang = line.slice(3).trim();
          codeBlockContent = [];
        } else {
          // End of code block
          elements.push(
            <pre
              key={`code-${keyIndex++}`}
              className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 my-3 overflow-x-auto"
            >
              <code className="text-sm text-green-400 font-mono">
                {codeBlockContent.join('\n')}
              </code>
            </pre>
          );
          inCodeBlock = false;
          codeBlockContent = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Handle regular lines
      if (line.trim() === '') {
        elements.push(<br key={`br-${keyIndex++}`} />);
        continue;
      }

      // Parse inline formatting
      const parsedLine = parseInlineFormatting(line, keyIndex++);
      
      // Check if it's a list item
      if (line.trim().startsWith('- ')) {
        elements.push(
          <div key={`list-${keyIndex++}`} className="flex items-start gap-2 my-1">
            <span className="text-neutral-500 mt-1">•</span>
            <span>{parsedLine}</span>
          </div>
        );
      } else {
        elements.push(
          <div key={`line-${keyIndex++}`} className="my-1">
            {parsedLine}
          </div>
        );
      }
    }

    return elements;
  };

  const parseInlineFormatting = (text: string, baseKey: number): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let partKey = 0;

    // Remove list marker if present
    if (remaining.trim().startsWith('- ')) {
      remaining = remaining.trim().slice(2);
    }

    while (remaining.length > 0) {
      // Check for bold (**text**)
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Check for inline code (`code`)
      const codeMatch = remaining.match(/`([^`]+)`/);

      // Find the earliest match
      let earliestMatch: { type: 'bold' | 'code'; match: RegExpMatchArray; index: number } | null = null;
      
      if (boldMatch && boldMatch.index !== undefined) {
        earliestMatch = { type: 'bold', match: boldMatch, index: boldMatch.index };
      }
      if (codeMatch && codeMatch.index !== undefined) {
        if (!earliestMatch || codeMatch.index < earliestMatch.index) {
          earliestMatch = { type: 'code', match: codeMatch, index: codeMatch.index };
        }
      }

      if (earliestMatch) {
        const { type, match, index } = earliestMatch;
        const beforeText = remaining.slice(0, index);
        
        if (beforeText) {
          parts.push(<span key={`${baseKey}-${partKey++}`}>{beforeText}</span>);
        }

        if (type === 'bold') {
          parts.push(
            <strong key={`${baseKey}-${partKey++}`} className="font-semibold text-white">
              {match[1]}
            </strong>
          );
        } else if (type === 'code') {
          parts.push(
            <code
              key={`${baseKey}-${partKey++}`}
              className="bg-neutral-800 px-1.5 py-0.5 rounded text-amber-400 text-sm font-mono"
            >
              {match[1]}
            </code>
          );
        }

        remaining = remaining.slice(index + match[0].length);
      } else {
        // No more matches, add remaining text
        parts.push(<span key={`${baseKey}-${partKey++}`}>{remaining}</span>);
        break;
      }
    }

    return parts.length > 0 ? parts : text;
  };

  return <div className={className}>{renderMarkdown(children)}</div>;
}
