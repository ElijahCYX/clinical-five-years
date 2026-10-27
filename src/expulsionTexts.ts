export interface ExpulsionText {
  eyebrow: string
  text: string
}

export const EXPULSION_TEXTS: ExpulsionText[] = [
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '教务处把通知推到你的手机上时，你正在宿舍收拾书包。红色标题很短，只有“学业预警处理结果”几个字。走廊里有人在笑，有人拖着行李箱，你突然意识到，这个学期不会再有一个周一等你。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '你最后一次走进那间教室，是去办离校手续。黑板上还留着上节课的板书，粉笔灰落在窗台上。你没有坐下，也没有和谁告别。门在身后合上时，你听见自己的脚步声，比任何一次迟到都清楚。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '辅导员把成绩单摊在桌上，没有批评你，只问了一句：“你最近是不是遇到什么事了？”你张了张嘴，发现所有解释都像借口。窗外的树影移过桌面，那张纸上的数字却一直停在原处。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '退学手续办完的那天，天气很好。你从行政楼出来，看到新生在广场上拍合照，白大褂被风吹得鼓起来。你想起自己入学时也站在那个位置，摄影师喊了三、二、一，你笑得很用力。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '你把这学期的课本摞在一起，发现好几本连塑封都没拆。室友问你以后怎么办，你说先回家，再想想。其实你知道，问题不是“以后”，而是那些被你一次次推到明天的时间，终于一起回来了。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '图书馆的门禁记录停在开学第二周。管理员不认识你，系统却记得你。退学通知上写着“累计未通过学分超过规定”，你盯着那行字，第一次发现数字也可以有重量。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '你删掉了课表，又把它恢复，最后还是没有点开。宿舍群里开始讨论下学期的选修，你看着那些熟悉的名字，像隔着一层很厚的玻璃。你知道自己已经不在那个未来里了。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '母亲在电话里沉默了很久，最后只说：“回来吧，先吃饭。”你突然想起开学那天她帮你铺床单，反复叮嘱你要好好上课。你没有告诉她，你已经很久没有去教室了。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '学院给出的理由是“学业成绩未达到学校要求”。你签字的时候手很稳，甚至比握笔答题时还稳。走出办公室，你才发现自己不知道该往哪边拐：一边是宿舍，一边是校门。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '退学之后，你偶尔还会梦见那间阶梯教室。老师在上面讲，你在最后一排坐着，时间怎么都走不完。醒来时你盯着天花板，觉得这个梦比现实仁慈：至少梦里，你还可以去上一节课。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '你把学生证放在桌上，照片里的自己比现在精神很多。五年制医学本科，曾经像一条很长的走廊，现在却提前到了尽头。走廊尽头没有掌声，只有一扇写着“教务处”的门。',
  },
  {
    eyebrow: 'ACADEMIC DISMISSAL / 学业终止',
    text: '最后的班会上，大家讨论实习分配。没有人提起你的名字。你坐在靠窗的位置，听见走廊里推车经过的声音，忽然明白：被退学不是某一天突然发生的，它只是把之前每一个没有去上的课、没有翻开书，一次性结算了。',
  },
]

export function pickExpulsionText(): ExpulsionText {
  return EXPULSION_TEXTS[Math.floor(Math.random() * EXPULSION_TEXTS.length)]
}
