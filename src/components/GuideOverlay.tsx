interface GuideOverlayProps {
  step: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
  onFinish: () => void;
}

const guideSteps = [
  {
    title: '立题',
    body: '在左侧写一句还没想清楚的问题，再选择探索、决策或行动模式。模式决定居民讨论顺序。',
    hint: '第一步：输入议题，选择模式，点击开局推演。',
    target: 'guide-topic',
  },
  {
    title: '观点与道路',
    body: '地图上的建筑是观点。点击建筑看铭文；设为起点、选择关系、再点另一座建筑，就能铺设道路。',
    hint: '第二步：让观点之间形成支持、冲突、依赖、延伸或回流。',
    target: 'guide-popover',
  },
  {
    title: '居民圆桌',
    body: '点击地图里的居民席位查看多 agent 回合。居民会互相回应，但只有你点击采纳，来函才会变成正式建筑。',
    hint: '第三步：把有价值的发言采纳入城。',
    target: 'guide-log',
  },
  {
    title: '收束归档',
    body: '巡城官塔会指出结构缺口，卷轴馆会把报告、行动计划、圆桌记录沉淀成 Markdown。',
    hint: '第四步：修缮缺口，把结果带走。',
    target: 'guide-map',
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
