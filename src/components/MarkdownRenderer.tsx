import type { ReactNode } from 'react';

interface MarkdownRendererProps {
  source: string;
  compact?: boolean;
}

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

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
          return (
            <ul key={`${block.type}-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
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

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
    paragraph = [];
  }

  function flushList() {
    if (list.length === 0) return;
    blocks.push({ type: 'list', items: list });
    list = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
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
      list.push(bullet[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function renderInline(text: string) {
  const nodes: ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  parts.forEach((part, index) => {
    const strong = /^\*\*([^*]+)\*\*$/.exec(part);
    if (strong) {
      nodes.push(<strong key={`${part}-${index}`}>{strong[1]}</strong>);
    } else {
      nodes.push(part);
    }
  });

  return nodes;
}
