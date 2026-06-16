import { art } from '../assets/art';
import type { ResidentId, ResidentProfile } from '../types';

interface ResidentCodexPanelProps {
  profile: ResidentProfile | null;
  profiles: ResidentProfile[];
  onSelectProfile: (id: ResidentId) => void;
  onEnterCouncil: () => void;
  onClose: () => void;
}

export function ResidentCodexPanel({ profile, profiles, onSelectProfile, onEnterCouncil, onClose }: ResidentCodexPanelProps) {
  if (!profile) return null;

  const relatedProfiles = profiles.filter((item) => item.homeDistrictId === profile.homeDistrictId);

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
      <div className="profile-traits">
        <span>{profile.persona}</span>
        <span>{profile.tone}</span>
      </div>

      {relatedProfiles.length > 1 && (
        <div className="codex-roster" aria-label="同建筑居民">
          {relatedProfiles.map((item) => (
            <button
              className={item.id === profile.id ? 'codex-resident-option active' : 'codex-resident-option'}
              key={item.id}
              type="button"
              onClick={() => onSelectProfile(item.id)}
            >
              <img src={art.characters[item.assetKey]} alt="" />
              <span>
                <strong>{item.title}</strong>
                <small>{item.roleName} · {item.genderPresentation === 'female' ? '女性角色' : item.genderPresentation === 'male' ? '男性角色' : '中性角色'}</small>
              </span>
            </button>
          ))}
        </div>
      )}

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
