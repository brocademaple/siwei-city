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
        <span className="section-title">本轮路径</span>
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
  if (activeStep === 0) return '从顶部议题卡进入议会，先完成一轮碰撞。';
  if (activeStep === 1) return '到居民席位读来函，采纳有用观点入城。';
  if (activeStep === 2) return findingCount > 0 ? '去巡城官塔看缺口，按修缮令补一轮。' : '城中脉络已清，进卷轴馆带走报告。';
  return '进卷轴馆复制报告，或封存本轮城邦。';
}
