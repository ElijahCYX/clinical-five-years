import type { ClubProjectDef } from './clubProjects'
import { INTEREST_COPY } from './interestCopy'

const INTEREST_ACTIVITIES: Array<[string, string, number, string]> = [
  [
    "org-photo",
    "街拍交换",
    2,
    "互相交换街拍照片，收获回忆和关系"
  ],
  [
    "org-photo",
    "主题拍摄",
    2,
    "定主题、外拍、选片，产出小型作品集"
  ],
  [
    "org-photo",
    "摄影基础课",
    2,
    "给新成员讲构图和后期，积累带教贡献"
  ],
  [
    "org-birding",
    "清晨观鸟",
    2,
    "早起去湖边观察，恢复压力、认识鸟友"
  ],
  [
    "org-birding",
    "校园鸟调",
    2,
    "记录校园鸟类分布，产出调查表"
  ],
  [
    "org-birding",
    "湿地观鸟节",
    3,
    "筹备、导览、做记录，产出观鸟节"
  ],
  [
    "org-birding",
    "鸟类科普展",
    2,
    "整理照片和知识，做小型科普展"
  ],
  [
    "org-baking",
    "周五烘焙",
    2,
    "做一批简单点心，恢复压力、认识成员"
  ],
  [
    "org-baking",
    "新品试做",
    2,
    "研发新品、试吃、改配方"
  ],
  [
    "org-baking",
    "校园义卖",
    3,
    "备料、制作、摆摊、结算，产出义卖活动"
  ],
  [
    "org-baking",
    "烘焙教学课",
    2,
    "给新手讲配方和步骤，积累带教贡献"
  ],
  [
    "org-tea",
    "一席茶",
    2,
    "泡一壶茶，坐下来聊天，恢复压力"
  ],
  [
    "org-tea",
    "茶席设计",
    2,
    "设计主题茶席并布席"
  ],
  [
    "org-tea",
    "校园茶会",
    3,
    "策划、邀约、办一场公开茶会"
  ],
  [
    "org-tea",
    "茶文化小讲堂",
    2,
    "讲一次茶史或茶礼，积累表达和关系"
  ],
  [
    "org-tarot",
    "周运抽牌",
    2,
    "给成员抽牌、聊天，恢复压力、增进关系"
  ],
  [
    "org-tarot",
    "主题牌阵夜",
    2,
    "设计主题牌阵，主持一次夜谈"
  ],
  [
    "org-tarot",
    "塔罗游园会",
    3,
    "策划、布置、主持游园会"
  ],
  [
    "org-tarot",
    "牌面故事集",
    2,
    "把成员的故事整理成一本小册子"
  ],
  [
    "org-basketball",
    "友谊赛",
    2,
    "打一场友谊赛，恢复压力、认识球友"
  ],
  [
    "org-basketball",
    "训练周",
    2,
    "集中训练配合和体能"
  ],
  [
    "org-basketball",
    "院系联赛",
    3,
    "组队备战、打小组赛和淘汰赛"
  ],
  [
    "org-basketball",
    "新生训练营",
    2,
    "带新成员入门，积累带教贡献"
  ],
  [
    "org-football",
    "野球局",
    2,
    "临时约一场球，恢复压力、增进关系"
  ],
  [
    "org-football",
    "战术训练",
    2,
    "练阵型和定位球，准备正式比赛"
  ],
  [
    "org-football",
    "院际杯",
    3,
    "组队参加院际比赛，争夺名次"
  ],
  [
    "org-football",
    "足球嘉年华",
    2,
    "设计趣味足球活动，带新成员参与"
  ],
  [
    "org-badminton",
    "约球",
    2,
    "打一场双打，恢复压力、认识球友"
  ],
  [
    "org-badminton",
    "双打磨合",
    2,
    "固定搭档训练，提升默契"
  ],
  [
    "org-badminton",
    "羽毛球赛",
    3,
    "报名、备战、参加校园赛"
  ],
  [
    "org-badminton",
    "新手教学",
    2,
    "给新手讲握拍和步伐，积累贡献"
  ],
  [
    "org-running",
    "夜跑打卡",
    2,
    "完成一次夜跑，恢复压力和体质"
  ],
  [
    "org-running",
    "配速训练",
    2,
    "按配速训练，准备接力赛"
  ],
  [
    "org-running",
    "校园接力赛",
    3,
    "组队报名、训练、完成接力赛"
  ],
  [
    "org-running",
    "跑步分享会",
    2,
    "分享训练经验，组织一次集体跑"
  ],
  [
    "org-choir",
    "声部排练",
    2,
    "分声部练习，恢复压力、增进默契"
  ],
  [
    "org-choir",
    "曲目打磨",
    2,
    "选定曲目并反复合排"
  ],
  [
    "org-choir",
    "校园音乐会",
    3,
    "排练、宣传、正式演出"
  ],
  [
    "org-choir",
    "录音棚体验",
    2,
    "录制一首作品，留下纪念"
  ],
  [
    "org-guitar",
    "草地弹唱",
    2,
    "在草地弹唱，恢复压力、认识朋友"
  ],
  [
    "org-guitar",
    "原创 demo",
    2,
    "写歌、编曲、录制小样"
  ],
  [
    "org-guitar",
    "吉他之夜",
    3,
    "策划并完成一场吉他演出"
  ],
  [
    "org-guitar",
    "基础教学",
    2,
    "教新成员基础和弦，积累贡献"
  ],
  [
    "org-dance",
    "随机舞蹈",
    2,
    "参加一次随机舞蹈，释放压力"
  ],
  [
    "org-dance",
    "齐舞排练",
    2,
    "编舞、排队形、磨合"
  ],
  [
    "org-dance",
    "校园 battle",
    3,
    "组队参加校园街舞比赛"
  ],
  [
    "org-dance",
    "新生体验课",
    2,
    "带新成员体验基础律动"
  ],
  [
    "org-drama",
    "剧本围读",
    2,
    "围读剧本、分配角色，恢复压力"
  ],
  [
    "org-drama",
    "片段排练",
    2,
    "排练一个片段，打磨表演"
  ],
  [
    "org-drama",
    "学期公演",
    3,
    "排练、宣传、正式演出"
  ],
  [
    "org-drama",
    "幕后工作坊",
    2,
    "学灯光、音效、道具，做一次幕后"
  ],
  [
    "org-calligraphy",
    "每日一字",
    2,
    "每天练一个字，恢复压力、积累练习"
  ],
  [
    "org-calligraphy",
    "联展创作",
    2,
    "创作一组作品，准备联展"
  ],
  [
    "org-calligraphy",
    "校园书法展",
    3,
    "征集、装裱、布展、开幕"
  ],
  [
    "org-calligraphy",
    "校园题字",
    2,
    "为社团活动题写海报或横幅"
  ],
  [
    "org-anime",
    "补番会",
    2,
    "一起看番、讨论，恢复压力"
  ],
  [
    "org-anime",
    "同人创作",
    2,
    "画同人、写短篇、做小料"
  ],
  [
    "org-anime",
    "校园漫展",
    3,
    "摊位、cos、同人贩售，完成一次漫展"
  ],
  [
    "org-anime",
    "配音体验",
    2,
    "选片段、配音、剪辑，产出小作品"
  ],
  [
    "org-boardgame",
    "桌游夜",
    2,
    "开一桌桌游，恢复压力、认识朋友"
  ],
  [
    "org-boardgame",
    "长线团",
    2,
    "连续两周跑同一个团，形成小队关系"
  ],
  [
    "org-boardgame",
    "校园桌游赛",
    3,
    "设计赛制、组织比赛、完成决赛"
  ],
  [
    "org-boardgame",
    "规则设计",
    2,
    "写一套原创规则并组织试玩"
  ],
  [
    "org-coffee",
    "手冲练习",
    2,
    "练一次手冲，恢复压力、认识同好"
  ],
  [
    "org-coffee",
    "拼配实验",
    2,
    "试不同豆子和比例，记录风味"
  ],
  [
    "org-coffee",
    "校园咖啡节",
    3,
    "备料、布展、出杯，完成咖啡节"
  ],
  [
    "org-coffee",
    "咖啡科普",
    2,
    "做一次咖啡知识分享或小展"
  ],
  [
    "org-travel",
    "周末出逃",
    2,
    "周末去城市附近走走，恢复压力"
  ],
  [
    "org-travel",
    "城市漫游",
    2,
    "做攻略、走一条城市路线，拍照片"
  ],
  [
    "org-travel",
    "跨城旅行",
    3,
    "策划、订票、出行、整理游记"
  ],
  [
    "org-travel",
    "旅行分享会",
    2,
    "分享路线和照片，组织一次分享"
  ],
  [
    "org-film",
    "周末放映",
    2,
    "组织一场放映，恢复压力"
  ],
  [
    "org-film",
    "主题影展",
    2,
    "选片、排片、做映后讨论"
  ],
  [
    "org-film",
    "短片创作",
    3,
    "编剧、拍摄、剪辑，完成一部短片"
  ],
  [
    "org-film",
    "拉片课",
    2,
    "带成员拆解一部电影的镜头"
  ],
  [
    "org-garden",
    "阳台种植",
    2,
    "种一盆植物，恢复压力、记录生长"
  ],
  [
    "org-garden",
    "花境改造",
    2,
    "设计并改造一块校园花境"
  ],
  [
    "org-garden",
    "校园花园",
    3,
    "规划、种植、维护，完成一处小花园"
  ],
  [
    "org-garden",
    "植物交换",
    2,
    "组织成员交换盆栽和养护经验"
  ],
  [
    "org-art",
    "校园快闪",
    2,
    "排练并完成一次快闪，恢复压力"
  ],
  [
    "org-art",
    "联合排练",
    2,
    "合唱、舞蹈、器乐联合排练"
  ],
  [
    "org-art",
    "校园艺术节",
    3,
    "策划、彩排、完成艺术节演出"
  ],
  [
    "org-art",
    "幕后制作",
    2,
    "做舞美、音效、统筹，积累组织贡献"
  ]
]

interface OrgFlavor {
  place: string
  prep: string
  middle: string
  show: string
  lead: string
  support: string
  help: string
  closing: string
}

const ORG_FLAVOR: Record<string, OrgFlavor> = {
  'org-photo': {
    place: '活动室和校园',
    prep: '选片与定主题',
    middle: '布展与宣传',
    show: '影展开幕',
    lead: '主导选片和策展',
    support: '参与布展和宣传',
    help: '整理照片与展签',
    closing: '展览散场后，你们在空墙前拍了一张合影。',
  },
  'org-birding': {
    place: '校园湖边和湿地',
    prep: '定路线与观察计划',
    middle: '清晨观察与记录',
    show: '鸟调分享',
    lead: '带队观察并整理记录',
    support: '协助记录和拍照',
    help: '背望远镜、做签到',
    closing: '记录本上多了一页歪歪扭扭的鸟名和天气。',
  },
  'org-baking': {
    place: '烘焙活动室',
    prep: '定配方与备料',
    middle: '试做与调整',
    show: '正式出摊',
    lead: '负责配方和出品',
    support: '打蛋、称量、看烤箱',
    help: '洗模具和贴标签',
    closing: '最后一批点心出炉时，活动室全是黄油和糖的味道。',
  },
  'org-tea': {
    place: '茶室和活动室',
    prep: '定茶单与茶席',
    middle: '试泡与布置',
    show: '正式茶会',
    lead: '主泡和讲茶',
    support: '布席、烧水、奉茶',
    help: '洗杯、整理茶点',
    closing: '最后一泡茶分完，杯底还留着一点温度。',
  },
  'org-tarot': {
    place: '活动室',
    prep: '定主题与牌阵',
    middle: '试读与布置',
    show: '塔罗夜谈',
    lead: '主持牌阵和解读',
    support: '布置场地、接待参与者',
    help: '洗牌、点蜡烛、记笔记',
    closing: '牌收进盒子里，故事却还在几个人心里继续转。',
  },
  'org-basketball': {
    place: '篮球场',
    prep: '定阵容与训练',
    middle: '合练与战术',
    show: '正式比赛',
    lead: '组织训练和首发安排',
    support: '参与合练和轮换',
    help: '记分、递水、拍照片',
    closing: '球馆的灯关掉以后，你们还在讨论最后一攻。',
  },
  'org-football': {
    place: '足球场',
    prep: '定阵型与训练',
    middle: '战术磨合',
    show: '正式比赛',
    lead: '安排阵型和训练',
    support: '参与传接和防守',
    help: '捡球、记时、看装备',
    closing: '球衣上全是草屑，回宿舍的路上还在复盘。',
  },
  'org-badminton': {
    place: '羽毛球馆',
    prep: '定搭档与训练',
    middle: '双打磨合',
    show: '正式比赛',
    lead: '安排训练和出场',
    support: '参与双打配合',
    help: '记分、捡球、订场地',
    closing: '最后一颗球落地，你们把手里的拍子举起来碰了一下。',
  },
  'org-running': {
    place: '操场和校园路线',
    prep: '定配速与路线',
    middle: '集体训练',
    show: '正式接力赛',
    lead: '带配速和安排棒次',
    support: '跟跑、补给、记录',
    help: '看包、递水、拍照',
    closing: '冲过终点后，你们在草地上坐了很久。',
  },
  'org-choir': {
    place: '排练室和音乐厅',
    prep: '定曲目与声部',
    middle: '合排与打磨',
    show: '正式演出',
    lead: '带排和声部衔接',
    support: '跟排、纠音、走位',
    help: '搬谱架、倒水、看场地',
    closing: '最后一个和声收住，排练室里安静了两秒才响起掌声。',
  },
  'org-guitar': {
    place: '草地和排练室',
    prep: '定歌单与编曲',
    middle: '合练与写歌',
    show: '正式演出',
    lead: '编曲和带队排练',
    support: '弹奏、和声、调音',
    help: '搬音箱、拍照、看线材',
    closing: '最后一个和弦散在风里，你们开始收地上的线。',
  },
  'org-dance': {
    place: '舞蹈房和舞台',
    prep: '定舞段与队形',
    middle: '排练与磨合',
    show: '正式演出',
    lead: '编舞和带排',
    support: '跟排、扣动作',
    help: '放音乐、拍视频、看道具',
    closing: '音乐停下后，镜子里的几个人还在喘气。',
  },
  'org-drama': {
    place: '排练室和剧场',
    prep: '围读与定角',
    middle: '排练与走位',
    show: '正式公演',
    lead: '导演和统筹排练',
    support: '对戏、记走位、改台词',
    help: '道具、灯光、场记',
    closing: '幕布落下，你们在后台抱了一下，才想起来卸妆。',
  },
  'org-calligraphy': {
    place: '书画室和展厅',
    prep: '定内容与形式',
    middle: '创作与装裱',
    show: '正式展出',
    lead: '定主题和主笔',
    support: '练字、裁纸、布展',
    help: '研墨、洗笔、贴标签',
    closing: '墨迹干透以后，你站在自己的字前面看了一会儿。',
  },
  'org-anime': {
    place: '活动室和展区',
    prep: '定主题与分工',
    middle: '创作与排练',
    show: '漫展现场',
    lead: '统筹摊位和节目',
    support: '画稿、排练、布摊',
    help: '裁纸、贴海报、看摊位',
    closing: '收摊时你们把最后一张海报卷起来，约好下次还来。',
  },
  'org-boardgame': {
    place: '活动室',
    prep: '定游戏与分组',
    middle: '试玩与调整规则',
    show: '正式开团',
    lead: '带团和讲规则',
    support: '试玩、记分、带新玩家',
    help: '摆桌、发牌、收骰子',
    closing: '最后一张牌收进盒里，大家还在争刚才那步该不该走。',
  },
  'org-coffee': {
    place: '咖啡角',
    prep: '定豆单与器具',
    middle: '试冲与拼配',
    show: '咖啡出摊',
    lead: '定豆单和冲煮方案',
    support: '磨豆、注水、试喝',
    help: '洗杯、贴标签、收桌面',
    closing: '最后一杯分完，空气里还有一点烘焙后的甜味。',
  },
  'org-travel': {
    place: '校园和城市',
    prep: '定路线与预算',
    middle: '踩点与预订',
    show: '正式出发',
    lead: '做攻略和带队',
    support: '查交通、订住宿、拍照',
    help: '看行李、记时间、整理票据',
    closing: '回程的车上，你们把这一路的照片翻了一遍。',
  },
  'org-film': {
    place: '放映室和校园',
    prep: '定片单与场地',
    middle: '宣传与试映',
    show: '正式放映',
    lead: '选片和主持映后',
    support: '排片、布场、调设备',
    help: '贴海报、检票、收问卷',
    closing: '字幕走完，灯亮起来，还有几个人坐在原位没动。',
  },
  'org-garden': {
    place: '校园花圃和活动室',
    prep: '定花境与工具',
    middle: '翻土与种植',
    show: '花园开放',
    lead: '设计花境和分工',
    support: '翻土、播种、浇水',
    help: '搬盆、贴标签、收工具',
    closing: '手上全是泥，但新种下去的那一排看起来很有希望。',
  },
  'org-art': {
    place: '排练厅和舞台',
    prep: '定节目与分工',
    middle: '联排与打磨',
    show: '艺术节演出',
    lead: '统筹节目和联排',
    support: '排练、走位、候场',
    help: '搬道具、看服装、递水',
    closing: '谢幕时灯光打下来，你在人群里找到了自己的位置。',
  },
}

function buildProject(
  orgId: string,
  title: string,
  duration: number,
  core: string,
  index: number,
): ClubProjectDef {
  const flavor = ORG_FLAVOR[orgId] ?? {
    place: '活动室',
    prep: '筹备与分工',
    middle: '推进与准备',
    show: '正式活动',
    lead: '主动承担核心任务',
    support: '配合完成准备工作',
    help: '做一点轻量的现场工作',
    closing: '活动结束后，你在门口站了一会儿。',
  }
  const copy = INTEREST_COPY[`${orgId}|${title}`] ?? {
    scene: `${flavor.place}里，${title}的第一次筹备开始了。`,
    finale: `${title}最后顺利结束。${flavor.closing}`,
  }
  const stageTitles =
    duration === 2
      ? [`筹备「${title}」`, `呈现「${title}」`]
      : [`筹备「${title}」`, `推进「${title}」`, `呈现「${title}」`]
  const stageIntros = [
    `第 1 周例会，${flavor.place}。${copy.scene} 这周先把「${title}」的准备工作定下来。`,
    ...(duration === 3
      ? [`第 2 周例会。${core}。这一周要把「${title}」真正往前推一步。`]
      : []),
    `最后阶段。${copy.finale}`,
  ]
  const stages = Array.from({ length: duration }, (_, i) => ({
    title: stageTitles[i] ?? stageTitles[stageTitles.length - 1],
    description: stageIntros[i] ?? stageIntros[stageIntros.length - 1],
    choices: [
      {
        id: 'lead',
        label: flavor.lead,
        description: `这周由你多担一点：${stageTitles[i] ?? stageTitles[stageTitles.length - 1]}。`,
        contribution: 3,
        effects: { stress: 3, composite: 2, socialGrowth: 3 },
      },
      {
        id: 'support',
        label: flavor.support,
        description: `和别人一起完成「${title}」的本周准备，不抢主位但也不缺席。`,
        contribution: 2,
        effects: { energy: -3, stress: -1, socialGrowth: 2 },
      },
      {
        id: 'help',
        label: flavor.help,
        description: `做一点轻活，顺便看看大家怎么把「${title}」办起来。`,
        contribution: 1,
        effects: { energy: -1, socialGrowth: 1 },
      },
    ],
  }))
  const eventTitles =
    duration === 2
      ? [`${title} · 开场`, `${title} · 收尾`]
      : [`${title} · 准备`, `${title} · 进行中`, `${title} · 收尾`]
  const eventPhases = Array.from({ length: duration }, (_, i) => ({
    title: eventTitles[i] ?? title,
    description:
      i === duration - 1
        ? copy.finale
        : `「${title}」的第 ${i + 1} 个活动阶段。${copy.scene}`,
  }))
  const n = index + 1
  return {
    id: `interest-${orgId}-${String(n).padStart(2, '0')}`,
    orgId,
    title,
    subtitle: core,
    prepWeeks: duration,
    eventWeek: duration,
    eventSlots: duration === 2 ? [18, 19] : [18, 19, 20],
    stages,
    eventPhases,
    worldTitle: `${title}如期举办`,
    worldText: `${copy.finale} ${core}。`,
    personalFeedback: {
      core: {
        title: '活动核心成员',
        text: `从「${title}」的准备到现场，你几乎都在。${copy.finale}`,
        effects: { composite: 3, socialGrowth: 5, stress: -3 },
      },
      helper: {
        title: '活动的帮手',
        text: `你不是「${title}」最显眼的人，但有几件关键的小事确实是你做的。${copy.finale}`,
        effects: { composite: 2, socialGrowth: 3, stress: -2 },
      },
      audience: {
        title: '活动的观众',
        text: `你这次没有参与筹备，但还是去看了「${title}」。${copy.finale}`,
        effects: { socialGrowth: 1 },
      },
      prepared: {
        title: '参与了筹备，但没到现场',
        text: `你参与了「${title}」的前期准备，但活动当天没有出现。后来你看到了现场照片：${copy.finale}`,
        effects: { socialGrowth: 1 },
      },
      absent: {
        title: '在群里看到活动',
        text: `你这次没有去。「${title}」还是如期发生了。${copy.finale}`,
        effects: {},
      },
    },
  }
}

export const INTEREST_PROJECTS: ClubProjectDef[] = INTEREST_ACTIVITIES.map(
  ([orgId, title, duration, core], index) =>
    buildProject(orgId, title, duration, core, index),
)
