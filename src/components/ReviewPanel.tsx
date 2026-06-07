import { art } from '../assets/art';
import { contributionKey } from '../lib/contribution';
import type { ReviewFinding, RoleContribution } from '../types';

interface ReviewPanelProps {
  findings: ReviewFinding[];
  roleContributions: RoleContribution[];
  acceptedContributionKeys: string[];
  onFocusFinding: (finding: ReviewFinding) => void;
  onPreviewContribution: (contribution: RoleContribution) => void;
}

export function ReviewPanel({
  findings,
  roleContributions,
  acceptedContributionKeys,
  onFocusFinding,
  onPreviewContribution,
}: ReviewPanelProps) {
  return (
    <aside className="city-log" data-guide="log">
      <section className="log-section role-court">
        <div className="role-court-header">
          <img src={art.textures.seal} alt="" />
          <span>
            <div className="section-title">角色席位</div>
            <p className="term-hint">四类 agent 分工给建议。点击只是预览，采纳后才会入城。</p>
          </span>
        </div>
        <div className="log-list">
          {roleContributions.map((contribution) => {
            const accepted = acceptedContributionKeys.includes(contributionKey(contribution));
            return (
              <button
                className={accepted ? 'log-entry resident-entry accepted' : 'log-entry resident-entry'}
                key={contributionKey(contribution)}
                type="button"
                onClick={() => onPreviewContribution(contribution)}
              >
                <img className="role-avatar" src={art.textures.seal} alt="" />
                <span>
                  <strong>{contribution.role}</strong>
                  <p>{contribution.title}</p>
                  <em>{accepted ? '已入城邦' : '预览来函'}</em>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="log-section inspector-court">
        <div className="role-court-header">
          <img src={art.textures.seal} alt="" />
          <span>
            <div className="section-title">巡城官令</div>
            <p className="term-hint">系统诊断缺证据、未闭环、孤立观点和未处理反驳。</p>
          </span>
        </div>
        <div className="log-list">
          {findings.length === 0 ? (
            <article className="log-entry calm">
              <img className="role-avatar" src={art.textures.seal} alt="" />
              <span>
                <strong>城邦脉络清晰</strong>
                <p>当前没有明显断点。</p>
              </span>
            </article>
          ) : (
            findings.map((finding) => (
              <button
                className={`log-entry severity-${finding.severity}`}
                key={finding.id}
                type="button"
                onClick={() => onFocusFinding(finding)}
              >
                <img className="role-avatar" src={art.textures.seal} alt="" />
                <span>
                  <strong>{finding.title}</strong>
                  <p>{finding.detail}</p>
                  <em>定位建筑</em>
                </span>
              </button>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}
