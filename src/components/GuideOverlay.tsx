interface GuideOverlayProps {
  step: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
  onFinish: () => void;
}

const guideSteps = [
  {
    title: '先做一轮',
    body: '不用先理解所有隐喻。先在左侧写一个问题，选择探索、决策或行动，再点击“开始一轮推演”。',
    hint: '第一步：让系统生成第一批观点建筑、道路和居民来函。',
    target: 'guide-topic',
  },
  {
    title: '看地图',
    body: '地图上的建筑就是观点。点击建筑看正文；需要补关系时，再用“设为起点”铺道路。',
    hint: '第二步：先看懂第一批建筑，不急着手动编辑。',
    target: 'guide-popover',
  },
  {
    title: '看居民',
    body: '右上角“城邦服务”里有居民席位。点一条来函先预览，只有采纳后才会变成正式建筑。',
    hint: '第三步：挑一条最有用的来函采纳入城。',
    target: 'guide-log',
  },
  {
    title: '收束结果',
    body: '城邦服务里的巡城官塔会指出哪里还没想透；卷轴馆会把本轮变成 Markdown 报告和行动计划。',
    hint: '第四步：复制报告，或封存成本地历史城邦。',
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
