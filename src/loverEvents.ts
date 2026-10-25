export type LoverEventKind = 'daily' | 'support'

export interface LoverEvent {
  id: string
  kind: LoverEventKind
  title: string
  text: string
  money?: number
  intimacy?: number
  stress?: number
  energy?: number
}

export const LOVER_EVENTS: LoverEvent[] = [
  // 日常联系 10
  {
    id: 'lover-daily-01',
    kind: 'daily',
    title: '一杯奶茶',
    text: '你在电话里听见 TA 那边有吸管戳破封口的声音。你说想见 TA，TA 笑了一下：“那你请我喝奶茶。”半小时后，你们在食堂门口碰面，TA 把第一口递给你。',
    money: 25,
    intimacy: 3,
    stress: -3,
    energy: 2,
  },
  {
    id: 'lover-daily-02',
    kind: 'daily',
    title: '小蛋糕',
    text: '你路过面包店，买了一块卖相很好的小蛋糕。电话那头的 TA 说“我在图书馆”，你提着盒子穿过半个校园，看见 TA 在门口等你，眼睛先落在蛋糕上，再落到你身上。',
    money: 35,
    intimacy: 4,
    stress: -3,
    energy: 2,
  },
  {
    id: 'lover-daily-03',
    kind: 'daily',
    title: '临时电影',
    text: '你说想看电影，TA 说“现在？”十分钟后你们已经站在影院门口。片子不算好看，但 TA 在黑暗里把爆米花桶往你这边推了推，你觉得这两个小时没有浪费。',
    money: 80,
    intimacy: 5,
    stress: -4,
    energy: 2,
  },
  {
    id: 'lover-daily-04',
    kind: 'daily',
    title: '打球',
    text: 'TA 问你要不要一起去打球。你本来只想坐在场边，最后还是被拉上场。输赢不重要，重要的是 TA 在你投进一个很勉强的球之后，比你还大声地喊了一句“好球”。',
    money: 20,
    intimacy: 4,
    stress: -5,
    energy: 4,
  },
  {
    id: 'lover-daily-05',
    kind: 'daily',
    title: '一起做手工',
    text: '你们报名了一个手工体验活动。TA 做得比你认真，成品却比你歪。回宿舍的路上，TA 把那个歪歪扭扭的小东西挂在你包上，说“不许摘”。',
    money: 60,
    intimacy: 5,
    stress: -4,
    energy: 2,
  },
  {
    id: 'lover-daily-06',
    kind: 'daily',
    title: '绕湖散步',
    text: '电话接通后，你只是说“出来走走”。你们沿着湖边走了一圈，没有聊什么重要的事。风有点凉，TA 把外套往你那边偏了偏，你假装没有发现。',
    money: 20,
    intimacy: 3,
    stress: -5,
    energy: 3,
  },
  {
    id: 'lover-daily-07',
    kind: 'daily',
    title: '一只小礼物',
    text: '你在文具店看见一个很适合 TA 的小东西，犹豫了几秒还是买了。TA 收到时先问“多少钱”，你说不贵。TA 把它放进包里，又拿出来看了看。',
    money: 45,
    intimacy: 4,
    stress: -3,
    energy: 1,
  },
  {
    id: 'lover-daily-08',
    kind: 'daily',
    title: '夜宵',
    text: '你说饿了，TA 说“巧了”。你们在便利店门口分一份关东煮，热气把眼镜熏得发白。TA 把自己喜欢的那颗丸子夹给你，说下次换你请。',
    money: 40,
    intimacy: 4,
    stress: -4,
    energy: 3,
  },
  {
    id: 'lover-daily-09',
    kind: 'daily',
    title: '看展',
    text: '你们去看了学校附近的小展。TA 在一幅画前站了很久，你站在旁边看 TA。出来以后 TA 问你最喜欢哪幅，你说“都行”，TA 说你不真诚。',
    money: 60,
    intimacy: 4,
    stress: -3,
    energy: 2,
  },
  {
    id: 'lover-daily-10',
    kind: 'daily',
    title: '周末短途',
    text: '你们临时决定去附近走走。其实只是坐了两站公交，在一个陌生的小公园里吃了便利店饭团。回来时 TA 靠在你肩上睡着，你一动也不敢动。',
    money: 100,
    intimacy: 5,
    stress: -5,
    energy: 5,
  },

  // 情感支持 10
  {
    id: 'lover-support-01',
    kind: 'support',
    title: '得奖了',
    text: '你第一时间打电话告诉 TA 得奖的消息。TA 在那头安静听完，然后说：“我就知道。”你本来准备了很多谦虚的话，最后只说了句“想见你”。',
    intimacy: 3,
    stress: -7,
    energy: 3,
  },
  {
    id: 'lover-support-02',
    kind: 'support',
    title: '淋雨了',
    text: '你淋着雨回到宿舍，给 TA 打电话时牙齿还在打颤。TA 一边骂你不带伞，一边让你先去洗热水澡。电话没有挂，直到你换了衣服回来，TA 才说：“下次我去接你。”',
    intimacy: 2,
    stress: -8,
    energy: 3,
  },
  {
    id: 'lover-support-03',
    kind: 'support',
    title: '特别累',
    text: '你说最近特别累，没力气解释为什么。TA 没有追问，只说“那你别说话，听我说”。TA 讲了一些很琐碎的事，食堂的菜、楼下的猫、今天看到的云。你听着听着，肩膀慢慢松了下来。',
    intimacy: 2,
    stress: -10,
    energy: 4,
  },
  {
    id: 'lover-support-04',
    kind: 'support',
    title: '压力很大',
    text: '你告诉 TA 最近压力很大，感觉怎么做都做不完。TA 沉默了一会儿，说：“那就先做今天这一件。”你问如果还是做不完呢。TA 说：“那就明天再说。”',
    intimacy: 2,
    stress: -9,
    energy: 3,
  },
  {
    id: 'lover-support-05',
    kind: 'support',
    title: '被批评了',
    text: '你被老师当众说了一顿，电话接通后却只说“没事”。TA 听了一会儿，忽然说：“你在哪？”你没回答，TA 又说：“不想说就不说，我陪你走一段。”',
    intimacy: 3,
    stress: -8,
    energy: 2,
  },
  {
    id: 'lover-support-06',
    kind: 'support',
    title: '考试失利',
    text: '成绩出来得比预想中差。你给 TA 打电话，开口第一句是“我搞砸了”。TA 说：“我知道你现在很难受。”就这一句，让你在楼梯间里蹲了很久。',
    intimacy: 2,
    stress: -9,
    energy: 2,
  },
  {
    id: 'lover-support-07',
    kind: 'support',
    title: '家里的事',
    text: '家里的事让你一整天都心不在焉。TA 在电话里听你断断续续地说完，没有给建议，只问：“你现在吃饭了吗？”你说没有。TA 说：“先去吃，我等你。”',
    intimacy: 3,
    stress: -10,
    energy: 3,
  },
  {
    id: 'lover-support-08',
    kind: 'support',
    title: '和室友闹矛盾',
    text: '你和室友闹了别扭，不想回宿舍。电话接通后你抱怨了很久，TA 一直没打断。等你说完，TA 问：“那你今晚要不要来我这边自习？”你忽然觉得事情没有那么糟。',
    intimacy: 2,
    stress: -8,
    energy: 3,
  },
  {
    id: 'lover-support-09',
    kind: 'support',
    title: '论文被拒',
    text: '收到拒稿邮件时，你盯着屏幕看了很久。电话里你尽量用平静的语气说这件事，TA 却听出来了。“先不急着改，”TA 说，“你今天已经很努力了。”',
    intimacy: 2,
    stress: -9,
    energy: 2,
  },
  {
    id: 'lover-support-10',
    kind: 'support',
    title: '深夜崩溃',
    text: '已经很晚了，你本来不想打扰 TA。电话接通后，你只说了一句“我有点撑不住”。TA 没有问原因，只说：“你在宿舍吗？我在电话这头。”你们谁都没挂。',
    intimacy: 3,
    stress: -10,
    energy: 4,
  },
]

export function pickLoverEvent(stress: number, money: number): LoverEvent {
  const supportChance = Math.max(0.18, Math.min(0.8, 0.15 + stress / 120))
  const kind: LoverEventKind = Math.random() < supportChance ? 'support' : 'daily'
  let pool = LOVER_EVENTS.filter(
    (event) => event.kind === kind && (event.money ?? 0) <= money,
  )
  if (pool.length === 0) {
    pool = LOVER_EVENTS.filter(
      (event) => event.kind === 'daily' && (event.money ?? 0) <= money,
    )
  }
  if (pool.length === 0) {
    pool = LOVER_EVENTS.filter((event) => event.kind === 'daily')
  }
  return pool[Math.floor(Math.random() * pool.length)]
}
