export const OVERTIME_TEXTS: string[] = [
  '加班到 {time}。这么辛苦，收入一定很高吧？哦对，你是来学习的——没工资，还倒贴通勤费。',
  '你抬头看了一眼钟：{time}。别人加班有加班费，你加班有带教的一句“年轻人多学点”。',
  '你为科室贡献了一个晚上，科室为你贡献了一句“辛苦了”。这笔交易，怎么算都像你在做慈善。',
  '时钟走到 {time}，你还在写病历。工资条没有出现，但你的腰椎间盘很可能会出现。',
  '你以为自己在加班，其实是在参加一场付费上班的沉浸式体验。门票是通勤费和晚饭钱。',
  '到 {time} 了。你今天的收入是零，支出是晚饭、通勤和一点点青春。财务自由又远了一步。',
  '主任说“能者多劳”。你终于明白，能者的意思是“能白干的人”。',
  '你不是在工作，你是在用生活费购买临床经验。今天的课程时长：{time}。',
  '别人下班后去约会，你下班后去补病历。区别是约会至少有人回复，病历只会问你要下一份。',
  '加班到 {time}，你成了科室最晚走的人。可惜评优不按最后离开时间排名。',
]

export function pickOvertimeText(time: string): string {
  const text = OVERTIME_TEXTS[Math.floor(Math.random() * OVERTIME_TEXTS.length)] ?? OVERTIME_TEXTS[0]
  return text.replace('{time}', time)
}
