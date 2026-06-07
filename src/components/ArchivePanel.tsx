import type { ArchiveDoc } from '../types';

interface ArchivePanelProps {
  docs: ArchiveDoc[];
  activeDocId: string | null;
  onOpenDoc: (id: string) => void;
  onCloseDoc: () => void;
}

export function ArchivePanel({ docs, activeDocId, onOpenDoc, onCloseDoc }: ArchivePanelProps) {
  const activeDoc = docs.find((doc) => doc.id === activeDocId) ?? null;

  function downloadDoc(doc: ArchiveDoc) {
    const blob = new Blob([doc.body], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyDoc(doc: ArchiveDoc) {
    await navigator.clipboard?.writeText(doc.body);
  }

  return (
    <section className="archive-panel">
      <div className="section-title">卷轴馆</div>
      <p className="term-hint">把讨论沉淀成纸草卷轴、行动蜡板和巡城修缮记录。</p>
      <div className="archive-list">
        {docs.map((doc) => (
          <button className={activeDocId === doc.id ? 'archive-file active' : 'archive-file'} key={doc.id} type="button" onClick={() => onOpenDoc(doc.id)}>
            <span>{kindLabel(doc.kind)}</span>
            <strong>{doc.title}</strong>
            <small>{doc.createdAt}</small>
          </button>
        ))}
      </div>
      {activeDoc && (
        <article className="scroll-reader">
          <button className="popover-close" type="button" onClick={onCloseDoc} aria-label="关闭卷轴">
            ×
          </button>
          <span className="kicker">{kindLabel(activeDoc.kind)}</span>
          <h2>{activeDoc.title}</h2>
          <pre>{activeDoc.body}</pre>
          <div className="reader-actions">
            <button className="secondary-action" type="button" onClick={() => copyDoc(activeDoc)}>
              复制 Markdown
            </button>
            <button className="primary-action" type="button" onClick={() => downloadDoc(activeDoc)}>
              下载 .md
            </button>
          </div>
        </article>
      )}
    </section>
  );
}

function kindLabel(kind: ArchiveDoc['kind']) {
  const map: Record<ArchiveDoc['kind'], string> = {
    report: '纸草报告',
    action: '行动蜡板',
    roundtable: '圆桌记录',
    repair: '修缮令',
  };
  return map[kind];
}
