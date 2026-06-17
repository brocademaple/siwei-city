import { useEffect, useMemo, useState } from 'react';
import { sampleCases } from '../lib/sampleCases';
import type { ArchiveDoc, SavedCity } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ArchivePanelProps {
  docs: ArchiveDoc[];
  savedCities: SavedCity[];
  activeDocId: string | null;
  onOpenDoc: (id: string) => void;
  onCloseDoc: () => void;
  onSaveCity: () => void;
  onLoadCity: (id: string) => void;
  onLoadSampleCase: (id: string) => void;
}

type ArchiveShelf = 'current' | 'cases' | 'traces' | 'history' | 'product';

export function ArchivePanel({
  docs,
  savedCities,
  activeDocId,
  onOpenDoc,
  onCloseDoc,
  onSaveCity,
  onLoadCity,
  onLoadSampleCase,
}: ArchivePanelProps) {
  const [shelf, setShelf] = useState<ArchiveShelf>('current');
  const activeDoc = docs.find((doc) => doc.id === activeDocId) ?? null;
  const currentDocs = useMemo(() => docs.filter((doc) => ['report', 'action', 'roundtable', 'repair'].includes(doc.kind)), [docs]);
  const productDocs = useMemo(() => docs.filter((doc) => ['narrative', 'mechanism'].includes(doc.kind)), [docs]);
  const caseDocs = useMemo(() => docs.filter((doc) => doc.kind === 'case'), [docs]);
  const traceDocs = useMemo(() => docs.filter((doc) => doc.kind === 'trace'), [docs]);

  useEffect(() => {
    if (!activeDoc) return;
    const nextShelf = shelfForKind(activeDoc.kind);
    setShelf((current) => (current === nextShelf ? current : nextShelf));
  }, [activeDoc]);

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
      <div>
        <div className="section-title">卷轴馆</div>
        <p className="term-hint">把讨论沉淀为纸草卷轴、案例馆藏和可回看的历史城邦。</p>
      </div>

      <div className="archive-shelves" aria-label="卷轴馆分区">
        {shelfButton('current', '本轮卷轴', shelf, setShelf)}
        {shelfButton('cases', '案例馆藏', shelf, setShelf)}
        {shelfButton('traces', '公开链路', shelf, setShelf)}
        {shelfButton('history', '历史城邦', shelf, setShelf)}
        {shelfButton('product', '产品叙事', shelf, setShelf)}
      </div>

      {traceDocs.length > 0 && (
        <article className="trace-entry-card">
          <span>公开思维链路留痕</span>
          <strong>最近两条完整链路已入馆</strong>
          <p>直接阅读输入、公开推理步骤、居民回应、采纳动作、巡城检查和最终输出；不包含模型私有逐字内部思维。</p>
          <button
            type="button"
            onClick={() => {
              setShelf('traces');
              onOpenDoc(traceDocs[0].id);
            }}
          >
            阅读最近链路
          </button>
        </article>
      )}

      {shelf === 'current' && (
        <>
          <button className="archive-save" type="button" onClick={onSaveCity}>
            封存当前城邦
            <small>把本轮议题、建筑、道路和圆桌记录保存到本地档案。</small>
          </button>
          <DocList docs={currentDocs} activeDocId={activeDocId} onOpenDoc={onOpenDoc} />
        </>
      )}

      {shelf === 'cases' && (
        <div className="case-library">
          {sampleCases.map((item) => {
            const doc = caseDocs.find((entry) => entry.id === `case-${item.id}`);
            return (
              <article className="case-card" key={item.id}>
                <span>{item.recommendedMode === 'explore' ? '探索样例' : item.recommendedMode === 'decide' ? '决策样例' : '行动样例'}</span>
                <strong>{item.title}</strong>
                <p>{item.whyGoodDemo}</p>
                <div className="case-actions">
                  <button type="button" onClick={() => onLoadSampleCase(item.id)}>
                    载入城邦
                  </button>
                  {doc && (
                    <button type="button" onClick={() => onOpenDoc(doc.id)}>
                      阅读馆藏
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {shelf === 'traces' && (
        <>
          <p className="trace-shelf-note">最近两条完整链路来自 docs/trace-runs/latest-two-chain-runs.*，按生成顺序保留公开可审计记录。</p>
          <DocList docs={traceDocs} activeDocId={activeDocId} onOpenDoc={onOpenDoc} />
        </>
      )}

      {shelf === 'history' && (
        <div className="history-library">
          {savedCities.length === 0 ? (
            <article className="empty-archive">
              <strong>还没有历史城邦</strong>
              <p>在“本轮卷轴”中点击“封存当前城邦”，就能把一个议题保存为可回看的城邦档案。</p>
            </article>
          ) : (
            savedCities.map((city) => (
              <button className="history-city" key={city.id} type="button" onClick={() => onLoadCity(city.id)}>
                <span>{city.savedAt}</span>
                <strong>{city.topic}</strong>
                <small>{city.ideas.length} 座建筑 · {city.routes.length} 条道路 · {city.turns.length} 轮圆桌</small>
              </button>
            ))
          )}
        </div>
      )}

      {shelf === 'product' && <DocList docs={productDocs} activeDocId={activeDocId} onOpenDoc={onOpenDoc} />}

      {activeDoc && (
        <article className="scroll-reader">
          <button className="popover-close" type="button" onClick={onCloseDoc} aria-label="关闭卷轴">
            ×
          </button>
          <span className="kicker">{kindLabel(activeDoc.kind)}</span>
          <h2>{activeDoc.title}</h2>
          <MarkdownRenderer source={activeDoc.body} />
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

function shelfButton(shelf: ArchiveShelf, label: string, active: ArchiveShelf, setShelf: (shelf: ArchiveShelf) => void) {
  return (
    <button className={shelf === active ? 'active' : ''} type="button" onClick={() => setShelf(shelf)}>
      {label}
    </button>
  );
}

function shelfForKind(kind: ArchiveDoc['kind']): ArchiveShelf {
  if (kind === 'trace') return 'traces';
  if (kind === 'case') return 'cases';
  if (kind === 'narrative' || kind === 'mechanism') return 'product';
  return 'current';
}

function DocList({ docs, activeDocId, onOpenDoc }: { docs: ArchiveDoc[]; activeDocId: string | null; onOpenDoc: (id: string) => void }) {
  return (
    <div className="archive-list">
      {docs.map((doc) => (
        <button className={activeDocId === doc.id ? 'archive-file active' : 'archive-file'} key={doc.id} type="button" onClick={() => onOpenDoc(doc.id)}>
          <span>{kindLabel(doc.kind)}</span>
          <strong>{doc.title}</strong>
          <small>{doc.createdAt}</small>
        </button>
      ))}
    </div>
  );
}

function kindLabel(kind: ArchiveDoc['kind']) {
  const map: Record<ArchiveDoc['kind'], string> = {
    report: '纸草报告',
    action: '行动蜡板',
    roundtable: '圆桌记录',
    repair: '修缮令',
    narrative: '产品叙事',
    case: '案例馆藏',
    mechanism: '圆桌机制',
    trace: '链路留痕',
  };
  return map[kind];
}
