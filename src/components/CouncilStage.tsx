import { art } from '../assets/art';
import { getResidentProfile, residentProfiles } from '../lib/residents';
import { modeLabel } from '../lib/modes';
import type { ArchiveDoc, DiscussionMode, ResidentId, ResidentProfile, ReviewFinding, RoundtableTurn } from '../types';

interface CouncilStageProps {
  topic: string;
  mode: DiscussionMode;
  turns: RoundtableTurn[];
  findings: ReviewFinding[];
  docs: ArchiveDoc[];
  activeDocId: string | null;
  activeResidentId: ResidentId | null;
  onActiveResidentChange: (id: ResidentId) => void;
  onRunComplete: () => void;
  onStartOpening: () => void;
  onAcceptTurn: (turn: RoundtableTurn) => void;
  onDiscussFinding: (finding: ReviewFinding) => void;
  onOpenDoc: (id: string) => void;
  onBackToCity: () => void;
}

const councilResidentIds: ResidentId[] = ['researcher', 'skeptic', 'practitioner', 'executor', 'inspector', 'archive'];

export function CouncilStage({
  topic,
  mode,
  turns,
  findings,
  docs,
  activeDocId,
  activeResidentId,
  onActiveResidentChange,
  onRunComplete,
  onStartOpening,
  onAcceptTurn,
  onDiscussFinding,
  onOpenDoc,
  onBackToCity,
}: CouncilStageProps) {
  const activeProfile = getResidentProfile(activeResidentId ?? 'researcher');
  const acceptedTurns = turns.filter((turn) => turn.accepted);
  const roleTurns = turns.filter((turn) => turn.role === activeProfile.roleName);
  const reportDoc = docs.find((doc) => doc.id === 'archive-report');
  const actionDoc = docs.find((doc) => doc.id === 'archive-action');

  return (
    <main
      className="council-stage"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(32, 22, 16, 0.08), rgba(32, 22, 16, 0.58)), url(${art.scenes.councilChamber})`,
      }}
      data-guide="map"
    >
      <div className="council-vignette" />
      <header className="council-topbar">
        <button type="button" onClick={onBackToCity}>
          ← 返回城邦
        </button>
        <span>{modeLabel(mode)}</span>
        <button type="button" onClick={onRunComplete}>
          跑通完整讨论
        </button>
      </header>

      <section className="council-table" aria-label="议会讨论桌">
        <span className="kicker">当前议题</span>
        <h2>{topic}</h2>
        <p>主要观点碰撞在议会内发生；采纳后的观点会同步沉淀回城邦地图。</p>
        <div className="council-actions">
          <button type="button" onClick={onStartOpening}>
            只开局
          </button>
          <button type="button" onClick={onRunComplete}>
            召开完整议会
          </button>
        </div>
        <div className="adopted-scrolls">
          {acceptedTurns.length === 0 ? (
            <span>尚未采纳居民发言</span>
          ) : (
            acceptedTurns.map((turn) => (
              <span key={turn.id}>
                {turn.role}：{turn.title}
              </span>
            ))
          )}
        </div>
      </section>

      <div className="council-seats" aria-label="议会席位">
        {councilResidentIds.map((id) => {
          const profile = getResidentProfile(id);
          const count = id === 'inspector' ? findings.length : id === 'archive' ? docs.length : turns.filter((turn) => turn.role === profile.roleName).length;
          return (
            <button
              className={activeProfile.id === id ? `council-seat seat-${id} active` : `council-seat seat-${id}`}
              key={id}
              type="button"
              onClick={() => onActiveResidentChange(id)}
            >
              <img src={art.characters[profile.assetKey]} alt="" />
              <span>
                <strong>{profile.roleName}</strong>
                <small>{count} 条记录</small>
              </span>
            </button>
          );
        })}
      </div>

      <ResidentSeatPanel
        profile={activeProfile}
        roleTurns={roleTurns}
        findings={findings}
        docs={docs}
        reportDocId={reportDoc?.id}
        actionDocId={actionDoc?.id}
        activeDoc={docs.find((doc) => doc.id === activeDocId)}
        onAcceptTurn={onAcceptTurn}
        onDiscussFinding={onDiscussFinding}
        onOpenDoc={onOpenDoc}
      />
    </main>
  );
}

interface ResidentSeatPanelProps {
  profile: ResidentProfile;
  roleTurns: RoundtableTurn[];
  findings: ReviewFinding[];
  docs: ArchiveDoc[];
  reportDocId?: string;
  actionDocId?: string;
  activeDoc?: ArchiveDoc;
  onAcceptTurn: (turn: RoundtableTurn) => void;
  onDiscussFinding: (finding: ReviewFinding) => void;
  onOpenDoc: (id: string) => void;
}

function ResidentSeatPanel({
  profile,
  roleTurns,
  findings,
  docs,
  reportDocId,
  actionDocId,
  activeDoc,
  onAcceptTurn,
  onDiscussFinding,
  onOpenDoc,
}: ResidentSeatPanelProps) {
  return (
    <aside className="council-focus-panel" aria-label={`${profile.title} 面板`}>
      <div className="focus-heading">
        <img src={art.characters[profile.assetKey]} alt="" />
        <span>
          <small>{profile.roleName}</small>
          <strong>{profile.title}</strong>
        </span>
      </div>
      <p>{profile.responsibility}</p>
      <div className="prompt-chip">{profile.promptBrief}</div>

      {profile.id === 'inspector' ? (
        <div className="seat-list">
          {findings.length === 0 ? (
            <article className="seat-card calm">当前没有明显结构断点。</article>
          ) : (
            findings.map((finding) => (
              <article className="seat-card" key={finding.id}>
                <strong>{finding.title}</strong>
                <p>{finding.detail}</p>
                <em>{finding.repairAction}</em>
                <button type="button" onClick={() => onDiscussFinding(finding)}>
                  请{finding.suggestedRole}继续讨论
                </button>
              </article>
            ))
          )}
        </div>
      ) : profile.id === 'archive' ? (
        <div className="seat-list">
          <div className="archive-shortcuts">
            {reportDocId && <button type="button" onClick={() => onOpenDoc(reportDocId)}>打开报告</button>}
            {actionDocId && <button type="button" onClick={() => onOpenDoc(actionDocId)}>打开行动计划</button>}
          </div>
          {activeDoc && (
            <article className="seat-card archive-preview">
              <strong>{activeDoc.title}</strong>
              <pre>{activeDoc.body.slice(0, 900)}</pre>
            </article>
          )}
          {docs.slice(0, 4).map((doc) => (
            <button className="seat-card doc-card" key={doc.id} type="button" onClick={() => onOpenDoc(doc.id)}>
              <strong>{doc.title}</strong>
              <p>{doc.createdAt}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="seat-list">
          {roleTurns.length === 0 ? (
            <article className="seat-card calm">这一席还没有发言。点击“召开完整议会”生成本轮观点碰撞。</article>
          ) : (
            roleTurns.map((turn) => (
              <article className={turn.accepted ? 'seat-card accepted' : 'seat-card'} key={turn.id}>
                <strong>{turn.title}</strong>
                <p>{turn.body}</p>
                <em>
                  回应 {turn.respondsTo ?? '议题'} · 建议关系 {turn.relation}
                </em>
                {!turn.accepted && (
                  <button type="button" onClick={() => onAcceptTurn(turn)}>
                    采纳入城
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      )}
    </aside>
  );
}
