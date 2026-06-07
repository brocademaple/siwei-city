import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { District, IdeaNode, IdeaType, RoleContribution } from '../types';
import { typeDistrictName, typeLabel } from '../lib/layout';
import { MvpPath } from './MvpPath';

interface IdeaPanelProps {
  topic: string;
  districts: District[];
  roleContributions: RoleContribution[];
  onAddIdea: (draft: Pick<IdeaNode, 'title' | 'body' | 'type' | 'districtId' | 'authorRole'>) => void;
  onUseRoleContribution: (contribution: RoleContribution) => void;
  onStartOpening: (topic: string) => void;
}

const ideaTypes: IdeaType[] = ['question', 'hypothesis', 'evidence', 'counter', 'action'];

export function IdeaPanel({
  topic,
  districts,
  roleContributions,
  onAddIdea,
  onUseRoleContribution,
  onStartOpening,
}: IdeaPanelProps) {
  const [forgeOpen, setForgeOpen] = useState(false);
  const [topicDraft, setTopicDraft] = useState(topic);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<IdeaType>('hypothesis');
  const districtId = useMemo(() => defaultDistrictForType(type), [type]);
  const targetDistrict = districts.find((district) => district.id === districtId);

  useEffect(() => {
    setTopicDraft(topic);
  }, [topic]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle || !cleanBody) return;

    onAddIdea({
      title: cleanTitle,
      body: cleanBody,
      type,
      districtId,
      authorRole: '我',
    });
    setTitle('');
    setBody('');
    setForgeOpen(false);
  }

  function handleOpening(event: FormEvent) {
    event.preventDefault();
    onStartOpening(topicDraft);
  }

  return (
    <aside className="scribe-panel">
      <header className="scribe-header">
        <span className="kicker">当前议题</span>
        <h1>思维城邦</h1>
      </header>

      <form className="topic-scroll topic-forge" onSubmit={handleOpening}>
        <label>
          <span>立题台</span>
          <textarea
            value={topicDraft}
            onChange={(event) => setTopicDraft(event.target.value)}
            placeholder="写下一个模糊议题"
          />
        </label>
        <button className="primary-action" type="submit">
          开局推演
        </button>
      </form>

      <MvpPath />

      <button className="forge-gate" type="button" onClick={() => setForgeOpen((value) => !value)} data-guide="forge">
        <span>建筑工坊</span>
        <strong>{forgeOpen ? '收起工坊' : '建造新观点'}</strong>
        <small>新建观点，会在地图上生成一座建筑。</small>
      </button>

      {forgeOpen && (
        <form className="forge-form" onSubmit={handleSubmit}>
          <label>
            <span>建筑名</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="写下一个想法" />
          </label>
          <label>
            <span>铭文</span>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="补充判断、证据或下一步" />
          </label>
          <div className="seal-grid" aria-label="观点类型">
            {ideaTypes.map((item) => (
              <button
                className={item === type ? 'seal-chip active' : 'seal-chip'}
                key={item}
                type="button"
                onClick={() => setType(item)}
              >
                {typeLabel(item)}
              </button>
            ))}
          </div>
          <div className="district-target">
            <span>落入</span>
            <strong>{targetDistrict?.name ?? typeDistrictName(type)}</strong>
          </div>
          <button className="primary-action" type="submit">
            建造
          </button>
        </form>
      )}

      <section className="voices-court">
        <div className="section-title">集思席位</div>
        <p className="term-hint">来自不同角色的建议。点击只在地图内预览，需要采纳才会入城。</p>
        <div className="role-list">
          {roleContributions.map((contribution) => (
            <button className="role-card" key={contribution.role} type="button" onClick={() => onUseRoleContribution(contribution)}>
              <span>{contribution.role}</span>
              <strong>{contribution.title}</strong>
              <small>预览建议</small>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

function defaultDistrictForType(type: IdeaType) {
  const map: Record<IdeaType, string> = {
    question: 'questions',
    hypothesis: 'hypothesis',
    evidence: 'evidence',
    counter: 'conflict',
    action: 'action',
  };
  return map[type];
}
