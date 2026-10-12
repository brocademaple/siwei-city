import { useRef, useState } from 'react';
import type { MemoryCard, MemoryStatus } from '../types';

interface MemoryLibraryProps {
  cards: MemoryCard[];
  onBackfill: (id: string, text: string, source: string) => string | null;
  onVoid: (id: string, action: 'flag' | 'delete') => void;
  onExport: () => void;
  onImport: (file: File) => Promise<string>;
}

const drawers: { status: MemoryStatus; hint: string }[] = [
  { status: '已定', hint: '你确认过的裁定，和回填过的数据' },
  { status: '待验证', hint: '议会合不成、出口待证的问题' },
  { status: '作废', hint: '被推翻、被标错、被删掉的卡' },
];

function provenanceLine(card: MemoryCard) {
  return card.provenance.map((p) => (p.kind === 'round'
    ? `${p.topic ? `「${p.topic.length > 14 ? `${p.topic.slice(0, 14)}…` : p.topic}」` : '某局'} · ${p.seat}${p.phase === 'cross' ? '对质' : p.phase === 'exit' ? '' : '开场'}${p.evidenceIds.length ? ` · ${p.evidenceIds.join('/')}` : ''}`
    : `你 · ${p.note}`));
}

export function MemoryLibrary({ cards, onBackfill, onVoid, onExport, onImport }: MemoryLibraryProps) {
  const [active, setActive] = useState<MemoryStatus>('待验证');
  const [fillingId, setFillingId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [source, setSource] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const shown = cards.filter((card) => card.status === active).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <section className="memory-library" aria-label="城邦记忆">
      <header className="memory-library-head">
        <div>
          <strong>城邦记忆</strong>
          <small>{cards.length} 张卡 · 每张都带出处 · 存在本机 IndexedDB</small>
        </div>
        <div className="memory-library-io">
          <button type="button" onClick={onExport}>导出 JSON</button>
          <button type="button" onClick={() => fileRef.current?.click()}>导入 JSON</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) setNotice(await onImport(file));
            event.target.value = '';
          }} />
        </div>
      </header>
      <div className="memory-drawers" role="tablist" aria-label="记忆抽屉">
        {drawers.map((drawer) => (
          <button key={drawer.status} type="button" role="tab" aria-selected={active === drawer.status} className={active === drawer.status ? 'active' : ''} onClick={() => setActive(drawer.status)}>
            <b>{drawer.status}</b>
            <span>{cards.filter((card) => card.status === drawer.status).length}</span>
            <small>{drawer.hint}</small>
          </button>
        ))}
      </div>
      {notice && <p className="memory-notice" role="status">{notice}</p>}
      <div className="memory-cards">
        {shown.length === 0 && <p className="memory-empty">这个抽屉还是空的。</p>}
        {shown.map((card) => (
          <article key={card.id} className={`memory-card memory-${card.status}`}>
            <header>
              <b>{card.id}</b>
              <em>{card.kind}{card.residentTag ? ` · ${card.residentTag}` : ''}</em>
              {card.reopenable && <i className="memory-reopen">可重议</i>}
              {card.answer && <i className="memory-answered">已回填 {card.answer.evidenceId}</i>}
            </header>
            <p>{card.text}</p>
            {card.answer && <p className="memory-answer">数据：{card.answer.text}</p>}
            {card.voidReason && <p className="memory-void">{card.voidReason}</p>}
            {card.dependsOn?.length ? <small>前提：{card.dependsOn.join('、')}</small> : null}
            <ul className="memory-provenance">{provenanceLine(card).map((line, index) => <li key={index}>{line}</li>)}</ul>
            {card.tags.length > 0 && <div className="memory-tags">{card.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
            {fillingId === card.id ? (
              <form className="memory-backfill" onSubmit={(event) => {
                event.preventDefault();
                const reason = onBackfill(card.id, answer, source);
                if (reason) setNotice(reason);
                else { setFillingId(null); setAnswer(''); setSource(''); setNotice(`${card.id} 已回填，生成新证据；依赖它的裁定标为可重议`); }
              }}>
                <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="结果一句，如：基线 = …，口径 = …" />
                <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="出处，如：数据侧 10/15 报表" />
                <button type="submit">回填</button>
                <button type="button" onClick={() => setFillingId(null)}>取消</button>
              </form>
            ) : card.status !== '作废' && (
              <footer>
                {card.status === '待验证' && card.kind === '待验证' && <button type="button" className="memory-primary" onClick={() => setFillingId(card.id)}>有数据了</button>}
                <button type="button" onClick={() => onVoid(card.id, 'flag')}>这条不对</button>
                <button type="button" onClick={() => onVoid(card.id, 'delete')}>删除</button>
              </footer>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
