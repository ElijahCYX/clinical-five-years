export interface TravelEventEffects {
  intimacy?: number
  money?: number
  energy?: number
  stress?: number
}

export interface TravelEventOption {
  text: string
  response: string
  effects: TravelEventEffects
}

export interface TravelEvent {
  id: string
  title: string
  intro: string
  options: TravelEventOption[]
}

export const TRAVEL_EVENTS: TravelEvent[] = [
  {
    id: 'travel-01',
    title: '坐过站了',
    intro: '你和{name}聊得太投入，直到列车广播报出一个完全陌生的站名。你们对视一眼，同时看向窗外。',
    options: [
      { text: '立刻下车，再想办法坐回去', response: '你们在陌生小站等了四十分钟。{name}买了两个茶叶蛋，说“至少没饿着”。', effects: { intimacy: 2, stress: 3, energy: -5 } },
      { text: '干脆将错就错，在这个小城逛一圈', response: '你们临时改签，逛了车站附近的市场。{name}说这是整趟旅行最像旅行的一段。', effects: { intimacy: 4, money: -60, energy: -5, stress: -5 } },
      { text: '怪{name}没提醒你', response: '{name}沉默了一会儿，说“我也没注意”。接下来的半小时，你们都在看各自的手机。', effects: { intimacy: -3, stress: 4 } },
    ],
  },
  {
    id: 'travel-02',
    title: '民宿的墙很薄',
    intro: '民宿隔音差得离谱。隔壁房间的电视声、走廊的脚步声、甚至楼下猫叫都听得一清二楚。{name}翻了个身，问你还睡不睡得着。',
    options: [
      { text: '戴上耳机，给{name}也分一只', response: '你们挤在一起听同一首歌，{name}说“这比数羊有用”。', effects: { intimacy: 3, energy: -2 } },
      { text: '下楼找老板换房间', response: '老板给你们换到顶楼，条件一般，但安静多了。{name}说“你办事挺靠谱”。', effects: { intimacy: 2, money: -40 } },
      { text: '打开手机外放，和隔壁比谁更吵', response: '隔壁安静了，但民宿老板来敲门。{name}把被子蒙在头上，假装不认识你。', effects: { intimacy: -2, stress: 4 } },
    ],
  },
  {
    id: 'travel-03',
    title: '景区排队两小时',
    intro: '热门景点的队伍绕了三圈。{name}已经原地刷了半小时手机，而队伍看起来纹丝不动。',
    options: [
      { text: '讲冷笑话打发时间', response: '你讲了三个，{name}笑了两个。队伍前进时，TA说“再讲一个”。', effects: { intimacy: 3, energy: -3 } },
      { text: '去买两杯冰饮', response: '你排了另一条队买饮料，回来时{name}说你像救兵。', effects: { intimacy: 2, money: -30 } },
      { text: '提议放弃，去旁边的小巷子', response: '你们钻进小巷，发现一家没游客的小店。{name}说这比排队值。', effects: { intimacy: 4, stress: -5, money: -50 } },
    ],
  },
  {
    id: 'travel-04',
    title: '当地特色菜',
    intro: '菜单上的字你认识，组合起来却完全不知道是什么。{name}把菜单推给你：“你点，我负责吃。”',
    options: [
      { text: '点最奇怪的三个菜', response: '第一道菜上来时，{name}的表情像在参加实验课。但最后你们把三盘都吃完了。', effects: { intimacy: 3, money: -80, energy: 3 } },
      { text: '问老板推荐招牌', response: '老板推荐了一道你从没听过的菜，意外好吃。{name}说“以后点菜都听你的”。', effects: { intimacy: 2, money: -60, energy: 2 } },
      { text: '只点自己认识的菜', response: '{name}看着一桌熟悉的番茄炒蛋，说“我们跑这么远就吃这个？”', effects: { intimacy: -1, money: -40 } },
    ],
  },
  {
    id: 'travel-05',
    title: '突然下雨',
    intro: '雨来得毫无预兆。你们只有一把小伞，而最近的避雨处还在两百米外。{name}把伞举高了一点。',
    options: [
      { text: '把伞往{name}那边推', response: '你们挤在伞下跑过去，{name}的肩膀还是湿了。TA说“下次换我淋”。', effects: { intimacy: 4, stress: 2 } },
      { text: '冲进路边小店躲雨', response: '你们在店里逛了半小时，{name}买了一个完全用不上的冰箱贴。', effects: { intimacy: 2, money: -25 } },
      { text: '干脆在雨里走', response: '你们淋成落汤鸡，{name}一边笑一边说“这算不算青春”。', effects: { intimacy: 3, energy: -6, stress: -3 } },
    ],
  },
  {
    id: 'travel-06',
    title: '打车被绕路',
    intro: '导航上的路线明明在往前，司机却拐进了一条越来越偏的路。{name}悄悄给你看手机屏幕，问要不要说。',
    options: [
      { text: '礼貌提醒司机', response: '司机说前面堵车，换了一条路。你们最终比预计晚到二十分钟，但车费没涨太多。', effects: { intimacy: 2, stress: 2, money: -20 } },
      { text: '和{name}一起看风景', response: '你们把绕路当成城市观光，{name}还给窗外一栋楼编了个故事。', effects: { intimacy: 3, stress: -2 } },
      { text: '让{name}下车，自己处理', response: '你处理完追上{name}时，TA说“下次别把我一个人丢下”。', effects: { intimacy: -3, stress: 4 } },
    ],
  },
  {
    id: 'travel-07',
    title: '山顶看日出',
    intro: '凌晨四点，你们爬上了山顶。云层很厚，太阳迟迟没有出来。{name}裹着外套，问你后不后悔。',
    options: [
      { text: '说不后悔，能看到这些云就够了', response: '{name}看了你一会儿，说“你这个人还挺会说话”。', effects: { intimacy: 3, energy: -5, stress: -5 } },
      { text: '提议拍一张合照', response: '照片里两个人都冻得鼻尖发红。{name}把它设成了聊天背景。', effects: { intimacy: 4, energy: -3 } },
      { text: '抱怨早知道就多睡会儿', response: '{name}说“那你现在回去也来得及”，气氛像山顶的风一样凉。', effects: { intimacy: -2, stress: 3 } },
    ],
  },
  {
    id: 'travel-08',
    title: '纪念品店',
    intro: '景区纪念品店的东西贵得离谱。{name}拿起一个丑得很特别的摆件，问你像不像你们宿舍。',
    options: [
      { text: '买下来送给{name}', response: '{name}愣了一下，然后把摆件小心地放进包里。', effects: { intimacy: 4, money: -50 } },
      { text: '说像，但太贵了', response: '{name}把它放回货架，又回头看了两次。你记住了那个货架的位置。', effects: { intimacy: 1 } },
      { text: '吐槽这里的东西全是义乌批发的', response: '{name}笑得差点把摆件摔了，店员看了你们一眼。', effects: { intimacy: 2, stress: -2 } },
    ],
  },
  {
    id: 'travel-09',
    title: '海边拍照',
    intro: '海边风很大，{name}的手机差点被吹走。你们站在礁石上拍照，背景里全是乱入的路人。',
    options: [
      { text: '帮{name}拍一百张，再选一张', response: '你拍了二十张就手酸了。{name}选了一张，说“这张看不清脸，但氛围很好”。', effects: { intimacy: 3, energy: -2 } },
      { text: '拉着{name}一起拍搞怪合照', response: '你们在礁石上做出各种奇怪姿势，路人开始绕开你们走。', effects: { intimacy: 4, stress: -4 } },
      { text: '一个人走到远处看海', response: '你回来时，{name}正坐在原地刷手机。TA说“我还以为你走了”。', effects: { intimacy: -2 } },
    ],
  },
  {
    id: 'travel-10',
    title: '回程误车',
    intro: '你们提前半小时到车站，却发现走错了车站。手机上的检票时间只剩十二分钟。{name}看着你，等你拿主意。',
    options: [
      { text: '立刻打车冲过去', response: '你们在最后一分钟冲进检票口，{name}说“以后旅行还是你规划吧”。', effects: { intimacy: 3, money: -80, stress: 5, energy: -4 } },
      { text: '改签下一班，顺便吃顿饭', response: '你们在车站附近吃了一顿很慢的饭。{name}说“误车好像也没那么糟”。', effects: { intimacy: 2, money: -60, stress: -3 } },
      { text: '各走各的，自己想办法回去', response: '你们在车站分开。回程路上，{name}没有发消息。', effects: { intimacy: -4, stress: 3 } },
    ],
  },
]

export function pickTravelEvent(): TravelEvent {
  return TRAVEL_EVENTS[Math.floor(Math.random() * TRAVEL_EVENTS.length)]
}
