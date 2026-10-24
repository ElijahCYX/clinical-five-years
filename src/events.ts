import type {
  EventEffect,
  GameState,
  PendingConfession,
  PendingEvent,
  Player,
  Relationship,
} from './types'
import {
  createEventFriend,
  isStaffRelation,
  npcOrientationAllows,
  playerAllowsGender,
} from './social'

interface EventSeed {
  id: string
  kind: 'scene' | 'attribute' | 'random' | 'romance'
  title: string
  text: string
  effects: EventEffect | ((state: GameState) => EventEffect)
  condition?: (state: GameState) => boolean
}

const EVENTS: EventSeed[] = [
  // 场景触发型（30）
  { id: 'ev-scene-01', kind: 'scene', title: '健身房大佬', text: '你在健身房对着镜子研究深蹲，旁边一位练得像解剖图的大佬终于走过来，把你的膝盖掰向正确方向。他说你这动作不像健身，像在给地板磕头。', effects: {stress: -5, constitutionGrowth: 3}, condition: (s) => s.habits.includes('fitness') },
  { id: 'ev-scene-02', kind: 'scene', title: '晨跑搭子', text: '清晨的操场只有你和一条比你还自律的狗。跑到第三圈时，一个同样早起的人跟上来，说你的配速稳定得像心电图，于是你们默默并排跑完了剩下的路。', effects: {energy: 4, stress: -3}, condition: (s) => s.habits.includes('earlyRise') },
  { id: 'ev-scene-03', kind: 'scene', title: '早睡俱乐部', text: '宿舍十一点熄灯，你第一次在十二点前躺下。室友们还在黑暗中刷手机，你已经睡到打呼，第二天醒来时觉得自己像刚出厂的新设备。', effects: {energy: 5, stress: -4}, condition: (s) => s.habits.includes('earlySleep') },
  { id: 'ev-scene-04', kind: 'scene', title: '冥想社', text: '你跟着冥想社的音频闭眼十分钟，脑子里依然在循环背名词解释。但当你睁眼时，窗外刚好有一阵风，你决定把这一刻算作有效冥想。', effects: {stress: -6}, condition: (s) => s.habits.includes('meditation') },
  { id: 'ev-scene-05', kind: 'scene', title: '英语角', text: '英语角里你鼓起勇气自我介绍，把clinical medicine说成了clinical magic。对方用中文夸你口语有创意，你决定把这次交流记入英语学习进度。', effects: {english: 3, socialGrowth: 5}, condition: (s) => s.habits.includes('vocab') },
  { id: 'ev-scene-06', kind: 'scene', title: '文献共读', text: '你终于读懂了论文摘要，并决定奖励自己再读一篇。第二篇的摘要也读懂了，但正文告诉你事情没有这么简单。', effects: {research: 3, stress: 2}, condition: (s) => s.habits.includes('reading') },
  { id: 'ev-scene-07', kind: 'scene', title: '记账小组', text: '你认真记了三天账，发现少喝三杯奶茶就能让生活费多活两天。第四天你奖励自己一杯奶茶，账本当场破防。', effects: {money: 30, composite: 1}, condition: (s) => s.habits.includes('ledger') },
  { id: 'ev-scene-08', kind: 'scene', title: '家人视频', text: '妈妈在视频里问你吃没吃饭，你说吃了，其实桌上只有一桶泡面。她没有拆穿你，只让你早点睡，你关掉视频后默默把泡面换成了食堂。', effects: {stress: -5, energy: 2}, condition: (s) => s.habits.includes('familyCall') },
  { id: 'ev-scene-09', kind: 'scene', title: '时间管理讲座', text: '你听了一场时间管理讲座，学会了番茄工作法，并当场用它规划了如何逃避下一场讲座。至少这半小时你确实没有摸鱼。', effects: {prep: 2}, condition: (s) => s.habits.includes('timeManagement') },
  { id: 'ev-scene-10', kind: 'scene', title: '护肤柜台', text: '柜姐说你皮肤缺水，你看了看价格，发现缺的其实是钱包。最后你买了一瓶最便宜的，决定从今天开始早睡，虽然你知道大概率做不到。', effects: {appearanceGrowth: 5, money: -40}, condition: (s) => s.habits.includes('appearanceCare') },
  { id: 'ev-scene-11', kind: 'scene', title: '咖啡品鉴', text: '你喝了一杯手冲，认真品出了柑橘、坚果和一点纸板味。半小时后你品出了心悸，决定以后还是喝食堂免费热水。', effects: {energy: 4, stress: 2, money: -20}, condition: (s) => s.habits.includes('coffee') },
  { id: 'ev-scene-12', kind: 'scene', title: '计划A的代价', text: '你把计划表排得比课表还满，连喝水都安排进了时间块。导员看了都替你累，你却在完成第一项后获得了一种奇怪的成就感。', effects: {prep: 2, stress: 3}, condition: (s) => s.plan==='A' },
  { id: 'ev-scene-13', kind: 'scene', title: '计划B的循环', text: '你按计划完成周期性回顾，回顾时发现上周的回顾也在回顾上上周。你安慰自己：至少这个循环是稳定的。', effects: {prep: 1, stress: 1}, condition: (s) => s.plan==='B' },
  { id: 'ev-scene-14', kind: 'scene', title: '计划C的黎明', text: '你决定从今天开始考前突击，但今天已经快结束了。你抓住最后两小时背了三页，感觉知识正在以临时工的速度进场。', effects: {prep: 3, energy: -3}, condition: (s) => s.plan==='C' },
  { id: 'ev-scene-15', kind: 'scene', title: '水课签到', text: '水课老师突然点名，你正低头看别的书，答到的声音比本人还响。老师满意地点点头，你决定这节课继续低调。', effects: {composite: 1, stress: 1}, condition: (s) => s.season.courses.some(c=>c.electiveType==='water') },
  { id: 'ev-scene-16', kind: 'scene', title: '兴趣课演出', text: '兴趣课期末展示，你在台上弹错一个音，台下却鼓掌说这是即兴处理。你鞠躬时差点踩到谱架，决定把这次演出当成行为艺术。', effects: {socialGrowth: 8, stress: -3}, condition: (s) => s.season.courses.some(c=>c.electiveType==='interest') },
  { id: 'ev-scene-17', kind: 'scene', title: '小组作业带飞', text: '小组作业截止前夜，你一个人做完了PPT、讲稿和参考文献。组员在群里负责发辛苦啦，你看着屏幕，决定下次也学会装死。', effects: {composite: 2, socialGrowth: 5}, condition: (s) => s.season.courses.some(c=>c.electiveType==='group') },
  { id: 'ev-scene-18', kind: 'scene', title: '思政抢答', text: '思政课老师抛出一个问题，你举手最快，其实没听清题目。站起来后你靠常识硬答，老师居然说方向对了，你坐下时手心全是汗。', effects: {composite: 2, stress: -2}, condition: (s) => s.season.courses.some(c=>c.electiveType==='politics') },
  { id: 'ev-scene-19', kind: 'scene', title: '冬雨没伞', text: '冬雨来得毫无预告，你顶着书包跑回宿舍，像一颗有学历的落汤鸡。洗完热水澡后你决定以后在教室常备一把伞。', effects: {energy: -4, stress: 2}, condition: (s) => s.season.id.includes('winter') },
  { id: 'ev-scene-20', kind: 'scene', title: '夏日冰粉', text: '夏天食堂新出冰粉，你排了二十分钟才买到。冰粉很甜，肚子也很诚实，下午的课你上得格外清醒。', effects: {energy: -3, stress: -2, money: -20}, condition: (s) => s.season.id.includes('summer') },
  { id: 'ev-scene-21', kind: 'scene', title: '社团招新', text: '三个社团同时邀请你加入，你挑了传单最多的那个。第一次例会上你发现大家都在等别人干活，你决定先观察一学期。', effects: {composite: 3, socialGrowth: 5}, condition: (s) => Math.floor(s.seasonIndex/4)+1===2 },
  { id: 'ev-scene-22', kind: 'scene', title: '见习第一天', text: '你第一次穿白大褂进病房，老师让你问病史，你开口先问您哪里不舒服。病人愣了一下，说你不是医生吗，你解释自己还在学。', effects: {prep: 2, stress: 3}, condition: (s) => Math.floor(s.seasonIndex/4)+1>=4 },
  { id: 'ev-scene-23', kind: 'scene', title: '护士站社交', text: '你帮护士姐姐搬了一箱液体，顺便听完了三个科室的八卦。她们说以后有事可以来找她们，你第一次觉得医院不只有考试。', effects: {socialGrowth: 5, energy: -4}, condition: (s) => Math.floor(s.seasonIndex/4)+1>=5 },
  { id: 'ev-scene-24', kind: 'scene', title: '兼职群', text: '你在兼职群接了个发传单的活，第一张发给了自己的室友。室友认真看完后问你能不能帮他带一份，你决定这活其实也不算太亏。', effects: {money: 80, energy: -5}, condition: (s) => s.plan==='C'&&s.money<500 },
  { id: 'ev-scene-25', kind: 'scene', title: '实验室门禁', text: '导师给了你一张实验室门禁卡，你第一次觉得自己像正经科研人。刷卡进门时机器响了三声，你站在门口反复确认自己不是非法入侵。', effects: {research: 4}, condition: (s) => s.mentorContactUnlocked },
  { id: 'ev-scene-26', kind: 'scene', title: '宿舍夜谈', text: '熄灯后室友关掉游戏语音，认真听你吐槽了半小时。最后他说实在不行就早点睡，你虽然没得到解决方案，但确实舒服了一点。', effects: {stress: -4, socialGrowth: 5}, condition: (s) => s.roommateBond },
  { id: 'ev-scene-27', kind: 'scene', title: '考研自习室', text: '你走进考研自习室，发现每个人都在低头卷，连空气里都是背诵声。你不好意思只卷一支笔，于是翻开书假装自己也在状态。', effects: {kaoyanPrep: 1, stress: 2}, condition: (s) => s.kaoyanRegistered },
  { id: 'ev-scene-28', kind: 'scene', title: '保研讲座', text: '保研讲座说要看综合素质，你开始重新审视自己的综合素质。越审视越发现，自己最突出的素质是能在讲座上认真走神。', effects: {composite: 1, stress: 3}, condition: (s) => s.postgradChoice!==null },
  { id: 'ev-scene-29', kind: 'scene', title: '补考教室', text: '你走进补考教室，发现监考老师比你还紧张。发卷前他反复确认人数，你突然觉得这场考试对双方都是一种考验。', effects: {prep: 2, stress: 4}, condition: (s) => s.pendingMakeups.length>0 },
  { id: 'ev-scene-30', kind: 'scene', title: '校园招聘会', text: '招聘会上你投了十份简历，九份问你会不会做PPT，剩下一份问你能不能接受加班。你第一次认真思考，学医到底算不算一门手艺。', effects: {socialGrowth: 5, stress: 3}, condition: (s) => Math.floor(s.seasonIndex/4)+1>=4 },
  // 属性触发型（30）
  { id: 'ev-attr-01', kind: 'attribute', title: '被要微信', text: '{npc}在教学楼门口拦住你，举着手机问能不能加个微信。你的大脑同时闪过要冷静和我今天的头发是不是很乱，开口时声音比平时高了半个调。', effects: (s) => s.player !== null && s.player.attrs.social >= 7 ? {socialGrowth: 10, socialUnlock: true} : {stress: 5}, condition: (s) => s.player !== null && s.player.attrs.appearance>=8 },
  { id: 'ev-attr-02', kind: 'attribute', title: '教授记住了你', text: '教授在走廊叫出你的名字，你感动得差点把书掉进水池。他说上次课上的回答不错，你其实已经忘了自己回答过什么。', effects: {prep: 2, stress: -2}, condition: (s) => s.player !== null && s.player.attrs.memory>=8 },
  { id: 'ev-attr-03', kind: 'attribute', title: '病例讨论高光', text: '病例讨论时你一句先查体让全场安静。老师问你是不是偷看过答案，你说没有，只是书上正好写了这一页。', effects: {prep: 3, stress: -2}, condition: (s) => s.player !== null && s.player.attrs.comprehension>=8 },
  { id: 'ev-attr-04', kind: 'attribute', title: '第一次缝合', text: '第一次缝合练习，你手稳得像在给豆腐做美容。带教老师默默把剪刀收回去，说你以前是不是干过针线活。', effects: {prep: 2, stress: -2}, condition: (s) => s.player !== null && s.player.attrs.dexterity>=8 },
  { id: 'ev-attr-05', kind: 'attribute', title: '社交悍匪', text: '你走进食堂，三个桌的人同时招呼你。你端着一份饭在中间站了三秒，第一次体会到人缘太好也会造成选择困难。', effects: {composite: 2, socialGrowth: 5}, condition: (s) => s.player !== null && s.player.attrs.social>=8 },
  { id: 'ev-attr-06', kind: 'attribute', title: '铁人体质', text: '换季流感扫楼，宿舍倒下一片，只有你还能去上课。室友问你是不是吃了什么药，你说没有，可能只是命硬。', effects: {stress: -4, energy: 3}, condition: (s) => s.player !== null && s.player.attrs.constitution>=8 },
  { id: 'ev-attr-07', kind: 'attribute', title: '抗压阀', text: '小组崩盘时你还能笑出来，组员怀疑你偷偷吃了抗压药。你只是突然觉得，事情再坏也坏不过明天还有早八。', effects: {stress: -5}, condition: (s) => s.player !== null && s.player.attrs.resilience>=8 },
  { id: 'ev-attr-08', kind: 'attribute', title: '精力怪', text: '连上三节课你还能去操场跑两圈，室友问你是不是充电的。你说不是，只是昨晚睡得像个正常人。', effects: {energy: 5, stress: -2}, condition: (s) => s.player !== null && s.player.attrs.energy>=8 },
  { id: 'ev-attr-09', kind: 'attribute', title: '换季感冒', text: '降温第一天你就中招，纸巾用量超过笔记。室友把最后一片感冒药分给你，你感动得当场打了个喷嚏。', effects: {energy: -5, stress: 5, money: -50}, condition: (s) => s.player !== null && s.player.attrs.constitution<=4 },
  { id: 'ev-attr-10', kind: 'attribute', title: '夜晚emo', text: '夜里你突然想起三年前的尴尬事，睡眠当场下线。你在黑暗中翻了个身，决定明天一定早点睡，然后继续想了半小时。', effects: {stress: 6, energy: -5}, condition: (s) => s.player !== null && s.player.attrs.resilience<=4 },
  { id: 'ev-attr-11', kind: 'attribute', title: '低血糖', text: '没吃早饭去上课，眼前突然一黑，老师以为你在表演晕厥。同学塞给你一颗糖，你含了半分钟才重新拥有语言能力。', effects: {stress: 4, money: -30}, condition: (s) => s.energy<=20 },
  { id: 'ev-attr-12', kind: 'attribute', title: '高压胃痛', text: '压力大到你开始胃痛，胃比你先提交了请假申请。你去校医院开了药，医生顺便劝你别把考试当成生死抢救。', effects: {energy: -8, money: -40}, condition: (s) => s.stress>=70 },
  { id: 'ev-attr-13', kind: 'attribute', title: '综测工具人', text: '你综测太高，被拉去当各种活动的工具人。从搬桌子到写推文，你发现自己离全面发展只差一个分身。', effects: {composite: 2, energy: -5}, condition: (s) => s.composite>=20 },
  { id: 'ev-attr-14', kind: 'attribute', title: '科研苗子', text: '你已经有论文产出，导师看你的眼神像看到会走路的课题。他拍着你的肩说再写一篇，你笑着点头，心里已经开始算时间。', effects: {research: 4, stress: 2}, condition: (s) => s.research>=100 },
  { id: 'ev-attr-15', kind: 'attribute', title: '英语大佬', text: '英语角你全程无障碍，别人以为你戴了同传耳机。只有你知道，为了这一刻你在宿舍练了三个晚上。', effects: {english: 3, composite: 1}, condition: (s) => s.english>=80 },
  { id: 'ev-attr-16', kind: 'attribute', title: '颜值焦虑', text: '你盯着镜子挑毛病，镜子都快被你看出工伤。最后你决定洗把脸去上课，毕竟病人不会因为你黑眼圈重就少问两个问题。', effects: {stress: 4}, condition: (s) => s.player !== null && s.player.attrs.appearance<=3 },
  { id: 'ev-attr-17', kind: 'attribute', title: '社恐发作', text: '路上遇到认识的人，你低头假装看手机，手机其实是黑屏。对方从你身边走过时，你开始认真研究地砖纹理。', effects: {stress: 4, energy: -3}, condition: (s) => s.player !== null && s.player.attrs.social<=3 },
  { id: 'ev-attr-18', kind: 'attribute', title: '背了就忘', text: '背了三遍的名字，在考场门口变成了那个谁。你站在走廊里翻书，发现书上的字也开始不认识你。', effects: {stress: 3}, condition: (s) => s.player !== null && s.player.attrs.memory<=3 },
  { id: 'ev-attr-19', kind: 'attribute', title: '体测恐惧', text: '体育课要测800米，你提前三天开始腿软。站在起跑线时，你突然理解为什么病人术前会紧张。', effects: {stress: 4}, condition: (s) => s.player !== null && s.player.attrs.constitution<=5 },
  { id: 'ev-attr-20', kind: 'attribute', title: '饭卡见底', text: '饭卡余额见底，食堂阿姨多给你舀了一勺汤。你端着餐盘认真道谢，决定今晚把记账软件重新装回来。', effects: {energy: 3, stress: -2}, condition: (s) => s.money<=50 },
  { id: 'ev-attr-21', kind: 'attribute', title: '奖学金候选', text: '奖学金名单出现你的名字，你走路都开始带风。回到宿舍后你冷静下来，开始担心公示期会不会有人举报你上课吃包子。', effects: {stress: -3, composite: 1}, condition: (s) => s.cumulativeCredits>0 && s.cumulativePoints/s.cumulativeCredits>=3.8 },
  { id: 'ev-attr-22', kind: 'attribute', title: '挂科阴影', text: '你看到挂科两个字就条件反射地心慌。虽然已经补考通过，但每次路过教务处，你还是会下意识加快脚步。', effects: {stress: 4}, condition: (s) => s.everFailed },
  { id: 'ev-attr-23', kind: 'attribute', title: '思政课谈心', text: '思政老师找你谈心，你准备了八百字，最后只说了好的老师。回去路上你突然想到一句更合适的回答，但已经晚了。', effects: {composite: 2, stress: 2}, condition: (s) => s.politicsCompleted.length>0 },
  { id: 'ev-attr-24', kind: 'attribute', title: '导师召唤', text: '导师突然喊你去办公室，你一路上把自己这学期所有错误都复习了一遍。结果他只是问你有没有兴趣参加一个课题，你差点当场答应三个。', effects: {research: 3, stress: 2}, condition: (s) => s.mentorContactUnlocked },
  { id: 'ev-attr-25', kind: 'attribute', title: '室友带饭', text: '室友帮你带饭占座，还顺手帮你把快递取了。你决定这周不跟他抢厕所，也不计较他半夜打游戏的键盘声。', effects: {energy: 4, stress: -3}, condition: (s) => s.roommateBond },
  { id: 'ev-attr-26', kind: 'attribute', title: '考研焦虑', text: '考研报名后，你做梦都在涂答题卡。醒来时你发现枕头被自己捏出了手印，决定今天先做一套真题压压惊。', effects: {stress: 5, energy: -4}, condition: (s) => s.kaoyanRegistered },
  { id: 'ev-attr-27', kind: 'attribute', title: '保研面试梦', text: '你梦到保研面试，老师问你为什么选择这个专业。你在梦里回答得头头是道，醒来后只记得自己一直在找教室。', effects: {stress: 3, prep: 2}, condition: (s) => (s.postgradChance ?? 0)>=0.5 },
  { id: 'ev-attr-28', kind: 'attribute', title: '被抱大腿', text: '小组作业你又成了大腿，组员在群里集体装死。你一个人写完报告，最后在致谢里认真写上了自己的名字。', effects: {composite: 2, energy: -5}, condition: (s) => s.season.courses.some(c=>c.electiveType==='group') },
  { id: 'ev-attr-29', kind: 'attribute', title: '兴趣课点名', text: '兴趣课老师随机点名，你被迫上台即兴表演。你唱了两句就忘词，台下却有人说有感情，你决定把这次当作舞台经验。', effects: {socialGrowth: 5, stress: 2}, condition: (s) => s.season.courses.some(c=>c.electiveType==='interest') },
  { id: 'ev-attr-30', kind: 'attribute', title: '食堂阿姨手抖', text: '食堂阿姨手一抖，多给你半勺肉。你当场决定原谅世界，也原谅今天早上那节早八。', effects: {energy: 3, stress: -2}, condition: (s) => s.player !== null && s.player.attrs.social>=6 },
  // 完全随机型（100）
  { id: 'ev-random-001', kind: 'random', title: '电动车撞人', text: '校园路上你被一辆电动车的后视镜带走，对方比你还先喊没事吧。你坐在地上检查了半天，确认零件都在，才想起自己还没吃午饭。', effects: {energy: -10, stress: 5, money: -50} },
  { id: 'ev-random-002', kind: 'random', title: '体育课崴脚', text: '一个漂亮的上篮之后，你的脚踝表示不同意。你单脚跳到场边，老师问你要不要去医院，你说先看看能不能走，结果发现不能。', effects: {energy: -5, stress: 5, constitutionGrowth: -5} },
  { id: 'ev-random-003', kind: 'random', title: '食堂食物中毒', text: '那道菜看着很正常，吃完后你开始重新认识校医院。你在输液室里遇到同班同学，对方说我也是那个窗口，你们当场交换了一个同病相怜的眼神。', effects: {energy: -15, stress: 8, money: -80} },
  { id: 'ev-random-004', kind: 'random', title: '外卖被偷', text: '外卖显示已送达，配送员说放在门口，门口说没有。你在宿舍群里问了一圈，最后发现自己的饭正被隔壁寝室当成公共物资分着吃。', effects: {money: -30, stress: 4} },
  { id: 'ev-random-005', kind: 'random', title: '校园卡失踪', text: '校园卡最后一次出现是在你手里，现在它选择了自由。你补办完新卡，在旧外套口袋里摸到了它，双方都沉默了。', effects: {money: -20, stress: 3} },
  { id: 'ev-random-006', kind: 'random', title: '捡到校园卡', text: '你在路上捡到一张校园卡，照片上的人看起来和你一样困。你把它交到失物招领处，失主后来请你喝了瓶水，你决定相信好人有好报。', effects: {money: 20, stress: -2, composite: 1} },
  { id: 'ev-random-007', kind: 'random', title: '售货机吞币', text: '自动售货机吃了你的钱，吐出一句谢谢惠顾。你拍了拍机器，它没有反应；你踢了一脚，它依然没有反应。你决定以后只去食堂。', effects: {money: -10, stress: 2} },
  { id: 'ev-random-008', kind: 'random', title: '占座被收', text: '你放在图书馆座位上的书被管理员收走了。你赶到服务台时，书正安静地躺在失物箱里，像在反省，又像在嘲笑。', effects: {stress: 3} },
  { id: 'ev-random-009', kind: 'random', title: '宿舍停电', text: '宿舍突然停电，大家第一次在九点前洗漱。你在黑暗中摸到自己的手机，发现还有80%电，突然觉得今晚也不是不能过。', effects: {energy: -5, stress: 2} },
  { id: 'ev-random-010', kind: 'random', title: '室友带夜宵', text: '室友带回来一份炸串，你一边说减肥一边伸手。吃到第三串时你决定明天开始运动，室友说你上周也是这么说的。', effects: {energy: 5, stress: -3, money: -20} },
  { id: 'ev-random-011', kind: 'random', title: '早八暴雨', text: '早八下雨，你到教室时像刚参加完铁人三项。老师看着你滴水的头发，决定不点名，你第一次觉得天气也有仁慈的时候。', effects: {energy: -3, stress: 3} },
  { id: 'ev-random-012', kind: 'random', title: '食堂新品', text: '食堂新窗口买一送一，你决定给厨师一次机会。吃完后你认真评价：味道一般，但送的那份确实让人心情很好。', effects: {energy: 5, stress: -2, money: -15} },
  { id: 'ev-random-013', kind: 'random', title: '被猫碰瓷', text: '一只校园猫躺在你脚边不走，你蹲下摸了十分钟，差点迟到。它在你离开时翻了个身，露出肚皮，你决定明天带点吃的来。', effects: {stress: -5} },
  { id: 'ev-random-014', kind: 'random', title: '鸟屎命中', text: '你抬头看天，天也看了你一眼。你顶着一小片自然的馈赠走进教学楼，路上收获了三张憋笑的脸。', effects: {stress: 3, money: -10} },
  { id: 'ev-random-015', kind: 'random', title: '手机进水', text: '手机掉进洗手池，吹干后它坚持认为自己是一块砖。你借室友的手机登录微信，发现最重要的消息是食堂今天有红烧肉。', effects: {money: -100, stress: 5} },
  { id: 'ev-random-016', kind: 'random', title: '打印机卡纸', text: '打印店老板说机器坏了，你看着机器里的论文，觉得它比你先毕业。你蹲在旁边等了十分钟，最后决定换一家店，顺便把格式再改一遍。', effects: {stress: 3} },
  { id: 'ev-random-017', kind: 'random', title: '快递丢件', text: '快递显示已签收，你签收了一个寂寞。客服让你提供证据，你看着空荡荡的快递柜，第一次理解什么叫举证责任。', effects: {money: -50, stress: 3} },
  { id: 'ev-random-018', kind: 'random', title: '快递多送', text: '你收到一件没买的东西，客服说送你了。你拆开发现是一包纸巾，虽然不是惊喜，但确实是最近最实用的礼物。', effects: {energy: 3, money: 20} },
  { id: 'ev-random-019', kind: 'random', title: '旧书夹钱', text: '旧教材里夹着一张钞票，你第一次觉得知识真的能变现。你翻了翻书，发现上一任主人还在扉页写了加油，字迹比你的笔记认真。', effects: {money: 50, stress: -3} },
  { id: 'ev-random-020', kind: 'random', title: '奖学金公示', text: '奖学金名单公示，你发现自己没看错，走路都开始带风。回到宿舍后你冷静下来，开始担心公示期会不会有人举报你上课吃包子。', effects: {stress: -2, composite: 2} },
  { id: 'ev-random-021', kind: 'random', title: '选修课调课', text: '选修课突然调到早八，你怀疑老师在针对你的睡眠。你在群里看到一片哀嚎，决定先把闹钟提前半小时，再继续哀嚎。', effects: {stress: 3} },
  { id: 'ev-random-022', kind: 'random', title: '校园网断', text: '校园网在交作业前十分钟准时断开，你盯着网络已连接但无法访问互联网看了很久。最后你用手机热点救场，也顺便理解了什么叫现代医学依赖基础设施。', effects: {stress: 4} },
  { id: 'ev-random-023', kind: 'random', title: '电梯困人', text: '电梯卡在两层之间，你和陌生人聊了十分钟天气。门打开时你们同时松了一口气，然后假装刚才的尴尬没有发生。', effects: {energy: -5, stress: 5} },
  { id: 'ev-random-024', kind: 'random', title: '教务处排队', text: '你在教务处排了四十分钟，窗口老师告诉你这个不在这里办。你走到另一个窗口，排了二十分钟，对方说先回学院盖章。', effects: {energy: -5, stress: 3} },
  { id: 'ev-random-025', kind: 'random', title: '被误认老师', text: '新生向你问路，你指完路才想起自己也不认识。对方认真道谢，你决定不纠正，毕竟看起来靠谱也是一种能力。', effects: {stress: -2, composite: 1} },
  { id: 'ev-random-026', kind: 'random', title: '被迫填问卷', text: '你为了帮同学毕业，填了人生中最长的一份问卷。填到最后你发现问卷在问你最近是否感到焦虑，你认真选了非常。', effects: {composite: 1, energy: -2} },
  { id: 'ev-random-027', kind: 'random', title: '校园歌手', text: '你在操场唱歌被听见，第二天收获三个昨晚是你吗。你嘴上说唱得不好，心里已经把这首歌加入了下次的曲目单。', effects: {stress: -4, socialGrowth: 5} },
  { id: 'ev-random-028', kind: 'random', title: '运动会报名', text: '班级缺人，你被报了一个看起来适合你的项目。比赛当天你发现全班都在看你，于是你决定跑得慢一点，至少姿态好看。', effects: {energy: -5, constitutionGrowth: 3} },
  { id: 'ev-random-029', kind: 'random', title: '体测前夜', text: '体测前夜，你突然开始做仰卧起坐，做了三个。你躺回床上，觉得至少自己努力过，然后心安理得地睡了。', effects: {energy: -5, stress: 3} },
  { id: 'ev-random-030', kind: 'random', title: '体测超常', text: '体测成绩超常，你怀疑仪器坏了，但没敢问。室友说你今天像被什么附体，你决定把这次成绩写进简历。', effects: {constitutionGrowth: 3, stress: -3} },
  { id: 'ev-random-031', kind: 'random', title: '献血车进校', text: '你走上献血车，下来时收获一张证书和一整天的困意。室友问你疼不疼，你说不疼，只是有点想躺着上完这周的课。', effects: {energy: -10, composite: 2} },
  { id: 'ev-random-032', kind: 'random', title: '义诊志愿', text: '你去社区义诊，量血压量出了三位疑似高血压的阿姨。她们围着你问了一下午养生问题，你第一次觉得自己离医生这个称呼近了一点。', effects: {composite: 3, energy: -8} },
  { id: 'ev-random-033', kind: 'random', title: '宣讲会凑数', text: '你被拉去听宣讲会，结束时只记住欢迎投递。回宿舍后你认真想了想未来，然后打开外卖软件，决定先解决今晚。', effects: {composite: 1, stress: 2} },
  { id: 'ev-random-034', kind: 'random', title: '食堂插队', text: '有人插队，你刚想开口，对方回头说我赶时间。你看着他的背影，决定让他赶，毕竟你也不确定自己赶不赶。', effects: {stress: 4} },
  { id: 'ev-random-035', kind: 'random', title: '被锁门外', text: '宿舍门锁了，你在门口等了半小时。室友在三楼打游戏，接到电话后说马上，你听着电话里的游戏音效，决定今晚不帮他带饭。', effects: {energy: -5, stress: 3} },
  { id: 'ev-random-036', kind: 'random', title: '笔记不还', text: '同学借走你的笔记，还回来时多了一段这里我帮你改了。你翻开一看，他改的地方正好是你最有把握的地方。', effects: {stress: 3} },
  { id: 'ev-random-037', kind: 'random', title: '匿名奶茶', text: '你收到一杯匿名奶茶，备注写着学医辛苦了。你决定不查是谁，把奶茶喝完，顺便把今天的坏心情也喝掉。', effects: {stress: -4, energy: 3} },
  { id: 'ev-random-038', kind: 'random', title: '表白墙', text: '你上了校园表白墙，评论里一半夸你，一半问你是不是走错片场。你假装不在意，实际上把每一条评论都看完了。', effects: {stress: -2, socialGrowth: 5} },
  { id: 'ev-random-039', kind: 'random', title: '考场桌椅抖', text: '你的考场桌椅不稳，写一道题晃三下，像在给答案打节拍。监考老师走过来看了一眼，你立刻坐直，桌椅也跟着安静了。', effects: {stress: 3} },
  { id: 'ev-random-040', kind: 'random', title: '监考站旁边', text: '监考老师在你旁边站了五分钟，你开始怀疑自己每道题都做错了。他离开后你才发现，他只是在看窗外那棵树。', effects: {stress: 4} },
  { id: 'ev-random-041', kind: 'random', title: '忘带学生证', text: '你忘带学生证，监考老师看着你的脸问：你能证明你是你吗？你掏出手机里的校园卡照片，他看了半天，终于放你进去。', effects: {stress: 3} },
  { id: 'ev-random-042', kind: 'random', title: '雨伞被拿', text: '雨停了，你的伞也消失了。你看着空空的伞架，决定相信拿走它的人比你更需要，然后冒着毛毛雨走回宿舍。', effects: {money: -20, stress: 3} },
  { id: 'ev-random-043', kind: 'random', title: '共享单车坏', text: '你扫了五辆共享单车，第一辆没座，第二辆没链子，第五辆在别人手里。你最后走着去上课，发现其实也没迟到。', effects: {energy: -5, stress: 3} },
  { id: 'ev-random-044', kind: 'random', title: '校园迷路', text: '你在校园里迷路，导航把你导到了隔壁学校。你站在对方校门口，第一次认真思考自己到底适不适合学医。', effects: {energy: -5, stress: 2} },
  { id: 'ev-random-045', kind: 'random', title: '社团聚餐', text: '社团聚餐，你负责烤肉，也负责被大家叫医生来看看这肉熟没熟。你认真判断后说再烤一会儿，大家居然真的听了。', effects: {money: -60, socialGrowth: 8, stress: -5} },
  { id: 'ev-random-046', kind: 'random', title: '深夜炸鸡', text: '凌晨一点，炸鸡到了，你决定明天再谈健康饮食。吃到一半你想起明早有课，于是把剩下的放进冰箱，当作明天的早餐。', effects: {money: -40, energy: 5, stress: 2} },
  { id: 'ev-random-047', kind: 'random', title: '通宵追剧', text: '你本来只看一集，结果剧集问你是否确定不看完。第二天你顶着黑眼圈上课，老师讲的内容像弹幕一样从眼前飘过。', effects: {energy: -10, stress: 4} },
  { id: 'ev-random-048', kind: 'random', title: '操场看星星', text: '你在操场看星星，蚊子也在看你。你一边拍蚊子一边抬头，突然觉得大学生活虽然乱七八糟，但偶尔也有点好看。', effects: {stress: -5, energy: -2} },
  { id: 'ev-random-049', kind: 'random', title: '迷路遇猫', text: '你迷路了，但遇到一只愿意带路的猫。虽然它把你带到了另一个门，你还是很感谢它，至少你没有一直站在原地。', effects: {stress: -4} },
  { id: 'ev-random-050', kind: 'random', title: '毕业季拍照', text: '毕业季拍照，你穿上白大褂，突然觉得自己还没准备好。快门按下时你笑得很标准，心里却在想下一张照片会在哪里拍。', effects: {socialGrowth: 5, stress: -3} },
  { id: 'ev-random-051', kind: 'random', title: '图书馆邻座', text: '图书馆只剩一个靠窗座位，你刚坐下，旁边的人小声问能不能借支笔。还笔时对方顺手推来一包纸巾，你决定把这一节课上得认真一点，至少装得像。', effects: {socialGrowth: 5, stress: -3, prep: 1} },
  { id: 'ev-random-052', kind: 'random', title: '食堂拼桌', text: '食堂人满为患，一个端着餐盘的人在你对面坐下，问能不能拼个桌。你们从这个菜好吃吗聊到你也是学医的，最后发现彼此都在假装不后悔。', effects: {socialGrowth: 5, energy: 2} },
  { id: 'ev-random-053', kind: 'random', title: '雨伞共享', text: '暴雨突至，你站在教学楼门口等雨停，{npc}撑着伞问你要不要一起走。你们挤在一把伞下，肩膀湿了一半，尴尬也湿了一半。', effects: {socialGrowth: 5, stress: -4} },
  { id: 'ev-random-054', kind: 'random', title: '夜跑搭子', text: '你在操场慢跑，{npc}从后面追上来，说你配速稳定得像心电图。你们边跑边聊，最后都忘了自己本来打算跑几圈。', effects: {constitutionGrowth: 3, socialGrowth: 5, energy: -2} },
  { id: 'ev-random-055', kind: 'random', title: '社团联谊', text: '社团联谊把你安排在最角落的位置，你本来打算安静吃饭。结果游戏环节你被点名上台，{npc}在台下笑得最大声，散场后却主动来加了你微信。', effects: {socialGrowth: 8, stress: -4, money: -30} },
  { id: 'ev-random-056', kind: 'random', title: '表白墙乌龙', text: '校园表白墙出现一条寻找今天在二教穿白大褂的同学，你越看越像自己。你紧张了一整天，最后发现人家找的是隔壁班另一位白大褂。', effects: {stress: 4} },
  { id: 'ev-random-057', kind: 'random', title: '随机版要微信', text: '{npc}在教学楼门口拦住你，问能不能加个微信。你大脑里同时闪过要冷静和我今天的头发是不是很乱，开口时声音比平时高了半个调。', effects: {socialGrowth: 8, socialUnlock: true} },
  { id: 'ev-random-058', kind: 'random', title: '匿名情书', text: '你在课本里发现一张没有署名的纸条，上面写着你上课认真起来挺好看的。你把认识的人在脑子里过了一遍，最后决定先相信这是写给自己的。', effects: {stress: -4, socialGrowth: 3} },
  { id: 'ev-random-059', kind: 'random', title: '联谊抽签', text: '联谊活动抽签配对，你和{npc}抽到同一组。你们从互相客气到互相拆台只用了十分钟，活动结束后居然还约了下次一起吃饭。', effects: {socialGrowth: 8, stress: -3, money: -20} },
  { id: 'ev-random-060', kind: 'random', title: '室友的助攻', text: '室友看出你最近总在食堂东张西望，擅自替你要了{npc}的微信。你回宿舍想骂人，看到手机里通过的好友申请，又决定先不骂。', effects: {socialGrowth: 6, stress: -2} },
  { id: 'ev-random-061', kind: 'random', title: '共享单车后座', text: '你的共享单车链条掉了，{npc}骑车经过，问要不要捎你一段。你坐上去才发现后座比想象中难坐，一路都在努力保持一个体面的表情。', effects: {energy: 3, socialGrowth: 4, stress: -2} },
  { id: 'ev-random-062', kind: 'random', title: '校园广播点歌', text: '校园广播突然放了一首你最近单曲循环的歌，主持人说是一位同学点给经常在图书馆三楼自习的人。你抬头看了看四周，发现好几个人也在抬头。', effects: {stress: -4, socialGrowth: 4} },
  { id: 'ev-random-063', kind: 'random', title: '第二杯半价', text: '奶茶店第二杯半价，你一个人喝不完，正好{npc}排在后面。你们一人一杯，从拼单开始，聊到宿舍楼下还忘了加联系方式。', effects: {money: -15, energy: 3, socialGrowth: 4} },
  { id: 'ev-random-064', kind: 'random', title: '食堂多打菜', text: '食堂阿姨今天手格外稳，给你多打了半勺肉。你端着餐盘走出两步，又回头认真说了声谢谢，阿姨笑着说学医的要多补补。', effects: {energy: 3, stress: -2} },
  { id: 'ev-random-065', kind: 'random', title: '旧书里的笔记', text: '你在旧书店淘到一本学长留下的专业书，扉页上写满了笔记，还有一句这里考试必考。你一边觉得自己赚了，一边怀疑这位学长是不是也在骗自己。', effects: {prep: 2, research: 1} },
  { id: 'ev-random-066', kind: 'random', title: '打印店乌龙', text: '你去打印复习资料，老板把别人的论文也塞进了你的文件袋。你翻了两页，发现对方的文献综述写得比你认真，决定回去把格式再改一遍。', effects: {money: -20, stress: 3, prep: 1} },
  { id: 'ev-random-067', kind: 'random', title: '教室睡过头', text: '你在教室后排补觉，醒来时教室里已经换了一批人。你分不清这是第几节课，只能假装镇定地收拾书包，从前门淡定离开。', effects: {energy: 5, stress: 3} },
  { id: 'ev-random-068', kind: 'random', title: '白大褂缩水', text: '你把白大褂丢进洗衣机，取出来时它已经从及膝变成了短款夹克。你穿着它在镜子前站了一会儿，觉得临床氛围没出来，时尚感倒是出来了。', effects: {money: -30, stress: 3} },
  { id: 'ev-random-069', kind: 'random', title: '解剖楼迷路', text: '你去解剖楼交作业，电梯出来以后完全分不清东南西北。你绕了三圈，最后跟着一位推标本车的老师才找到出口，全程没敢问路。', effects: {energy: -4, stress: 2} },
  { id: 'ev-random-070', kind: 'random', title: '实验室冰箱', text: '你把午饭放进实验室冰箱，回来时饭盒里只剩一张便利贴：抱歉，我以为是公共物资。你盯着那张纸看了很久，决定以后在饭盒上写有毒。', effects: {energy: -2, stress: 3, money: -20} },
  { id: 'ev-random-071', kind: 'random', title: '图书馆闭馆', text: '图书馆闭馆音乐响起时，你才发现自己坐过了整个下午。你抱着书往外走，心里居然有点踏实，至少今天没有完全浪费。', effects: {prep: 2, energy: -3} },
  { id: 'ev-random-072', kind: 'random', title: '手机没电', text: '你在教室门口发现手机只剩1%电，充电宝也没带。你提前体验了两个小时没有消息、没有短视频、也没有人找你的清净生活。', effects: {stress: 3} },
  { id: 'ev-random-073', kind: 'random', title: '校园卡余额', text: '你在食堂刷卡时，机器发出了一声意味深长的余额不足。你默默把餐盘里的菜放回去一半，决定明天开始认真记账。', effects: {money: -20, stress: 2} },
  { id: 'ev-random-074', kind: 'random', title: '外卖写错楼', text: '外卖显示已送达，你跑到楼下却发现自己把地址写成了隔壁楼。等你找过去时，骑手已经在群里发了三个问号。', effects: {energy: -3, stress: 2} },
  { id: 'ev-random-075', kind: 'random', title: '快递柜超时', text: '你忘记取快递，快递柜发来超时提醒。你花五毛钱打开柜门，取出一个自己都想不起来买过的东西。', effects: {money: -5, stress: 2} },
  { id: 'ev-random-076', kind: 'random', title: '校园网断', text: '校园网在交作业前十分钟准时断开，你盯着网络已连接但无法访问互联网看了很久。最后你用手机热点救场，也顺便理解了什么叫现代医学依赖基础设施。', effects: {stress: 4} },
  { id: 'ev-random-077', kind: 'random', title: '洗衣机吞袜', text: '洗衣机洗完，你少了一只袜子。你在宿舍群里问了一圈，没人承认，最后只能给剩下的那只袜子安排一个体面的葬礼。', effects: {money: -10, stress: 1} },
  { id: 'ev-random-078', kind: 'random', title: '宿舍夜谈', text: '宿舍熄灯后，大家开始聊以后想去哪个科室。有人说想赚钱，有人说想躺平，你听着听着，突然觉得未来好像也没那么可怕。', effects: {stress: -5, socialGrowth: 5, energy: -2} },
  { id: 'ev-random-079', kind: 'random', title: '操场看台', text: '你一个人坐在操场看台上吹风，看别人跑步、打球、谈恋爱。手机里没有消息，你也没有特别想等的人，这一刻居然还不错。', effects: {stress: -4} },
  { id: 'ev-random-080', kind: 'random', title: '校园猫跟课', text: '一只校园猫跟着你进了教学楼，最后在教室后排睡着了。老师看了它一眼，决定当作没看见，你则负责在下课前帮它挡了两次镜头。', effects: {stress: -5, energy: 2} },
  { id: 'ev-random-081', kind: 'random', title: '共享雨伞', text: '你在宿舍楼下借了一把共享雨伞，伞柄上贴着一张纸条：用完请还，别学上一个。你撑着它穿过雨幕，觉得这句话很有临床警示意义。', effects: {stress: -2, socialGrowth: 3} },
  { id: 'ev-random-082', kind: 'random', title: '自行车掉链子', text: '你骑自行车去上课，链条在半路掉了。你蹲在路边修了十分钟，手上沾满机油，路过的同学纷纷投来需要帮忙吗但没有人停下来的目光。', effects: {energy: -4, stress: 3} },
  { id: 'ev-random-083', kind: 'random', title: '体测抽血', text: '体测前的抽血环节，你看着针头突然有点紧张。护士姐姐说你以后不是要给别人扎针吗，你咬牙伸出手，心里默默把这句话记成了职业阴影。', effects: {energy: -4, stress: 3} },
  { id: 'ev-random-084', kind: 'random', title: '献血', text: '献血车进校，你被同学拉着去排队。护士问你早饭吃了没，你说吃了，其实只喝了一杯水。献血证拿到手时，你觉得自己至少做了一件不用复习的好事。', effects: {energy: -8, composite: 2} },
  { id: 'ev-random-085', kind: 'random', title: '义诊志愿', text: '你去社区义诊帮忙量血压，一位大爷坚持说自己身体好得很，血压计却发出了不赞同的声音。你耐心解释，他最后问你是不是实习医生，你说差不多。', effects: {composite: 3, energy: -5} },
  { id: 'ev-random-086', kind: 'random', title: '讲座占座', text: '你提前半小时去讲座占座，结果被同学请求帮忙占一排。讲座开始后，那一排人只来了两个，你一个人守着五个空座位，像在经营一家亏损的影院。', effects: {socialGrowth: 3, stress: 2} },
  { id: 'ev-random-087', kind: 'random', title: '招聘会', text: '校园招聘会上，你投了几份简历，发现每个岗位都写着有经验者优先。你站在展位前认真思考：医学生到底哪里来的经验？', effects: {composite: 1, stress: 3} },
  { id: 'ev-random-088', kind: 'random', title: '忘带笔', text: '考试前你翻遍书包，发现笔袋安静地躺在宿舍桌上。你硬着头皮向旁边同学借笔，对方递来两支，说怕你一支不够断水。', effects: {stress: 4, socialGrowth: 2} },
  { id: 'ev-random-089', kind: 'random', title: '考场座位', text: '你走进考场发现旁边坐着{npc}，对方冲你点了点头。你本来很紧张，突然觉得这张桌子没那么冷了，连监考老师看起来都慈祥了一点。', effects: {socialGrowth: 3, stress: -2} },
  { id: 'ev-random-090', kind: 'random', title: '成绩单寄家', text: '学校把成绩单寄回了家，你还没想好怎么解释，家长的电话先到了。你看着屏幕上的来电显示，决定先深呼吸三次，再接。', effects: {stress: 4} },
  { id: 'ev-random-091', kind: 'random', title: '家长群', text: '家长群里有人转发了医学生未来十年最吃香科室，你妈立刻艾特你。你点开看了一眼，发现文章是七年前发的，决定不回复。', effects: {stress: 2, energy: -2} },
  { id: 'ev-random-092', kind: 'random', title: '亲戚问专业', text: '过年亲戚问你学什么专业，你说临床医学。对方立刻让你帮忙看看体检报告，你解释了半天我还没毕业，对方说那也差不多。', effects: {stress: 4, energy: -2} },
  { id: 'ev-random-093', kind: 'random', title: '高中同学来访', text: '高中同学来学校找你，你们在食堂吃了一顿久违的饭。聊起以前的同学，有人工作、有人结婚、有人还在考研，你突然觉得五年真的很长。', effects: {stress: -4, socialGrowth: 5, money: -20} },
  { id: 'ev-random-094', kind: 'random', title: '学弟学妹咨询', text: '几个学弟学妹拦住你，问怎么准备期末考试、怎么选科室、怎么和老师相处。你认真回答了半小时，最后发现他们最关心的是食堂哪个窗口好吃。', effects: {socialGrowth: 5, composite: 1} },
  { id: 'ev-random-095', kind: 'random', title: '校园拍照', text: '你穿着白大褂在校园里拍照，路过的同学以为你是老师。你笑着解释自己只是学生，对方说那你看起来很像能主刀的人，你决定把这句话记很久。', effects: {stress: -3, socialGrowth: 3} },
  { id: 'ev-random-096', kind: 'random', title: '毕业季', text: '毕业季的校园到处都是拍照的人，你也被拉去合影。快门按下时，你突然发现自己已经能熟练地说出以后常联系，虽然知道很多人不会再联系。', effects: {stress: -3, socialGrowth: 5} },
  { id: 'ev-random-097', kind: 'random', title: '宿舍搬家', text: '宿舍调整，你的东西比想象中多出三倍。你翻出一堆以后肯定用得上的东西，最后决定把它们原封不动搬到新宿舍继续占地方。', effects: {energy: -5, stress: 2} },
  { id: 'ev-random-098', kind: 'random', title: '旧物捐赠', text: '你把旧衣服和旧书整理出来捐掉，发现其中一件外套是刚入学时买的。你试了一下，袖子短了一截，决定把它留给下一个需要的人。', effects: {composite: 1, stress: -2} },
  { id: 'ev-random-099', kind: 'random', title: '校园夜市', text: '校园夜市开张，你和同学从头吃到尾。回宿舍路上你摸着肚子，觉得健康饮食这四个字明天再执行也来得及。', effects: {money: -40, energy: 4, stress: -4} },
  { id: 'ev-random-100', kind: 'random', title: '校医院', text: '你因为连续熬夜去校医院，医生听完你的作息后沉默了三秒，给你开了药和一句你们学医的怎么比病人还不听话。你拿着药，决定今晚十二点前睡。', effects: {money: -30, energy: 5, stress: -2} },
  // 社交相关追加（场景 10 / 属性 10 / 完全随机 10）
  { id: 'ev-social-scene-01', kind: 'scene', title: '社团联谊', text: '社团联谊把一群原本只在群里发过表情包的人塞进了同一间活动室。游戏环节你被推上台，台下有人笑得最响，散场后却主动来加你微信。', effects: {socialGrowth: 8, stress: -3, money: -30}, condition: (s) => Math.floor(s.seasonIndex/4)+1===2 },
  { id: 'ev-social-scene-02', kind: 'scene', title: '宿舍火锅局', text: '室友突然提议在宿舍煮火锅，五个人围着一口小锅，筷子在汤里打架。吃完后你们花了半小时收拾，却都觉得这顿饭比食堂好吃十倍。', effects: {socialGrowth: 6, stress: -4, money: -40, energy: 3}, condition: (s) => s.roommateBond },
  { id: 'ev-social-scene-03', kind: 'scene', title: '兴趣课搭子', text: '兴趣课上老师让你们自由组队，你旁边的人小声问要不要一起。你们从五线谱聊到食堂新品，下课时已经约好下次一起练。', effects: {socialGrowth: 6, stress: -3}, condition: (s) => s.season.courses.some(c=>c.electiveType==='interest') },
  { id: 'ev-social-scene-04', kind: 'scene', title: '小组课团建', text: '小组作业课结束后，组员提议去校门口吃烧烤。你本来只想回宿舍躺平，结果在饭桌上听到了三个科室的八卦，最后主动加了所有人好友。', effects: {socialGrowth: 5, composite: 2, money: -35}, condition: (s) => s.season.courses.some(c=>c.electiveType==='group') },
  { id: 'ev-social-scene-05', kind: 'scene', title: '见习搭话', text: '见习时你站在病房门口不知道该做什么，一位护士姐姐主动教你怎么和病人开口。你照着说了第一句话，病人居然笑了。', effects: {socialGrowth: 5, stress: -2}, condition: (s) => Math.floor(s.seasonIndex/4)+1>=4 },
  { id: 'ev-social-scene-06', kind: 'scene', title: '图书馆邻座', text: '你在图书馆坐下，旁边的{npc}小声问能不能借支笔。还笔时对方顺手推来一包纸巾，你们从“谢谢”聊到“你也考这门”，最后交换了微信。', effects: {socialGrowth: 5, stress: -2, prep: 1}, condition: (s) => s.habits.includes('timeManagement') || s.plan==='B' },
  { id: 'ev-social-scene-07', kind: 'scene', title: '食堂拼桌', text: '食堂人满为患，一位端着餐盘的{npc}在你对面坐下。你们从“这个菜好吃吗”聊到“你也是学医的”，最后发现彼此都在假装不后悔。', effects: {socialGrowth: 5, energy: 2}, condition: (s) => s.season.id.includes('summer') },
  { id: 'ev-social-scene-08', kind: 'scene', title: '社团夜跑', text: '社团组织夜跑，你被安排在队伍最后，负责陪跑得最慢的{npc}。你们边跑边聊，最后都忘了自己本来打算跑几圈。', effects: {socialGrowth: 5, constitutionGrowth: 2, energy: -2}, condition: (s) => Math.floor(s.seasonIndex/4)+1>=2 },
  { id: 'ev-social-scene-09', kind: 'scene', title: '期末互助小组', text: '期末前有人拉了个互助小组，大家把各自整理的重点丢进群里。你本来只想潜水，结果被点名讲解一道题，讲完发现自己也懂了。', effects: {socialGrowth: 5, prep: 2, stress: -2}, condition: (s) => s.plan==='A' },
  { id: 'ev-social-scene-10', kind: 'scene', title: '毕业季合照', text: '毕业季，学弟学妹拉着你拍合照。你站在中间，突然想起自己刚入学时也这样仰头看过别人，于是笑得很认真。', effects: {socialGrowth: 6, stress: -3}, condition: (s) => Math.floor(s.seasonIndex/4)+1>=5 },
  { id: 'ev-social-attr-01', kind: 'attribute', title: '社交悍匪回归', text: '你走进食堂，三个桌的人同时招呼你。你端着一份饭在中间站了三秒，第一次体会到人缘太好也会造成选择困难。', effects: {socialGrowth: 8, composite: 1}, condition: (s) => s.player !== null && s.player.attrs.social>=8 },
  { id: 'ev-social-attr-02', kind: 'attribute', title: '建模光环', text: '{npc}在走廊里回头看了你两次，第三次终于走过来问你是不是那个在图书馆三楼自习的人。你点了点头，对方说“难怪”，然后笑着走了。', effects: {socialGrowth: 6, stress: -2}, condition: (s) => s.player !== null && s.player.attrs.appearance>=8 },
  { id: 'ev-social-attr-03', kind: 'attribute', title: '社恐破冰', text: '社团活动要求每人说一句自我介绍。你站起来脑子里一片空白，最后说了一句“我叫……嗯”，全场笑了，但你居然没那么紧张了。', effects: {socialGrowth: 3, stress: -2}, condition: (s) => s.player !== null && s.player.attrs.social<=3 },
  { id: 'ev-social-attr-04', kind: 'attribute', title: '高情商救场', text: '小组讨论卡住时，你一句话把跑偏的话题拉了回来。组员看你的眼神像看到救世主，你谦虚地说“只是刚好想到”，其实心里已经给自己鼓掌。', effects: {socialGrowth: 6, stress: -2, composite: 1}, condition: (s) => s.player !== null && (s.player.attrs.social>=7 || s.player.attrs.comprehension>=8) },
  { id: 'ev-social-attr-05', kind: 'attribute', title: '会照顾人', text: '朋友情绪低落，你陪他在操场走了三圈，听他讲完一肚子委屈。最后他问你累不累，你说不累，其实腿已经酸了。', effects: {socialGrowth: 5, stress: -2}, condition: (s) => s.player !== null && s.player.attrs.resilience>=8 },
  { id: 'ev-social-attr-06', kind: 'attribute', title: '情感树洞', text: '三个朋友同时来找你倾诉，你听了一晚上别人的恋爱问题。回宿舍后你发现自己连晚饭都没吃，但手机里多了三条“谢谢你”。', effects: {socialGrowth: 4, stress: 2}, condition: (s) => s.player !== null && s.player.attrs.social>=6 },
  { id: 'ev-social-attr-07', kind: 'attribute', title: '饭局冷场王', text: '聚餐时你讲了个笑话，桌上安静了三秒，然后有人礼貌地笑了一下。你把这段经历总结为“下次只负责吃”。', effects: {stress: 4}, condition: (s) => s.player !== null && s.player.attrs.social<=4 },
  { id: 'ev-social-attr-08', kind: 'attribute', title: '眼神杀', text: '{npc}说你刚才看人的眼神很认真，像在问病史。你解释那只是发呆，对方说“那你发呆还挺好看”。', effects: {socialGrowth: 5, stress: -2}, condition: (s) => s.player !== null && s.player.attrs.appearance>=7 },
  { id: 'ev-social-attr-09', kind: 'attribute', title: '团队粘合剂', text: '小组作业又差点散伙，你挨个私聊把大家拉回群里。最后报告按时交了，组员在群里发了一句“没有你我们真的不行”。', effects: {socialGrowth: 5, composite: 1}, condition: (s) => s.player !== null && s.player.attrs.comprehension>=7 },
  { id: 'ev-social-attr-10', kind: 'attribute', title: '低精力社交', text: '朋友约你出门，你在地铁上就开始后悔。到了地方你强撑着聊了两小时，回家后躺在床上一句话都不想说。', effects: {stress: 3}, condition: (s) => s.energy<=20 },
  { id: 'ev-social-random-01', kind: 'random', title: '食堂拼桌奇遇', text: '食堂只剩一个空位，你坐下后发现对面是{npc}。你们从“这个菜辣不辣”聊到“你以后想选什么科”，吃完饭居然都有点不想走。', effects: {socialGrowth: 5, stress: -3} },
  { id: 'ev-social-random-02', kind: 'random', title: '校园搭讪', text: '你在教学楼门口等人，突然被{npc}拦住问路。你指完路，对方没走，反而问你是不是也上那门选修课。你们站在门口聊到上课铃响。', effects: {socialGrowth: 6, stress: -2} },
  { id: 'ev-social-random-03', kind: 'random', title: '被拉进群聊', text: '你被拉进一个名为“今天谁请客”的群，群里已经有十七个人。你还没搞清楚发生了什么，就收到三条艾特和一张食堂菜单。', effects: {socialGrowth: 4, stress: 1} },
  { id: 'ev-social-random-04', kind: 'random', title: '社团偶遇', text: '你在社团活动室门口遇到{npc}，对方手里抱着两摞资料，你顺手帮了一程。后来你才知道，对方是社团里最靠谱的学长/学姐。', effects: {socialGrowth: 5, stress: -2} },
  { id: 'ev-social-random-05', kind: 'random', title: '被误会成情侣', text: '你和{npc}一起从食堂走出来，被同班同学撞见。第二天班里开始流传你们在一起了，你们解释了半天，最后决定先不解释了。', effects: {socialGrowth: 4, stress: 3} },
  { id: 'ev-social-random-06', kind: 'random', title: '朋友生日', text: '朋友突然说今天生日，你们临时在食堂凑了一桌。蛋糕是便利店买的，蜡烛是打火机代替的，但唱生日歌时大家都很认真。', effects: {socialGrowth: 6, stress: -3, money: -50} },
  { id: 'ev-social-random-07', kind: 'random', title: '深夜卧谈', text: '宿舍熄灯后，大家开始聊以后想去哪个科室。有人说想赚钱，有人说想躺平，你听着听着，突然觉得未来好像也没那么可怕。', effects: {socialGrowth: 5, stress: -4, energy: -2} },
  { id: 'ev-social-random-08', kind: 'random', title: '室友出卖', text: '室友把你的糗事讲给了全班，你在食堂被三个人笑着问“真的假的”。你决定今晚回去把他的洗发水藏起来。', effects: {socialGrowth: 3, stress: 3} },
  { id: 'ev-social-random-09', kind: 'random', title: '操场看球', text: '傍晚操场有人打球，你被拉去凑数。你一个球都没进，但场边的人一直在给你加油，结束以后还一起去喝了水。', effects: {socialGrowth: 5, stress: -3, energy: -2} },
  { id: 'ev-social-random-10', kind: 'random', title: '毕业合影', text: '毕业季的校园到处是拍照的人，你被{npc}拉去合影。快门按下时，你突然发现自己已经能熟练地说出“以后常联系”。', effects: {socialGrowth: 5, stress: -2} },
]

const KIND_LABEL = {
  scene: '场景触发',
  attribute: '属性触发',
  random: '完全随机',
  romance: '恋爱危机',
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function npcRole(player: Player): string {
  const gender = player.gender
  const orientation = player.orientation ?? 'heterosexual'
  const opposite = gender === '女' ? '男' : '女'
  const pool: Array<'女' | '男'> =
    orientation === 'heterosexual'
      ? [opposite]
      : orientation === 'homosexual'
        ? [gender]
        : ['女', '男']
  const picked = pool[Math.floor(Math.random() * pool.length)]
  return picked === '女'
    ? Math.random() < 0.5
      ? '学妹'
      : '学姐'
    : Math.random() < 0.5
      ? '学弟'
      : '学长'
}

function effectLines(effect: EventEffect): string[] {
  const lines: string[] = []
  const push = (label: string, value: number | undefined) => {
    if (!value) return
    lines.push(`${label} ${value > 0 ? '+' : ''}${value}`)
  }
  push('压力', effect.stress)
  push('精力', effect.energy)
  push('生活费', effect.money)
  push('本周准备度', effect.prep)
  push('体质成长', effect.constitutionGrowth)
  push('人际成长', effect.socialGrowth)
  push('建模成长', effect.appearanceGrowth)
  push('科研', effect.research)
  push('英语', effect.english)
  push('综测', effect.composite)
  push('考研准备', effect.kaoyanPrep)
  push('交际', effect.socialAttr)
  if (effect.socialUnlock) lines.push('社交模块解锁（后续开发）')
  if (effect.romanceBreak) lines.push('所有恋爱关系破裂')
  if (effect.teacherBreak) lines.push('师生关系破裂')
  if (effect.breakupRelationId) lines.push('这段恋爱关系结束')
  return lines
}

function pickSeed(kind: EventSeed['kind'], state: GameState): EventSeed | null {
  const pool = EVENTS.filter(
    (event) =>
      event.kind === kind &&
      !state.eventHistory.includes(event.id) &&
      (!event.condition || event.condition(state)),
  )
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export const EVENT_LIBRARY = EVENTS

export function rollWeeklyEvent(state: GameState): PendingEvent | null {
  if (!state.player || state.week < 1 || state.week > 3) return null
  let seed: EventSeed | null = null
  if (Math.random() < 0.05) seed = pickSeed('random', state)
  if (!seed && Math.random() < 0.2) seed = pickSeed('scene', state)
  else if (!seed && Math.random() < 0.15) seed = pickSeed('attribute', state)
  if (!seed) return null

  const resolvedEffects =
    typeof seed.effects === 'function' ? seed.effects(state) : seed.effects
  const text = seed.text.replaceAll('{npc}', npcRole(state.player))
  return {
    id: seed.id,
    kind: seed.kind,
    title: seed.title,
    text,
    effectLines: effectLines(resolvedEffects),
    effects: resolvedEffects,
  }
}

export function applyEvent(state: GameState, event: PendingEvent): GameState {
  const effect = event.effects
  const next: GameState = {
    ...state,
    pendingEvent: null,
    screen: 'week',
    eventHistory: [...state.eventHistory, event.id],
    stress: clamp(state.stress + (effect.stress ?? 0), 0, 100),
    energy: clamp(state.energy + (effect.energy ?? 0), 0, 100),
    money: Math.max(0, state.money + (effect.money ?? 0)),
    constitutionGrowth: Math.max(
      0,
      state.constitutionGrowth + (effect.constitutionGrowth ?? 0),
    ),
    socialGrowth: Math.max(0, state.socialGrowth + (effect.socialGrowth ?? 0)),
    appearanceGrowth: Math.max(
      0,
      state.appearanceGrowth + (effect.appearanceGrowth ?? 0),
    ),
    research: Math.max(0, state.research + (effect.research ?? 0)),
    english: clamp(state.english + (effect.english ?? 0), 0, 100),
    composite: Math.max(0, state.composite + (effect.composite ?? 0)),
    kaoyanPrep: clamp(state.kaoyanPrep + (effect.kaoyanPrep ?? 0), 0, 100),
    socialModuleUnlocked:
      state.socialModuleUnlocked || Boolean(effect.socialUnlock),
    prep: { ...state.prep },
  }
  if (effect.socialAttr && next.player) {
    next.player = {
      ...next.player,
      attrs: {
        ...next.player.attrs,
        social: clamp(next.player.attrs.social + effect.socialAttr, 2, 10),
      },
    }
  }
  if (effect.romanceBreak) {
    next.relationships = next.relationships.map((relation) =>
      relation.partner
        ? {
            ...relation,
            partner: false,
            intimacy: Math.max(0, relation.intimacy - 10),
          }
        : relation,
    )
    next.romanceRisk = 0
    next.stress = clamp(next.stress + 10, 0, 100)
  }
  if (effect.teacherBreak) {
    next.relationships = next.relationships.map((relation) =>
      relation.partner && isStaffRelation(relation)
        ? {
            ...relation,
            partner: false,
            intimacy: Math.max(0, relation.intimacy - 18),
            breakupRisk: 0,
          }
        : relation,
    )
    next.teacherScandalRisk = 0
  }
  if (effect.breakupRelationId) {
    next.relationships = next.relationships.map((relation) =>
      relation.id === effect.breakupRelationId
        ? {
            ...relation,
            partner: false,
            intimacy: Math.max(0, relation.intimacy - 20),
            breakupRisk: 0,
          }
        : relation,
    )
  }
  if (effect.prep) {
    for (const course of state.season.courses) {
      next.prep[course.id] = clamp(
        (next.prep[course.id] ?? 0) + effect.prep,
        0,
        100,
      )
    }
  }
  if (
    state.player &&
    ((effect.socialGrowth ?? 0) >= 5 || effect.socialUnlock) &&
    !next.relationships.some((relation) => relation.kind === 'friend')
  ) {
    next.relationships = [
      ...next.relationships,
      createEventFriend(state.player),
    ]
  }
  return next
}

export function romanceRiskAfterWeek(state: GameState): number {
  const partners = state.relationships.filter((relation) => relation.partner).length
  if (partners < 2) return 0
  return Math.min(95, (state.romanceRisk ?? 0) + 8 + (partners - 2) * 4)
}

export function createRomanceDiscoveryEvent(state: GameState): PendingEvent {
  const names = state.relationships
    .filter((relation) => relation.partner)
    .map((relation) => relation.name)
  const nameText = names.length > 0 ? names.join('、') : '那几位'
  return {
    id: 'ev-romance-discovery',
    kind: 'romance',
    title: '修罗场',
    text: `你的手机在同一时间弹出了几条消息。${nameText}分别问你现在在哪，随后她们/他们发现彼此认识的是同一个你。宿舍楼下、食堂门口和图书馆门口同时上演了不同版本的质问，你站在中间，第一次觉得“同时处理多份病史”是一件如此困难的事。所有恋爱关系当场破裂，你的交际名声也一落千丈。`,
    effects: { socialAttr: -3, romanceBreak: true },
    effectLines: ['交际 -3', '压力 +10', '所有恋爱关系破裂'],
  }
}

function createNpcConfession(relation: Relationship): PendingConfession {
  const staff = isStaffRelation(relation)
  return {
    relationshipId: relation.id,
    name: relation.name,
    identity: relation.identity,
    staff,
    text: staff
      ? `${relation.name}（${relation.identity}）在办公室关上门，沉默了很久才开口。TA 说知道这不合规矩，也知道可能会影响你，但还是想认真问你一次：愿不愿意和 TA 在一起。`
      : `${relation.name}约你在操场看台见面，手里攥着一杯已经不太冰的奶茶。绕了三圈以后，TA 终于停下来，说：“我好像不只是想和你做朋友。”`,
  }
}

function createBreakupEvent(relation: Relationship): PendingEvent {
  return {
    id: 'ev-breakup',
    kind: 'romance',
    title: '分手',
    text: `${relation.name}约你在操场见面，说最近总觉得你们之间少了点什么。TA 没有吵架，也没有责怪你，只是很轻地说：“我们先到这里吧。”你看着跑道尽头，突然不知道该把手里那杯奶茶放哪里。`,
    effects: { breakupRelationId: relation.id, stress: 3 },
    effectLines: [`与 ${relation.name} 分手`, '压力 +3'],
  }
}

function createTeacherScandalEvent(state: GameState): PendingEvent {
  const names = state.relationships
    .filter((relation) => relation.partner && isStaffRelation(relation))
    .map((relation) => relation.name)
  return {
    id: 'ev-teacher-scandal',
    kind: 'romance',
    title: '匿名信',
    text: `教务处收到一封匿名信，说你和${names.length > 0 ? names.join('、') : '某位老师'}走得太近。调查组找你谈话时语气很客气，但每一句都像在问病史。事情很快传开，你失去了那段关系，也第一次知道“公序良俗”四个字有多重。`,
    effects: { teacherBreak: true, socialAttr: -2, stress: 8 },
    effectLines: ['师生关系破裂', '交际 -2', '压力 +8'],
  }
}

export interface RelationshipWeeklyResult {
  state: GameState
  pendingEvent: PendingEvent | null
  pendingConfession: PendingConfession | null
}

export function rollRelationshipWeekly(state: GameState): RelationshipWeeklyResult {
  if (!state.player) {
    return { state, pendingEvent: null, pendingConfession: null }
  }
  let next: GameState = { ...state }
  let relationships = [...state.relationships]

  // 1. 师生恋被发现风险
  const staffPartners = relationships.filter(
    (relation) => relation.partner && isStaffRelation(relation),
  )
  if (staffPartners.length > 0) {
    const risk = Math.min(90, (state.teacherScandalRisk ?? 0) + 8)
    next = { ...next, teacherScandalRisk: risk }
    if (Math.random() < risk / 100) {
      return {
        state: next,
        pendingEvent: createTeacherScandalEvent(next),
        pendingConfession: null,
      }
    }
  } else if ((state.teacherScandalRisk ?? 0) !== 0) {
    next = { ...next, teacherScandalRisk: 0 }
  }

  // 2. 多线恋爱修罗场
  const partners = relationships.filter((relation) => relation.partner)
  if (partners.length >= 2) {
    const risk = Math.min(
      95,
      (state.romanceRisk ?? 0) + 8 + (partners.length - 2) * 4,
    )
    next = { ...next, romanceRisk: risk }
    if (Math.random() < risk / 100) {
      const names = partners.map((relation) => relation.name).join('、')
      const event: PendingEvent = {
        id: 'ev-romance-discovery',
        kind: 'romance',
        title: '修罗场',
        text: `你的手机在同一时间弹出了几条消息。${names}分别问你现在在哪，随后她们/他们发现彼此认识的是同一个你。宿舍楼下、食堂门口和图书馆门口同时上演了不同版本的质问，你站在中间，第一次觉得“同时处理多份病史”是一件如此困难的事。所有恋爱关系当场破裂，你的交际名声也一落千丈。`,
        effects: { socialAttr: -3, romanceBreak: true },
        effectLines: ['交际 -3', '压力 +10', '所有恋爱关系破裂'],
      }
      return { state: next, pendingEvent: event, pendingConfession: null }
    }
  } else if ((state.romanceRisk ?? 0) !== 0) {
    next = { ...next, romanceRisk: 0 }
  }

  // 3. 低亲密度分手风险
  relationships = relationships.map((relation) => {
    if (!relation.partner) return relation
    if (relation.intimacy >= 60) return { ...relation, breakupRisk: 0 }
    const rate = Math.min(
      48,
      Math.max(2, Math.round((60 - relation.intimacy) * 0.8)),
    )
    return {
      ...relation,
      breakupRisk: Math.min(95, (relation.breakupRisk ?? 0) + rate),
    }
  })
  next = { ...next, relationships }
  const breakupTarget = relationships
    .filter(
      (relation) =>
        relation.partner &&
        relation.intimacy < 60 &&
        Math.random() < (relation.breakupRisk ?? 0) / 100,
    )
    .sort((a, b) => (b.breakupRisk ?? 0) - (a.breakupRisk ?? 0))[0]
  if (breakupTarget) {
    return {
      state: next,
      pendingEvent: createBreakupEvent(breakupTarget),
      pendingConfession: null,
    }
  }

  // 4. 虚拟角色主动表白
  const confessionTargets = relationships
    .filter(
      (relation) =>
        !relation.partner &&
        relation.intimacy >= 60 &&
        playerAllowsGender(state.player!, relation.gender) &&
        npcOrientationAllows(relation, state.player!.gender),
    )
    .map((relation) => {
      const staff = isStaffRelation(relation)
      const baseRate = Math.max(1, Math.round((relation.intimacy - 55) * 0.35))
      const rate = staff ? Math.max(1, Math.round(baseRate * 0.15)) : baseRate
      return {
        relation,
        risk: Math.min(95, (relation.confessionRisk ?? 0) + rate),
      }
    })
  const confessed = confessionTargets.find(
    (item) => Math.random() < item.risk / 100,
  )
  if (confessed) {
    relationships = relationships.map((relation) =>
      relation.id === confessed.relation.id
        ? { ...relation, confessionRisk: confessed.risk }
        : relation,
    )
    next = { ...next, relationships }
    return {
      state: next,
      pendingEvent: null,
      pendingConfession: createNpcConfession(confessed.relation),
    }
  }
  const riskById = new Map(
    confessionTargets.map((item) => [item.relation.id, item.risk]),
  )
  relationships = relationships.map((relation) =>
    riskById.has(relation.id)
      ? { ...relation, confessionRisk: riskById.get(relation.id) ?? 0 }
      : relation,
  )
  next = { ...next, relationships, pendingConfession: null }
  return { state: next, pendingEvent: null, pendingConfession: null }
}

export function eventKindLabel(kind: PendingEvent['kind']): string {
  return KIND_LABEL[kind]
}
