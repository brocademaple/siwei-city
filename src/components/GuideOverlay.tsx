interface GuideOverlayProps {
  step: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
  onFinish: () => void;
}

const guideSteps = [
  {
    title: '先从冲突议会开局',
    body: '主页只需要先看懂一件事：点击“进入冲突议会”，把当前议题送上圆桌。',
    hint: '其他建筑负责归档、诊断、行动和长期记忆，核心碰撞先在议会发生。',
    target: 'guide-home-entry',
  },
  {
    title: '认清八座核心建筑',
    body: '世界地图只保留 8 个已定义建筑。点击任何地名，都能进入对应场景，看它负责闭环里的哪一段。',
    hint: '未想清楚的新建筑会先留在规划文档里，不会挤进产品主页。',
    target: 'guide-world-map',
  },
  {
    title: '议会里采纳观点',
    body: '进入议会后，点击“召开完整议会”。居民会提出证据、反驳、真实场景和最小行动。',
    hint: '居民发言先只是来函；你采纳后，它才算进入本轮城邦沉淀。',
    target: 'guide-council-core',
  },
  {
    title: '归档、出航、巡城',
    body: '采纳之后，看大图书馆的报告、行动码头的航线、巡城塔的修缮令，再回到主页看沉淀。',
    hint: '这就是当前 MVP 主线：议会碰撞 -> 采纳 -> 诊断 -> 行动或归档。',
    target: 'guide-service',
  },
];

export function GuideOverlay({ step, onStepChange, onClose, onFinish }: GuideOverlayProps) {
  const current = guideSteps[step];
  const last = step === guideSteps.length - 1;

  function next() {
    if (last) {
      onFinish();
      return;
    }
    onStepChange(step + 1);
  }

  return (
    <div className="guide-overlay" role="dialog" aria-modal="true" aria-label="思维城邦新手指引">
      <div className={`guide-highlight ${current.target}`} />
      <section className="guide-card">
        <span className="kicker">
          步骤 {step + 1} / {guideSteps.length}
        </span>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
        <small className="guide-hint">{current.hint}</small>
        <div className="guide-actions">
          <button className="secondary-action" type="button" onClick={onClose}>
            退出
          </button>
          <button className="secondary-action" type="button" disabled={step === 0} onClick={() => onStepChange(step - 1)}>
            上一步
          </button>
          <button className="primary-action" type="button" onClick={next}>
            {last ? '完成' : '下一步'}
          </button>
        </div>
      </section>
    </div>
  );
}
