interface MvpPathProps {
  openingStarted: boolean;
  ideaCount: number;
  routeCount: number;
  turnCount: number;
  acceptedTurnCount: number;
  findingCount: number;
}

export function MvpPath({
  openingStarted,
  ideaCount,
  routeCount,
  turnCount,
  acceptedTurnCount,
  findingCount,
}: MvpPathProps) {
  const activeStep = !openingStarted ? 0 : acceptedTurnCount === 0 ? 1 : findingCount > 0 ? 2 : 3;
  const labels = ['开局', '居民', '巡城', '卷轴'];

  return (
    <section className="mvp-path" aria-label="本轮使用路径">
      <div className="mvp-path-head">
        <span className="section-title">下一步</span>
        <strong>{nextPrompt(activeStep, findingCount)}</strong>
      </div>

      <ol className="quick-path" aria-label="流程阶段">
        {labels.map((label, index) => (
          <li className={index === activeStep ? 'active' : index < activeStep ? 'done' : ''} key={label}>
            <i>{index + 1}</i>
            <span>{label}</span>
          </li>
        ))}
      </ol>

      <div className="run-stats" aria-label="本轮进度">
        <span>
          <strong>{ideaCount}</strong> 建筑
        </span>
        <span>
          <strong>{routeCount}</strong> 道路
        </span>
        <span>
          <strong>{acceptedTurnCount}/{turnCount}</strong> 来函
        </span>
        <span>
          <strong>{findingCount}</strong> 修缮
        </span>
      </div>
    </section>
  );
}

function nextPrompt(activeStep: number, findingCount: number) {
  if (activeStep === 0) return '输入议题后点击开始。';
  if (activeStep === 1) return '打开右上角城邦服务，看居民来函。';
  if (activeStep === 2) return findingCount > 0 ? '到巡城官塔处理缺口。' : '结构清晰，可以进卷轴馆。';
  return '复制报告，或封存本轮。';
}
