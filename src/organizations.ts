import type { GameState, Organization, OrganizationCategory, OrganizationRole } from './types'

export const ORGANIZATIONS: Organization[] = [
  // 学科学习类 5
  { id: 'org-research', name: '医学研究促进会', category: 'academic', description: '读文献、做课题、互相改开题报告。', benefit: { prep: 9, composite: 2 } },
  { id: 'org-clinical', name: '临床技能交流社', category: 'academic', description: '练体格检查、讨论病例，偶尔互相扮演标准化病人。', benefit: { prep: 7, stress: -2, composite: 1 } },
  { id: 'org-ebm', name: '循证医学读书会', category: 'academic', description: '每周读一篇临床研究，练习把证据讲成人话。', benefit: { prep: 5, composite: 2 } },
  { id: 'org-imaging', name: '医学影像探索社', category: 'academic', description: '看片、认结构，在黑白灰里寻找病变。', benefit: { prep: 8, composite: 1 } },
  { id: 'org-humanities', name: '医学史与人文社', category: 'academic', description: '从医学史和叙事医学里，重新理解“人”。', benefit: { prep: 4, stress: -3, composite: 2 } },

  // 兴趣爱好类 20
  { id: 'org-photo', name: '摄影社', category: 'interest', description: '扫街、拍人像，也拍食堂最难吃的菜。', benefit: { stress: -7, energy: 7, composite: 1 } },
  { id: 'org-birding', name: '观鸟社', category: 'interest', description: '在校园和湿地找鸟，顺便早起。', benefit: { stress: -9, energy: 4, composite: 1 } },
  { id: 'org-baking', name: '烘焙社', category: 'interest', description: '做蛋糕、饼干和失败率很高的可颂。', benefit: { stress: -6, energy: 9, composite: 1 } },
  { id: 'org-tea', name: '茶艺社', category: 'interest', description: '泡茶、闻香，把时间泡慢一点。', benefit: { stress: -10, energy: 3, composite: 1 } },
  { id: 'org-tarot', name: '塔罗牌社', category: 'interest', description: '抽牌、解牌，偶尔把考试结果算得更糟。', benefit: { stress: -7, energy: 5, composite: 1 } },
  { id: 'org-basketball', name: '篮球社', category: 'interest', description: '打球、看球，以及争论谁才是队里最菜的。', benefit: { stress: -8, energy: 8, composite: 1 } },
  { id: 'org-football', name: '足球社', category: 'interest', description: '在操场上奔跑，把烦恼踢出边线。', benefit: { stress: -8, energy: 7, composite: 1 } },
  { id: 'org-badminton', name: '羽毛球社', category: 'interest', description: '挥拍、捡球，运动量主要来自捡球。', benefit: { stress: -7, energy: 8, composite: 1 } },
  { id: 'org-running', name: '跑步社', category: 'interest', description: '夜跑、晨跑，以及互相劝对方再跑一圈。', benefit: { stress: -9, energy: 6, composite: 1 } },
  { id: 'org-choir', name: '合唱团', category: 'interest', description: '排练、和声，在跑调里寻找和谐。', benefit: { stress: -9, energy: 5, composite: 1 } },
  { id: 'org-guitar', name: '吉他社', category: 'interest', description: '弹唱、写歌，宿舍楼下偶尔被投诉。', benefit: { stress: -8, energy: 6, composite: 1 } },
  { id: 'org-dance', name: '街舞社', category: 'interest', description: '排练、battle，用身体把压力甩出去。', benefit: { stress: -7, energy: 9, composite: 1 } },
  { id: 'org-drama', name: '话剧社', category: 'interest', description: '排戏、背台词，在别人的故事里喘口气。', benefit: { stress: -8, energy: 5, composite: 1 } },
  { id: 'org-calligraphy', name: '书法社', category: 'interest', description: '研墨、写字，把乱糟糟的心按回纸上。', benefit: { stress: -10, energy: 3, composite: 1 } },
  { id: 'org-anime', name: '动漫社', category: 'interest', description: '补番、画同人，讨论谁才是本季黑马。', benefit: { stress: -7, energy: 6, composite: 1 } },
  { id: 'org-boardgame', name: '桌游社', category: 'interest', description: '开团、背刺，在游戏里学会信任与背叛。', benefit: { stress: -9, energy: 4, composite: 1 } },
  { id: 'org-coffee', name: '咖啡社', category: 'interest', description: '手冲、拉花，研究哪款豆子最像续命水。', benefit: { stress: -7, energy: 7, composite: 1 } },
  { id: 'org-travel', name: '旅行协会', category: 'interest', description: '做攻略、周末出逃，把校园留在身后。', benefit: { stress: -11, energy: 5, composite: 1 } },
  { id: 'org-film', name: '电影社', category: 'interest', description: '放映、拉片，在黑暗里看完别人的一生。', benefit: { stress: -8, energy: 6, composite: 1 } },
  { id: 'org-garden', name: '园艺社', category: 'interest', description: '种花、换盆，以及目送植物阵亡。', benefit: { stress: -9, energy: 4, composite: 1 } },

  // 社会实践类 5
  { id: 'org-charity', name: '公益社', category: 'practice', description: '做公益、跑社区，把时间交给具体的人。', benefit: { composite: 5, stress: -2, socialGrowth: 10 } },
  { id: 'org-visit', name: '访学团', category: 'practice', description: '联系访学、做行程，去别的学校看看。', benefit: { composite: 6, stress: -2 } },
  { id: 'org-teach', name: '支教协会', category: 'practice', description: '备课、支教，在讲台上第一次被叫老师。', benefit: { composite: 6, socialGrowth: 8 } },
  { id: 'org-community', name: '社区健康服务队', category: 'practice', description: '量血压、做科普，把医学带出校园。', benefit: { composite: 5, prep: 2 } },
  { id: 'org-green', name: '环保行动社', category: 'practice', description: '捡垃圾、做调研，和更具体的世界打交道。', benefit: { composite: 4, stress: -3 } },

  // 医学院学生会
  { id: 'org-union', name: '医学院学生会', category: 'union', description: '办活动、写通知、在各方之间来回协调。', benefit: { composite: 4, stress: -3, energy: 3, socialGrowth: 10 } },
]

export const ORG_BY_ID: Record<string, Organization> = Object.fromEntries(
  ORGANIZATIONS.map((org) => [org.id, org]),
)

export const ORG_CATEGORY_LABELS: Record<OrganizationCategory, string> = {
  academic: '学科学习',
  interest: '兴趣爱好',
  practice: '社会实践',
  union: '学生会',
}

export function roleBenefitMultiplier(role: OrganizationRole): number {
  if (role === 'officer') return 1.15
  if (role === 'president' || role === 'honorary') return 1.3
  return 1
}

export function roleLabel(
  category: OrganizationCategory,
  role: OrganizationRole,
): string {
  if (category === 'union') {
    if (role === 'president') return '会长'
    if (role === 'officer') return '干事'
    if (role === 'honorary') return '荣誉会长'
    return '会员'
  }
  if (role === 'president') return '社长'
  if (role === 'officer') return '干事'
  if (role === 'honorary') return '荣誉社长'
  return '社员'
}

export function organizationBenefitLines(
  org: Organization,
  multiplier = 1,
): string[] {
  const benefit = org.benefit
  const lines: string[] = []
  if (benefit.prep) lines.push(`随机在修课程准备度 +${Math.round(benefit.prep * multiplier)}`)
  if (benefit.stress) lines.push(`压力 ${Math.round(benefit.stress * multiplier)}`)
  if (benefit.energy) lines.push(`精力 +${Math.round(benefit.energy * multiplier)}`)
  if (benefit.composite) lines.push(`综测 +${Math.round(benefit.composite * multiplier)}`)
  if (benefit.socialGrowth) lines.push(`人际成长 +${Math.round(benefit.socialGrowth * multiplier)}`)
  return lines
}

export function clubApplicationChance(state: GameState, org: Organization): number {
  const player = state.player
  if (!player) return 0.1
  const social = player.attrs.social
  const gpa =
    state.cumulativeCredits > 0
      ? state.cumulativePoints / state.cumulativeCredits
      : 3
  let chance = 0.38 + social * 0.035
  if (org.category === 'academic') chance += (gpa - 2.8) * 0.12
  if (org.category === 'practice') chance += Math.min(0.2, state.composite / 220)
  return Math.max(0.12, Math.min(0.94, chance))
}

export const CLUB_REJECTIONS = [
  '这次报名的人有点多，我们优先考虑了时间更匹配的同学。秋季还有机会，别灰心。',
  '你的履历很不错，但我们这次更想找一位能长期参与的同学。谢谢你愿意来。',
  '面试时你有点紧张，不过我们记住了你的认真。下一次招新再来试试吧。',
  '我们今年的名额已经满了，但如果你愿意，可以以旁听身份先来参加公开活动。',
  '你很适合这个方向，只是我们现在更需要有相关经验的同学。抱歉。',
  '负责人讨论后觉得你和另一个同学都很合适，但名额只有一个。希望下次还能见到你。',
  '你的想法很好，不过我们这次招新更偏向能立刻接手项目的同学。',
  '这次面试的竞争比预想中激烈。不是你不够好，是位置太少。',
  '我们觉得你可能还没有想清楚自己想在社团里得到什么。可以再逛逛其他摊位。',
  '你的时间安排和我们例会冲突较多，担心会影响你的体验，所以暂时没有通过。',
  '很感谢你来，但我们这次想招一个更外向一点、能带动气氛的同学。',
  '你在某个问题上的回答让我们印象很深，只是综合排序差了一点点。',
  '我们今年想尝试一种新的分工方式，和你的特长不太匹配。祝你找到更适合的地方。',
  '名额有限，负责人之间也有不同意见。最后我们没有做出让你加入的决定，抱歉。',
  '你看起来是个很认真的人，但这次我们更需要能频繁出差和跑现场的同学。',
  '面试时间比较短，可能没有充分了解你。希望下次能多聊一会儿。',
  '我们这次招新偏向大一新生，想给刚入学的同学更多机会。',
  '你的技能点很亮眼，但我们目前最缺的并不是这一块。谢谢你认真准备。',
  '这次结果不代表对你的评价。社团之外也有很多值得投入的事情。',
  '我们决定先保持现有规模，不新增成员。很遗憾这次没能一起共事。',
]

export function pickClubRejection(): string {
  return CLUB_REJECTIONS[Math.floor(Math.random() * CLUB_REJECTIONS.length)]
}

export const CLUB_INACTIVITY_WARNING_TEXT =
  '负责人把你叫到活动室，桌上还摆着上次活动的签到表。TA没有发火，只是把那张纸推到你面前：“这学期你一次都没来。我们不是要求每个人都随叫随到，但一个组织要运转，总得有人出现。”你解释说最近课多、事情杂，TA点点头，说理解，却还是把话说完了。临走前，TA给你留了一个台阶：“这次先记一次警告，下个学期至少来一次。如果还是见不到你，我们只能按章程处理。”你走出活动室，走廊里很安静，手机里还有没回完的群消息。'
export const CLUB_INACTIVITY_REMOVAL_TEXT =
  '新学期的第一次例会上，负责人没有点名，只在群里发了一份简短的公告。你的名字出现在“退出成员”那一栏，理由写着“连续两个学期未参与组织活动”。群里的消息很快被下一项议程刷过去，没有人@你，也没有人追问。你退出群聊之前，看见他们正在安排这学期的招新和活动，时间地点都排得很满。你曾经也属于那里，只是后来每次都想着“下次再去”，直到没有下一次。组织照常运转，活动照常有人参加，只有你的工牌被收进了抽屉，像一件没人认领的旧物。'
