const pathItems = [
  {
    term: '输入材料',
    action: '在立题台写一个模糊议题，或贴入一堆零散想法',
    result: '得到本轮城邦议题与待整理材料',
  },
  {
    term: '开局推演',
    action: '点击按钮，让系统先拆出问题、假设、证据、反驳、行动',
    result: '地图出现第一批观点建筑',
  },
  {
    term: '观点建筑',
    action: '点击 panorama 上的建筑',
    result: '在地图内查看铭文和关系操作',
  },
  {
    term: '居民建议',
    action: '点击角色来函，只做预览；后续会迁到地图居民席位',
    result: 'agent 持续辩论、分工协作，但不自动改地图',
  },
  {
    term: '采纳入城',
    action: '在来函弹窗中确认采纳',
    result: '建议正式变成一座新建筑',
  },
  {
    term: '铺设道路',
    action: '在建筑弹窗里设起点、选关系、点另一座建筑',
    result: '建立支持、冲突、依赖、延伸或回流',
  },
  {
    term: '巡城官令',
    action: '查看诊断并定位相关建筑；首版只提示问题',
    result: '发现缺证据、未回应、孤立或未闭环',
  },
  {
    term: '收束产物',
    action: '把巡检缺口收束到行动码头，并保留报告材料',
    result: '带走思维地图、下一步行动和报告草案',
  },
];

export function MvpPath() {
  return (
    <details className="mvp-path" aria-label="当前使用路径">
      <summary>
        <span className="section-title">下一步</span>
        <strong>输入议题，选择模式，让居民圆桌开始讨论。</strong>
      </summary>
      <div className="mvp-goal">
        <span className="section-title">本轮目标</span>
        <strong>把模糊议题或零散想法，推进成思维地图、下一步行动和可导出的报告材料。</strong>
      </div>
      <div className="mvp-compass">
        <span>地图</span>
        <b>行动</b>
        <span>报告</span>
        <b>巡检</b>
      </div>
      <div className="section-title">游戏式任务线</div>
      <ol>
        {pathItems.map((item, index) => (
          <li key={item.term}>
            <i>{index + 1}</i>
            <div>
              <strong>{item.term}</strong>
              <span>{item.action}</span>
              <small>{item.result}</small>
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}
