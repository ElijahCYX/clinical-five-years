import type { EncounterChat } from './types'

export const ENCOUNTER_CHATS: EncounterChat[] = [
  {
    id: 'enc-01',
    intro: '食堂最热闹的窗口前，你端着餐盘找位置，{name}正对着最后一份番茄炒蛋发呆。你们同时伸手，又同时缩回去，气氛像一场没有裁判的决赛。',
    options: [
      { text: '把最后一份让给对方', response: '{name}愣了一下，笑着把番茄炒蛋推回来一半：“那我请你喝汤。”', intimacy: 4 },
      { text: '提议石头剪刀布', response: '{name}认真出了剪刀，你出了布。你输了，但对方笑得很开心。', intimacy: 2 },
      { text: '趁对方犹豫直接端走', response: '你端着盘子走了两步，听见身后一声“喂”。第二天你发现自己的校园卡不见了。', intimacy: -3 },
    ],
  },
  {
    id: 'enc-02',
    intro: '图书馆三楼，你刚坐下就发现笔袋落在宿舍。旁边的{name}正在奋笔疾书，你犹豫了很久，终于小声开口借笔。',
    options: [
      { text: '借笔，并认真道谢', response: '{name}递来一支笔，还顺手推来一包纸巾。你决定这节课认真一点。', intimacy: 3 },
      { text: '借笔，顺便问对方在复习什么', response: '你们从复习进度聊到食堂哪个窗口好吃，差点被管理员提醒。', intimacy: 4 },
      { text: '不借了，用手机备忘录记笔记', response: '你在备忘录里戳了半小时，{name}看了你一眼，默默把自己的备用笔放在桌角。', intimacy: 1 },
    ],
  },
  {
    id: 'enc-03',
    intro: '突如其来的暴雨把一群人困在教学楼门口。{name}站在你旁边，手里的伞看起来只能保护一个人。',
    options: [
      { text: '问要不要一起走', response: '你们挤在一把伞下，肩膀湿了一半。{name}说下次记得带大一点的伞。', intimacy: 4 },
      { text: '把自己的书包举起来冲进雨里', response: '{name}在后头喊你名字，声音被雨声冲散。第二天你们都感冒了。', intimacy: 1 },
      { text: '等雨停，顺便聊会儿天', response: '雨下了四十分钟，你们聊了四十分钟。最后{name}说：“其实我本来想先走的。”', intimacy: 3 },
    ],
  },
  {
    id: 'enc-04',
    intro: '晚上操场人不多，{name}在跑道上慢跑，配速稳定得像心电图。你本来只想散散步，结果不知不觉跟了半圈。',
    options: [
      { text: '加速跟上，一起跑', response: '你们并排跑完两圈，{name}说你的呼吸声像一台老式打印机。', intimacy: 3 },
      { text: '在跑道边帮对方看包', response: '{name}跑完回来，发现你正认真给TA的水杯扇风。', intimacy: 4 },
      { text: '假装没看见，继续散步', response: '你走了三圈，{name}跑了五圈。临走时TA冲你挥了挥手，你假装刚看到。', intimacy: -1 },
    ],
  },
  {
    id: 'enc-05',
    intro: '便利店最后一串关东煮被你和{name}同时盯上。店员看了看你们，问：“要不你们商量一下？”',
    options: [
      { text: '让给对方', response: '{name}开心地拿走那串萝卜，又回头塞给你一颗鱼丸。', intimacy: 3 },
      { text: '提议一人一半', response: '你们蹲在便利店门口分了一串关东煮，路过的人以为你们在分赃。', intimacy: 4 },
      { text: '抢先拿走，说下次请客', response: '{name}说“好啊，我记着了”，你突然不确定自己是不是欠了一顿饭。', intimacy: 1 },
    ],
  },
  {
    id: 'enc-06',
    intro: '快递站里，你抱着一摞箱子找自己的包裹，{name}也在货架前翻找。你们同时拿起同一个快递盒，上面的名字不是你们中的任何一个。',
    options: [
      { text: '一起把快递送回正确的人', response: '你们跑了两栋楼才找到失主，{name}说这比体测还累。', intimacy: 3 },
      { text: '拍照发失物招领，先各回各家', response: '{name}把照片发到群里，你负责写明地点。你们在群里互相点了赞。', intimacy: 2 },
      { text: '把盒子放回去，假装没看见', response: '{name}看了你一眼，说“你刚才不是拿起来了吗”，你开始研究快递站的灯。', intimacy: -2 },
    ],
  },
  {
    id: 'enc-07',
    intro: '一只校园猫躺在路中央，挡住你和{name}的去路。它看了看你，又看了看TA，决定继续睡。',
    options: [
      { text: '蹲下来一起撸猫', response: '你们蹲在路边摸了十分钟猫，{name}说这只猫的毛比自己的头发还顺。', intimacy: 4 },
      { text: '给猫让路，顺便聊两句', response: '{name}说你很有爱心，你说你只是怕被猫挠。', intimacy: 2 },
      { text: '跨过去赶课', response: '你迈过去时差点踩到猫尾巴，{name}倒吸一口凉气。', intimacy: -3 },
    ],
  },
  {
    id: 'enc-08',
    intro: '早八电梯里挤满了人，你和{name}被挤到角落里。电梯超重提示响了两次，所有人都开始假装看手机。',
    options: [
      { text: '主动出去等下一班', response: '电梯门关上时，{name}冲你比了个感谢的手势。你迟到了，但心情不错。', intimacy: 3 },
      { text: '和{name}一起吐槽早八', response: '你们从早八聊到食堂早餐，出电梯时{name}说下次可以一起吃早饭。', intimacy: 4 },
      { text: '假装没看见，继续看手机', response: '电梯到楼层时你才发现{name}一直在看你。你们同时说“你先走”。', intimacy: 1 },
    ],
  },
  {
    id: 'enc-09',
    intro: '打印店门口排了长队，{name}在你前面，手里的U盘插了三次都没反应。老板说：“同学，你这个可能是坏的。”',
    options: [
      { text: '把自己的电脑借给对方', response: '{name}顺利打完了论文，临走前认真记住了你的名字。', intimacy: 4 },
      { text: '帮TA一起检查文件格式', response: '你们发现是PDF太大，打印店老板说“这不早说”。', intimacy: 3 },
      { text: '在后面默默催', response: '{name}回头说“要不你先来”，你突然觉得自己像个坏人。', intimacy: -2 },
    ],
  },
  {
    id: 'enc-10',
    intro: '选修课老师要求自由组队，教室里瞬间乱成一锅粥。你还没反应过来，{name}已经站在你桌边问：“要不要一起？”',
    options: [
      { text: '立刻答应', response: '{name}松了口气，说“太好了，我还怕没人要我”。', intimacy: 3 },
      { text: '先问TA会做什么', response: '你们认真分工了十分钟，最后发现两个人都不会做PPT。', intimacy: 2 },
      { text: '说想再等等看', response: '{name}点点头走了。下课后你发现TA和另一个人组队，笑得比跟你说话时开心。', intimacy: -2 },
    ],
  },
  {
    id: 'enc-11',
    intro: '食堂新开了一个窗口，队伍从二楼排到一楼。{name}在你后面，边排队边研究菜单，嘴里念念有词。',
    options: [
      { text: '推荐自己吃过的好菜', response: '{name}认真记下，最后点了和你一模一样的一份。', intimacy: 3 },
      { text: '一起吐槽队伍长度', response: '你们从队伍聊到食堂装修，差点忘了自己还在排队。', intimacy: 4 },
      { text: '低头看手机，保持沉默', response: '排了二十分钟，{name}突然说“你手机壳挺好看的”，你才发现屏保是黑屏。', intimacy: 1 },
    ],
  },
  {
    id: 'enc-12',
    intro: '社团招新摊位前，{name}正在努力向路人介绍活动。你只是路过，却被塞了一张传单和一根棒棒糖。',
    options: [
      { text: '认真听介绍，帮忙拉两个人', response: '{name}说你是今天最靠谱的路人，硬要请你喝奶茶。', intimacy: 4 },
      { text: '接过传单，说考虑一下', response: '你走远后回头，{name}还在原地朝你挥手。', intimacy: 1 },
      { text: '把棒棒糖拿走就溜', response: '{name}愣了一下，随即笑着说“糖不能白吃，下次来摊位帮忙”。', intimacy: -1 },
    ],
  },
  {
    id: 'enc-13',
    intro: '你在校园卡上看到一张陌生的笑脸，正想交到失物招领处，{name}从后面跑过来：“等等，那是我的卡！”',
    options: [
      { text: '确认信息后还给对方', response: '{name}连声道谢，说卡里还有刚充的三百块。', intimacy: 3 },
      { text: '开玩笑说“先请我喝水”', response: '{name}真的去便利店买了两瓶水，你们坐在台阶上喝完才走。', intimacy: 4 },
      { text: '假装没听见', response: '{name}追了你半条路，最后你把卡递过去，双方都喘得说不出话。', intimacy: -3 },
    ],
  },
  {
    id: 'enc-14',
    intro: '操场看台上只剩你和{name}，一个在吃面包，一个在喝酸奶。晚风把操场上的口号吹得断断续续。',
    options: [
      { text: '问TA在等谁', response: '{name}说“没等谁，就是不想回宿舍”，你决定也再坐一会儿。', intimacy: 3 },
      { text: '分一半面包给对方', response: '{name}接过面包，认真地说“这比食堂的晚饭好吃”。', intimacy: 4 },
      { text: '起身离开，把位置留给TA', response: '{name}在你身后说了声谢谢，你没听清。', intimacy: 0 },
    ],
  },
  {
    id: 'enc-15',
    intro: '自习室只剩一个靠窗座位，你刚把书放下，{name}也抱着一摞资料站在旁边。你们对视了一秒。',
    options: [
      { text: '问要不要拼一桌', response: '{name}把资料放下，说“我保证不占你太多地方”，然后占了一半桌子。', intimacy: 3 },
      { text: '把座位让给TA', response: '{name}说“那你坐哪”，你指了指角落。TA把一本书推过来：“一起看吧。”', intimacy: 4 },
      { text: '假装先到先得', response: '你坐下后，{name}在附近转了三圈，最后坐在你前一排，背影写满委屈。', intimacy: -2 },
    ],
  },
  {
    id: 'enc-16',
    intro: '奶茶店第二杯半价，{name}正在柜台前犹豫。你排在后面，店员已经开始为下一单做准备。',
    options: [
      { text: '主动问要不要拼单', response: '你们各自拿到一杯，{name}说“下次还可以一起拼”。', intimacy: 4 },
      { text: '让TA慢慢选', response: '{name}最后点了两杯，说“另一杯请你”。你愣了一下才接过。', intimacy: 3 },
      { text: '不耐烦地叹气', response: '{name}回头看了你一眼，快速点了单。你拿到奶茶时，杯壁上凝了一层尴尬。', intimacy: -3 },
    ],
  },
  {
    id: 'enc-17',
    intro: '教务处窗口前的队伍像一条不肯前进的贪吃蛇。{name}在你前面，正在和窗口老师解释自己的选课问题。',
    options: [
      { text: '帮忙补充一句情况', response: '问题顺利解决，{name}转头看你：“你刚才那句比我说十分钟都有用。”', intimacy: 4 },
      { text: '默默等，不插话', response: '{name}解决完回头，主动告诉你哪个窗口更快。', intimacy: 2 },
      { text: '催了一下', response: '{name}说“我也想快啊”，气氛突然变得像排队本身一样长。', intimacy: -2 },
    ],
  },
  {
    id: 'enc-18',
    intro: '宿舍楼下，{name}拎着三份外卖，手机还在响。你刚好经过，TA用眼神向你求救。',
    options: [
      { text: '帮TA拎一份上楼', response: '{name}说“你救了我一命”，顺手把其中一杯饮料塞给你。', intimacy: 4 },
      { text: '帮TA按电梯', response: '电梯来了，{name}冲进去，门关上前说了句“下次请你吃饭”。', intimacy: 2 },
      { text: '假装没看到', response: '你走出两步，听见身后一份外卖掉在地上。你决定不回头。', intimacy: -3 },
    ],
  },
  {
    id: 'enc-19',
    intro: '你在实验楼里迷路，绕了三圈又回到同一台冰箱前。{name}从拐角出现，问：“你找哪个房间？”',
    options: [
      { text: '老实说迷路了', response: '{name}笑着带你走了一层楼，说“这楼的设计就是为了让人迷路”。', intimacy: 3 },
      { text: '先问TA在做什么实验', response: '你们站在走廊聊了十分钟，最后{name}说“再不走，我的细胞要死了”。', intimacy: 4 },
      { text: '嘴硬说自己在找会议室', response: '{name}指了指反方向：“会议室在那边，不过这层没有。”', intimacy: -1 },
    ],
  },
  {
    id: 'enc-20',
    intro: '校园歌手比赛报名处，{name}正在填表，看到你后问：“你要不要也报一个？”',
    options: [
      { text: '说自己五音不全', response: '{name}说“没关系，我负责主唱，你负责气氛”，然后把你名字写上了。', intimacy: 4 },
      { text: '认真考虑后拒绝', response: '{name}说“好吧，那到时候来给我加油”。你点了点头。', intimacy: 2 },
      { text: '直接抢过表格替自己报名', response: '{name}看着你，说“那我们可能要提前排练一下”。', intimacy: 3 },
    ],
  },
  {
    id: 'enc-21',
    intro: '运动会报名表在班里传了一圈，最后传到你和{name}手里。班长说：“还差两个人，你们看着办。”',
    options: [
      { text: '主动报一个项目', response: '{name}看了看你，说“那我也报”，班长立刻把名字写上。', intimacy: 4 },
      { text: '问TA想报什么', response: '你们研究了半天项目表，最后一起报了个没人愿意去的长跑。', intimacy: 3 },
      { text: '把表传给下一个人', response: '表传走后，{name}说“你真聪明”，你觉得自己好像失去了什么。', intimacy: -1 },
    ],
  },
  {
    id: 'enc-22',
    intro: '快递站被双十一的纸箱淹没了，{name}站在货架前，手里的取件码已经输错三次。',
    options: [
      { text: '帮TA一起找', response: '你们在纸箱山里翻了十分钟，最后{name}抱着快递说“这是我这周最运动的一次”。', intimacy: 3 },
      { text: '分享自己的取件经验', response: '{name}按你说的找到了，激动得像刚拆到隐藏款。', intimacy: 2 },
      { text: '在旁边笑', response: '{name}说“你笑什么，你的快递不也没找到吗”，你低头看了看自己的取件码。', intimacy: -2 },
    ],
  },
  {
    id: 'enc-23',
    intro: '考试周图书馆座无虚席，{name}抱着书站在过道里，看起来已经找了很久。你旁边的位置刚好空着。',
    options: [
      { text: '招呼TA过来坐', response: '{name}坐下后小声说“谢谢”，然后把一包咖啡糖放在你们中间。', intimacy: 4 },
      { text: '假装没看见', response: '{name}最后坐在了楼梯口。你复习到一半，突然觉得自己有点过分。', intimacy: -3 },
      { text: '问TA要不要去楼下咖啡机', response: '你们一人一杯速溶咖啡，在走廊里站了十分钟，回去时都觉得脑子清醒了一点。', intimacy: 3 },
    ],
  },
  {
    id: 'enc-24',
    intro: '食堂阿姨今天手很稳，给{name}打了满满一勺肉，又看了看你。你端着空餐盘，期待地往前挪了一步。',
    options: [
      { text: '笑着夸阿姨今天真好看', response: '阿姨手一抖，给你多加了半勺。{name}在旁边说“学到了”。', intimacy: 2 },
      { text: '安静等，不套近乎', response: '阿姨给了你正常分量。{name}把自己碗里的肉夹了一块给你。', intimacy: 3 },
      { text: '直接要求多打一点', response: '阿姨看了你一眼，还是加了。{name}说“你这胆子比我大”。', intimacy: 1 },
    ],
  },
  {
    id: 'enc-25',
    intro: '校园广播忽然放了一首你最近单曲循环的歌，{name}在广播站门口探出头：“这首歌是我点的。”',
    options: [
      { text: '说自己也喜欢', response: '{name}眼睛亮了一下，说“那下次我们一起听”。', intimacy: 4 },
      { text: '问TA为什么点这首歌', response: '{name}说是给一个“经常在图书馆三楼自习的人”点的，你突然不知道该不该承认。', intimacy: 3 },
      { text: '说这首歌太吵了', response: '{name}沉默两秒，说“好的，我下次点安静的”。', intimacy: -2 },
    ],
  },
  {
    id: 'enc-26',
    intro: '操场边有人打球，{name}坐在看台上看得很认真。你走过去的时候，TA往旁边挪了挪，空出一个位置。',
    options: [
      { text: '坐下一起看', response: '你们看了半场，{name}突然说“其实我根本看不懂规则”，你笑出了声。', intimacy: 3 },
      { text: '问TA支持哪边', response: 'TA说支持“看起来比较累的那边”，你决定和TA站同一队。', intimacy: 4 },
      { text: '站着看完就走', response: '{name}抬头看了你一眼，又继续看球场。你走出很远才想起自己没说再见。', intimacy: -1 },
    ],
  },
  {
    id: 'enc-27',
    intro: '选修课老师随机点名，名单停在{name}的名字上。TA站起来时明显没听课，你却刚好记得答案。',
    options: [
      { text: '小声提醒TA', response: '{name}顺利答完，坐下后悄悄给你发了句“救命恩人”。', intimacy: 4 },
      { text: '假装没听见', response: '{name}硬着头皮答完，坐下后看了你一眼。你决定认真听课。', intimacy: -2 },
      { text: '举手补充自己的看法', response: '老师顺势把你们俩放进了同一个讨论组，{name}说“你害我多了一份作业”。', intimacy: 2 },
    ],
  },
  {
    id: 'enc-28',
    intro: '毕业季的校园到处是拍照的人，{name}举着手机四处找角度，最后把镜头对准了你。',
    options: [
      { text: '配合地笑一下', response: '快门按下后，{name}说“这张不错，发你”，你第一次认真看了看自己的样子。', intimacy: 3 },
      { text: '抢过手机帮TA拍', response: '你拍了二十张，{name}只选了一张，说“这张看起来像我自己”。', intimacy: 4 },
      { text: '挡住脸走开', response: '{name}笑着喊“喂，毕业照都不给拍啊”，你回头时TA已经拍了一张。', intimacy: 1 },
    ],
  },
  {
    id: 'enc-29',
    intro: '社团聚餐吃到一半，{name}突然被推上台唱歌。TA拿着话筒看向你，明显在找一个人一起丢脸。',
    options: [
      { text: '上台一起唱', response: '你们把一首抒情歌唱成了相声，台下笑得比听歌还开心。', intimacy: 4 },
      { text: '在台下帮TA打拍子', response: '{name}唱着唱着找到了节奏，下台后第一个来找你。', intimacy: 3 },
      { text: '低头假装看手机', response: '{name}一个人唱完了整首，下台时经过你身边，什么也没说。', intimacy: -3 },
    ],
  },
  {
    id: 'enc-30',
    intro: '校园夜市人挤人，{name}在一堆小摊前挑了半天，手里已经拿不下了。你路过时，TA正艰难地掏手机。',
    options: [
      { text: '帮TA拿一下东西', response: '{name}终于付了钱，把其中一份小吃塞给你：“见者有份。”', intimacy: 4 },
      { text: '推荐自己吃过的小摊', response: '你们从街头吃到街尾，最后都忘了本来只是来逛逛。', intimacy: 3 },
      { text: '说夜市人太多了，先走了', response: '{name}说“那你路上小心”，你走出几步，闻到了TA手里那份烤串的香味。', intimacy: -1 },
    ],
  },
]
