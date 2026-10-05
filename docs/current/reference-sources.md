# 思维城邦参考资料来源索引

更新时间：2026-07-05

这份索引用来管理“思维城邦”的外部参考资料和内部文档来源。它是一份产品研发用资料台账：每条资料都说明能支持什么设计判断、适合怎样引用、还有哪些需要复核。

## 引用等级

| 等级 | 含义 | 使用方式 |
| --- | --- | --- |
| A | 可直接作为主要来源 | 可用于机制说明、世界观设定和公开材料中的出处说明 |
| B | 可作为方向性来源 | 可用于产品灵感和内部讨论，公开逐字引用前需复核底本 |
| C | 只适合作为入口或背景 | 可用于找资料，不宜作为最终引用来源 |

## 古希腊线索

| ID | 资料 | 来源 | 等级 | 对产品的价值 |
| --- | --- | --- | --- | --- |
| GRC-001 | Plato, Apology | Internet Classics Archive: https://classics.mit.edu/Plato/apology.html | A | 支持“agora 公共追问”“苏格拉底式反诘”“被听众围观的对话” |
| GRC-002 | Plato, Symposium | Internet Classics Archive: https://classics.mit.edu/Plato/symposium.html | A | 支持“围绕同一主题轮流发言”“宴饮式圆桌”“插席者/打断机制” |
| GRC-003 | Aristotle, Rhetoric, Book I | Internet Classics Archive: https://classics.mit.edu/Aristotle/rhetoric.1.i.html | A | 支持“面向未来行动、过去事实、当下评价”的三类论辩场景 |
| GRC-004 | Aristotle, Topics, Book I | Internet Classics Archive: https://classics.mit.edu/Aristotle/topics.1.i.html | A | 支持“题目、命题、定义、属性、属、偶性”的争论拆解 |
| GRC-005 | Xenophon, Memorabilia | Project Gutenberg: https://www.gutenberg.org/ebooks/1177 | A | 支持“苏格拉底在公共场域与人交谈”的生活化对话形象 |

### 古希腊资料对应到产品

| 产品对象 | 可借用来源 | 转译方式 |
| --- | --- | --- |
| 冲突议会 | GRC-002, GRC-003 | 让议会拥有题目、顺序、主持和听众，避免滑成普通聊天框 |
| 边界怀疑者 | GRC-001, GRC-005 | 使用反诘：列前提、找矛盾、逼出修正版主张 |
| 结构巡城官 | GRC-004 | 检查缺的是定义、证据、例证、反例、属类还是行动条件 |
| 三种讨论模式 | GRC-003 | 探索偏概念与价值，决策偏未来利害，行动偏条件和执行 |

## 先秦线索

| ID | 资料 | 来源 | 等级 | 对产品的价值 |
| --- | --- | --- | --- | --- |
| CHN-001 | 《论语·先进》 | 中国哲学书电子化计划: https://ctext.org/analects/xian-jin/zh | A | 支持“问志开局”：同题多位角色分别说明会把议题带向何处 |
| CHN-002 | 《孟子·滕文公上》 | 中国哲学书电子化计划: https://ctext.org/mengzi/teng-wen-gong-i/zh | A | 支持“连续现实追问”：资源、分工、代价、执行链条 |
| CHN-003 | 《战国策·齐策》 | 中国哲学书电子化计划入口: https://ctext.org/zhan-guo-ce/zh | B | 支持“类比讽谏”：用可迁移故事降低正面冲突 |
| CHN-004 | 《墨子·非攻》《墨子·公输》《墨子·小取》 | 中国哲学书电子化计划入口: https://ctext.org/mozi/zh | B | 支持“利害、可验证后果、攻防成本、名实和同异辨析” |
| CHN-005 | 《公孙龙子·白马论》 | 中国哲学书电子化计划: https://ctext.org/gongsunlongzi/bai-ma-lun/zh | A | 支持“名实校准”：先定义关键词，再允许推理 |
| CHN-006 | 《荀子·正名》 | 中国哲学书电子化计划: https://ctext.org/xunzi/zheng-ming/zh | A | 支持“名称约定与现实秩序”：治理语境下的名实检查 |
| CHN-007 | 《韩非子·说难》 | 中国哲学书电子化计划: https://ctext.org/hanfeizi/shuo-nan/zh | A | 支持“听众建模”：观点正确还要考虑对象的欲望、恐惧和禁区 |
| CHN-008 | 《庄子·天下》 | 中国哲学书电子化计划: https://ctext.org/zhuangzi/tian-xia/zh | A | 支持“旁观争论”：当讨论陷入概念争胜时，检查争论本身是否有效 |

### 先秦资料对应到产品

| 产品对象 | 可借用来源 | 转译方式 |
| --- | --- | --- |
| 问志开局协议 | CHN-001 | 每位居民先交代自己的推进方向，用户再选主线 |
| 连续现实追问 | CHN-002 | 追问谁做、资源从哪来、代价谁承担、失败后谁修 |
| 类比游说协议 | CHN-003, CHN-007 | 根据听众选择正面论证、低冲突类比或改写表达 |
| 证据与行动闭环 | CHN-004 | 把价值主张压成受益者、受损者、代价、收益和回看指标 |
| 名实校准协议 | CHN-005, CHN-006 | 抽关键词、列定义、确认采用定义、说明换定义后的结论变化 |
| 沉思庭院/暂不裁决 | CHN-008 | 当讨论过度争胜时，保存分歧并回到真实问题 |

## 内部文档来源

| 文档 | 来源地位 | 主要用途 |
| --- | --- | --- |
| [project-orientation.md](project-orientation.md) | 当前项目接手源 | 说明运行方式、主流程、关键文件和数据结构 |
| [siwei-city-mvp-manual.md](siwei-city-mvp-manual.md) | 当前产品说明源 | 说明用户如何跑通一轮讨论和导出材料 |
| [siwei-city-worldbuilding.md](siwei-city-worldbuilding.md) | 当前世界观源 | 定义城邦建筑、居民、远航行动和隐喻边界 |
| [roundtable-mechanism.md](roundtable-mechanism.md) | 当前机制源 | 定义居民角色、回应对象、道路关系和采纳机制 |
| [cultural-debate-background.md](cultural-debate-background.md) | 当前文化背景源 | 把外部思想传统转译为产品讨论协议 |
| [project-status-prd.md](project-status-prd.md) | 当前需求状态源 | 记录 PRD、现状、下一步优先级和已知风险 |
| [art-direction.md](art-direction.md) | 当前美术源 | 记录场景、建筑、角色和资产路径 |
| [version-history.md](version-history.md) | 当前版本源 | 记录 1.0 到 2.0 的变化和归档边界 |

## 引用与落地规则

- 写世界观时，优先引用 [siwei-city-worldbuilding.md](siwei-city-worldbuilding.md)，需要解释文化来源时再引用本索引和 [cultural-debate-background.md](cultural-debate-background.md)。
- 写居民 prompt 或讨论机制时，优先引用 [roundtable-mechanism.md](roundtable-mechanism.md)，再按协议选择 GRC 或 CHN 来源。
- 写公开 README、case study 或演示稿时，使用来源名称和链接即可，不要堆长段古文或译文。
- 需要逐字引用译文时，优先回到原始页面核对版本；MIT Classics 和 Project Gutenberg 的译文适合阅读与出处说明，严肃发表前应再核对权威版本。
- 《墨子》相关章节本轮只登记为 B 级，因为部分细分章节访问会被验证页拦截。公开精引《非攻》《公输》《小取》前，应使用稳定底本再次核对。

## 待补资料

| 待补项 | 原因 | 建议动作 |
| --- | --- | --- |
| 《墨子·非攻》《墨子·公输》《墨子·小取》的稳定底本 | 当前 ctext 细分章节访问不稳定 | 后续用可靠古籍库或纸本底本复核后升级为 A |
| 《战国策·齐策》具体篇章链接 | 当前登记总入口，未固定到单篇 | 后续锁定“邹忌讽齐王纳谏”对应页面 |
| 古希腊二手研究来源 | 当前主要用公开译本 | 如要写更像研究论文的背景，可补 Stanford Encyclopedia、Perseus 或学术出版社来源 |
