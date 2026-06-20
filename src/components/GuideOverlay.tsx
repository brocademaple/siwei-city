import { art } from '../assets/art';

interface GuideOverlayProps {
  step?: number;
  onStepChange?: (step: number) => void;
  onClose: () => void;
  onFinish: () => void;
}

export function GuideOverlay({ onClose, onFinish }: GuideOverlayProps) {
  const homeAssets = art.homeOnboarding;

  return (
    <div className="guide-overlay" role="dialog" aria-modal="false" aria-label="思维城邦新手指引">
      <div className="guide-highlight guide-home-entry" aria-hidden="true" />
      <div className="guide-highlight guide-council-core" aria-hidden="true" />
      <section
        className="guide-coach-bubble"
        aria-label="新手引导"
        style={{ backgroundImage: `url(${homeAssets.coachBubble})` }}
      >
        <span className="sr-only">点亮冲突议会，完成第一轮默认讨论</span>
        <img className="guide-coach-copy" src={homeAssets.coachCopy} alt="" aria-hidden="true" />
        <div className="guide-actions">
          <button
            className="home-art-button secondary-action"
            style={{ backgroundImage: `url(${homeAssets.secondaryButton})` }}
            type="button"
            onClick={onClose}
          >
            <span>退出</span>
          </button>
          <button
            className="home-art-button primary-action"
            style={{ backgroundImage: `url(${homeAssets.primaryButton})` }}
            type="button"
            onClick={onFinish}
          >
            <span>开始</span>
          </button>
        </div>
      </section>
    </div>
  );
}
