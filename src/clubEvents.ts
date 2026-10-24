import type { OrganizationCategory } from './types'

export type ClubEventCategory = 'academic' | 'interest' | 'practice'

export interface ClubEventEffects {
  energy?: number
  stress?: number
  money?: number
  composite?: number
  socialGrowth?: number
  prep?: number
  english?: number
  intimacy?: number
}

export interface ClubEvent {
  id: string
  category: ClubEventCategory
  title: string
  text: string
  effects: ClubEventEffects
}

export const CLUB_EVENT_CHANCE = 0.35

export const CLUB_EVENTS: ClubEvent[] = [
  // 学科学习类 10
  {
    id: 'club-academic-01',
    category: 'academic',
    title: '组会旁听席',
    text: '你本来只是去借一间空教室，却被拉进了隔壁课题组的组会。投影上是一张你完全没看懂的 Western blot，导师讲到最后突然问你：“如果是你，下一步怎么验证？”你硬着头皮说了两句，没想到他点了点头。',
    effects: { prep: 5, composite: 1 },
  },
  {
    id: 'club-academic-02',
    category: 'academic',
    title: '遗落的题库',
    text: '活动室的柜子里翻出一沓旧题库，边角写着十几届学长学姐的名字。你们几个人蹲在地上分题，谁抢到哪一页就归谁。最后你抱走了一叠，决定今晚不回宿舍。',
    effects: { prep: 8, energy: -3 },
  },
  {
    id: 'club-academic-03',
    category: 'academic',
    title: '病例讨论加时',
    text: '原本说好八点结束的病例讨论，因为一个鉴别诊断拖到了十点半。有人叫了外卖，有人还在白板上画流程。你发现自己居然记得住刚才争得最凶的那一条。',
    effects: { prep: 6, composite: 2, stress: 2 },
  },
  {
    id: 'club-academic-04',
    category: 'academic',
    title: '文献共读',
    text: '本周轮到讲一篇关于动脉粥样硬化的综述。你准备了很久，讲的时候还是被问住了两次。回家路上你重新翻出原文，第一次觉得那些拗口的句子开始有点意义。',
    effects: { prep: 4, composite: 1, stress: -2 },
  },
  {
    id: 'club-academic-05',
    category: 'academic',
    title: '错题本交换',
    text: '大家把自己最不想承认的错题拍在桌上，约定谁都不许嘲笑。轮到你的那页时，有人认真抄了下来，说：“这个坑我也踩过。”你突然觉得错题没那么丢人。',
    effects: { prep: 5, socialGrowth: 4, stress: -2 },
  },
  {
    id: 'club-academic-06',
    category: 'academic',
    title: '实验室蹭饭',
    text: '活动结束后，师兄带你们去实验室热饭。冰箱里贴着“不要动我的酸奶”和“动了我也不知道”的纸条。你们边吃边聊，话题从细胞污染一路飘到期末周怎么活。',
    effects: { composite: 1, stress: -4, socialGrowth: 5 },
  },
  {
    id: 'club-academic-07',
    category: 'academic',
    title: '学术讲座散场',
    text: '讲座结束得比预告早，主讲人没有急着走，站在门口和几个学生聊了二十几分钟。你问了一个准备很久的问题，他说这个问题“还挺值得做”，然后给了你一个文献方向。',
    effects: { prep: 3, composite: 2, stress: -2 },
  },
  {
    id: 'club-academic-08',
    category: 'academic',
    title: '模拟问诊',
    text: '社团组织了一次模拟问诊，你扮演患者，对方扮演医生。你故意给出含糊的疼痛描述，看TA怎么追问。复盘时大家笑得不行，但你也记住了完整的问诊顺序。',
    effects: { prep: 5, socialGrowth: 3, stress: -3 },
  },
  {
    id: 'club-academic-09',
    category: 'academic',
    title: '备考资料接龙',
    text: '群里有人开了个资料接龙，每个人都往共享文件夹里丢一点东西。你整理了自己的笔记，取了个很夸张的名字：“框架梳理终极版（应该不是终版）”。第二天有人给你点了赞。',
    effects: { prep: 4, composite: 1, energy: -2 },
  },
  {
    id: 'club-academic-10',
    category: 'academic',
    title: '竞赛组队',
    text: '学科竞赛要组队，你被拉去凑人数。几个人在食堂桌子上分工，越聊越兴奋，最后发现报名截止时间是今天下午五点。你们踩着点提交，像完成了一场小型抢救。',
    effects: { composite: 3, prep: 2, energy: -2, stress: 2 },
  },

  // 兴趣爱好类 10
  {
    id: 'club-interest-01',
    category: 'interest',
    title: '临时外拍',
    text: '天气突然放晴，摄影社在群里喊了一句“有人去楼顶吗”，十分钟后你们已经架好机位。夕阳把教学楼照成橘色，你拍了一张朋友逆光的侧脸，决定不发朋友圈，自己留着。',
    effects: { stress: -8, energy: 3, intimacy: 3 },
  },
  {
    id: 'club-interest-02',
    category: 'interest',
    title: '清晨观鸟',
    text: '为了赶鸟鸣，你们六点半在湖边集合。有人带了望远镜，有人只带了一袋面包。鸟没看到几只，倒是看见一只松鼠把面包抢走了。回宿舍补觉前，你觉得脑子轻了一点。',
    effects: { stress: -7, energy: 4, intimacy: 2 },
  },
  {
    id: 'club-interest-03',
    category: 'interest',
    title: '烘焙翻车',
    text: '烘焙社的烤箱今天脾气很大，第一盘可颂全部塌了。你们蹲在烤箱前研究哪里出了问题，最后把失败的成品分着吃完。有人边吃边说：“至少黄油没白放。”',
    effects: { stress: -5, energy: 5, money: -10, socialGrowth: 3 },
  },
  {
    id: 'club-interest-04',
    category: 'interest',
    title: '茶席收尾',
    text: '活动结束，大家没有急着走。有人重新烧了一壶水，把最后一泡茶分给留下来的人。窗外在刮风，屋里只有杯盖碰杯沿的轻响。你坐了一会儿，没看手机。',
    effects: { stress: -10, energy: 2, socialGrowth: 4 },
  },
  {
    id: 'club-interest-05',
    category: 'interest',
    title: '塔罗夜谈',
    text: '塔罗社今晚的主题是“最近最想逃开的事”。你抽到一张逆位的牌，大家轮流解读，最后变成一场聊到门禁的夜谈。你发现有些事情说出来，确实会轻一点。',
    effects: { stress: -8, energy: 2, socialGrowth: 5 },
  },
  {
    id: 'club-interest-06',
    category: 'interest',
    title: '篮球加时',
    text: '篮球社临时加了一场半场三对三。你投丢了最后一个绝杀，队友却说“下次还传你”。回宿舍的路上你们还在复盘最后一攻，膝盖有点酸，心情却很好。',
    effects: { stress: -8, energy: 7, intimacy: 3 },
  },
  {
    id: 'club-interest-07',
    category: 'interest',
    title: '合唱合声',
    text: '合唱团终于把那段总也合不齐的副歌磨了下来。指挥说“这次可以了”的时候，所有人同时松了口气。走出排练室，你发现自己还在心里默默哼那个和声。',
    effects: { stress: -7, energy: 5, socialGrowth: 5 },
  },
  {
    id: 'club-interest-08',
    category: 'interest',
    title: '桌游背刺',
    text: '桌游社开局前所有人说好“和平发育”，第三轮就有人开始背刺。你被最信任的队友卖了一次，笑得拍桌子。散场时你们约好下周继续，谁都不许记仇。',
    effects: { stress: -6, energy: 4, socialGrowth: 6 },
  },
  {
    id: 'club-interest-09',
    category: 'interest',
    title: '午夜放映',
    text: '电影社临时加了一场午夜场。片子节奏很慢，中途有人睡着，有人哭得很大声。灯亮起来的时候，你们谁也没急着讨论剧情，只是坐在原位等字幕走完。',
    effects: { stress: -9, energy: 3, intimacy: 2 },
  },
  {
    id: 'club-interest-10',
    category: 'interest',
    title: '草地音乐节',
    text: '校园音乐节缺一个搬器材的人，你被兴趣社的熟人拉去帮忙。忙完以后你们坐在草地最后一排听完了整场演出。回宿舍时耳朵还在响，但脑子难得是空的。',
    effects: { stress: -9, energy: 6, intimacy: 4 },
  },

  // 社会实践类 10
  {
    id: 'club-practice-01',
    category: 'practice',
    title: '社区义诊',
    text: '社区义诊来了很多老人，量血压的队伍排到了门口。你负责登记，被问了十几个和病无关的问题：孩子多大、学医累不累、以后去哪个医院。走的时候有人往你手里塞了一袋橘子。',
    effects: { composite: 5, socialGrowth: 5, stress: -3 },
  },
  {
    id: 'club-practice-02',
    category: 'practice',
    title: '支教试讲',
    text: '支教协会安排了一次试讲。你准备了一晚上的课件，真正站上台才发现孩子们根本不按你的流程走。你临场改成一个接一个的提问，下课铃响的时候，他们居然有点不想走。',
    effects: { composite: 5, prep: 2, stress: -2 },
  },
  {
    id: 'club-practice-03',
    category: 'practice',
    title: '募捐摆摊',
    text: '公益社在食堂门口摆摊募捐，路过的人大多很急。你们从中午守到傍晚，最后筹到的钱不算多，但每一笔都被认真记了下来。收摊时有人提议去吃一顿便宜的庆祝饭。',
    effects: { composite: 4, socialGrowth: 6, energy: -3 },
  },
  {
    id: 'club-practice-04',
    category: 'practice',
    title: '环保调研',
    text: '环保行动社去河边做垃圾分类调研。太阳很晒，样本比想象中难收集，还有路人以为你们在拍短视频。回程的公交上大家都不说话，但把数据整理完的那一刻还是挺踏实。',
    effects: { composite: 4, stress: -2, energy: -4 },
  },
  {
    id: 'club-practice-05',
    category: 'practice',
    title: '访学接待',
    text: '访学团接待了外校来的同学。你负责带路，结果自己先在教学楼里迷了路。对方笑着说“没事，我们也常迷路”，最后你们一起找到了会议室，也顺便记住了彼此的学校。',
    effects: { composite: 3, english: 4, socialGrowth: 4, stress: -2 },
  },
  {
    id: 'club-practice-06',
    category: 'practice',
    title: '医院志愿岗',
    text: '医院志愿服务排班临时缺人，你补了一个下午。导诊台前的问题重复又琐碎，你站到腿酸，却在帮一位老人找到科室后，听见他很认真地说了一声“谢谢你，小姑娘/小伙子”。',
    effects: { composite: 4, prep: 2, stress: -2, energy: -2 },
  },
  {
    id: 'club-practice-07',
    category: 'practice',
    title: '健康宣讲',
    text: '社区健康宣讲轮到你们组。你把高血压的用药误区改成了几个小故事，台下的大爷大妈听得比上课还认真。提问环节有人举手问：“那我这药到底能不能停？”你第一次觉得知识真的能落到人身上。',
    effects: { composite: 5, socialGrowth: 5, stress: -2 },
  },
  {
    id: 'club-practice-08',
    category: 'practice',
    title: '乡村调研',
    text: '社会实践去乡村做调研，来回坐了四个小时的车。你们住在镇上的小旅馆，晚上整理访谈记录，发现白天听到的故事比问卷上的选项复杂得多。回程时有人一路没说话。',
    effects: { composite: 6, energy: -5, stress: 2, socialGrowth: 3 },
  },
  {
    id: 'club-practice-09',
    category: 'practice',
    title: '公益夜跑',
    text: '公益社组织夜跑，每跑一公里就有人替你们捐一笔钱。你本来只想走两圈，最后被气氛带着跑完了五公里。冲线时大家举着手机照明，像一场很简陋的庆祝仪式。',
    effects: { composite: 3, stress: -4, energy: 3, socialGrowth: 3 },
  },
  {
    id: 'club-practice-10',
    category: 'practice',
    title: '志愿表彰',
    text: '学期末的志愿表彰会上，你被念到了名字。奖状印得很普通，台下鼓掌的人也不多，但负责人说了一句：“这学期最稳定的排班，有你一份。”你把奖状卷起来，塞进了书包最外层。',
    effects: { composite: 6, socialGrowth: 3, intimacy: 3 },
  },
]

export function pickClubEvent(category: OrganizationCategory): ClubEvent {
  const pool =
    category === 'union' || category === 'debate'
      ? CLUB_EVENTS
      : CLUB_EVENTS.filter((event) => event.category === category)
  return pool[Math.floor(Math.random() * pool.length)]
}
