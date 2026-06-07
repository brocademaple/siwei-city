interface GuideOverlayProps {
  step: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
  onFinish: () => void;
}

const guideSteps = [
  {
    title: '城邦地图',
    body: '这里不是普通看板，而是本轮思考的主舞台。最终要同时留下三样东西：结构化思维地图、下一步行动、可导出的讨论报告材料。',
    hint: '实际功能：承载整轮推演的 panorama 工作区。',
    target: 'guide-map',
  },
  {
    title: '立题台与开局推演',
    body: '先在左侧立题台写一句还没想清楚的问题，也可以贴入一堆零散想法。点击“开局推演”后，系统会先拆出问题、假设、证据、反驳和行动。',
    hint: '实际功能：把模糊 idea 或零散材料变成第一批可操作节点。',
    target: 'guide-topic',
  },
  {
    title: '观点建筑',
    body: '每座建筑就是一条观点、判断、证据、反驳或行动。点击建筑，会在地图内打开铭文弹窗，不需要跳到底部面板。',
    hint: '实际功能：地图上的主要可点击对象。',
    target: 'guide-building',
  },
  {
    title: '建筑弹窗',
    body: '弹窗里的“铭文”就是观点正文；“铺设道路”就是建立支持、冲突、依赖、延伸或回流关系。先设起点，再点另一座建筑即可连线。',
    hint: '实际功能：查看详情、建立观点关系。',
    target: 'guide-popover',
  },
  {
    title: '建筑工坊',
    body: '当你有自己的补充判断、证据或下一步时，打开建筑工坊创建新观点。提交后它会成为地图上的新建筑。',
    hint: '实际功能：手动新增观点节点。',
    target: 'guide-forge',
  },
  {
    title: '居民建议预览',
    body: '角色来函代表不同 agent 的持续辩论和分工协作。点击只会在地图里预览，不会放大画布，也不会自动新增建筑。',
    hint: '实际功能：研究者找证据，怀疑者找反例，执行者收束行动；决策权仍然在你手里。',
    target: 'guide-log',
  },
  {
    title: '采纳入城',
    body: '如果一条居民建议有价值，在来函弹窗中点击“采纳入城”。只有这一步才会把建议转成正式观点建筑。',
    hint: '实际功能：把 agent 建议正式写入思考地图。',
    target: 'guide-popover',
  },
  {
    title: '巡城官令',
    body: '这里是系统诊断，首版只提示问题，不自动修复。它会指出缺证据、未处理反驳、孤立观点和未闭环行动。',
    hint: '实际功能：发现结构漏洞，并推动你收束下一步行动和报告材料。',
    target: 'guide-log',
  },
  {
    title: '未来形态',
    body: '右侧列表只是过渡形态。后续居民建议会更像地图上的居民席位，巡城日志会更像巡城官塔，点击建筑才展开来函或修缮令。',
    hint: '实际功能：保持沉浸感，把角色和诊断逐步收回 panorama。',
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
