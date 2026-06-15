import { art } from '../assets/art';
import type { ResidentProfile } from '../types';

interface ResidentCodexPanelProps {
  profile: ResidentProfile | null;
  onEnterCouncil: () => void;
  onClose: () => void;
}

export function ResidentCodexPanel({ profile, onEnterCouncil, onClose }: ResidentCodexPanelProps) {
  if (!profile) return null;

  return (
    <aside className="resident-codex-panel" aria-label={`${profile.title} prompt 图鉴`}>
      <button className="codex-close" type="button" onClick={onClose} aria-label="关闭角色图鉴">
        ×
      </button>
      <div className="codex-portrait">
        <img src={art.characters[profile.assetKey]} alt="" />
      </div>
      <span className="kicker">角色图鉴 · {profile.roleName}</span>
      <h2>{profile.title}</h2>
      <p>{profile.responsibility}</p>

      <div className="codex-block">
        <strong>常用发问</strong>
        <ul>
          {profile.commonQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </div>

      <div className="codex-block prompt-block">
        <strong>背后 prompt 摘要</strong>
        <p>{profile.promptBrief}</p>
      </div>

      <div className="codex-contract">
        <strong>输出结构</strong>
        <code>{profile.outputContract}</code>
      </div>

      <button className="codex-primary" type="button" onClick={onEnterCouncil}>
        进入议会让 TA 发言
      </button>
    </aside>
  );
}
