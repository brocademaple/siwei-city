import type { ReactNode } from 'react';

interface MarkdownRendererProps {
  source: string;
  compact?: boolean;
}

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; text: string };

export function MarkdownRenderer({ source, compact = false }: MarkdownRendererProps) {
  const blocks = parseMarkdown(source);

  return (
    <div className={compact ? 'markdown-renderer compact' : 'markdown-renderer'}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const Tag = block.level === 1 ? 'h3' : block.level === 2 ? 'h4' : 'h5';
          return <Tag key={`${block.type}-${index}`}>{renderInline(block.text)}</Tag>;
        }
        if (block.type === 'list') {
          const Tag = block.ordered ? 'ol' : 'ul';
          return (
            <Tag key={`${block.type}-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </Tag>
          );
        }
        if (block.type === 'quote') {
          return <blockquote key={`${block.type}-${index}`}>{renderInline(block.text)}</blockquote>;
        }
        if (block.type === 'code') {
          return (
            <pre key={`${block.type}-${index}`}>
              <code>{block.text}</code>
            </pre>
          );
        }
        return <p key={`${block.type}-${index}`}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}

function parseMarkdown(source: string) {
  const lines = source.split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let orderedList = false;
  let code: string[] = [];
  let inCode = false;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
    paragraph = [];
  }

  function flushList() {
    if (list.length === 0) return;
    blocks.push({ type: 'list', ordered: orderedList, items: list });
    list = [];
    orderedList = false;
  }

  function flushCode() {
    if (code.length === 0) return;
    blocks.push({ type: 'code', text: code.join('\n') });
    code = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (/^```/.test(line)) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      code.push(rawLine.replace(/\s+$/, ''));
      continue;
    }

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', level: heading[1].length as 1 | 2 | 3, text: heading[2] });
      continue;
    }

    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      if (orderedList) flushList();
      list.push(bullet[1]);
      continue;
    }

    const ordered = /^\d+[.)]\s+(.+)$/.exec(line);
    if (ordered) {
      flushParagraph();
      if (list.length > 0 && !orderedList) flushList();
      orderedList = true;
      list.push(ordered[1]);
      continue;
    }

    const quote = /^>\s?(.+)$/.exec(line);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'quote', text: quote[1] });
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushCode();
  return blocks;
}

function renderInline(text: string) {
  const nodes: ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);

  parts.forEach((part, index) => {
    const strong = /^\*\*([^*]+)\*\*$/.exec(part);
    const code = /^`([^`]+)`$/.exec(part);
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (strong) {
      nodes.push(<strong key={`${part}-${index}`}>{strong[1]}</strong>);
    } else if (code) {
      nodes.push(<code key={`${part}-${index}`}>{code[1]}</code>);
    } else if (link) {
      nodes.push(
        <a key={`${part}-${index}`} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>,
      );
    } else {
      nodes.push(part);
    }
  });

  return nodes;
}
