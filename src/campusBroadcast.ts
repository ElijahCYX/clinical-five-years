import type { GameState, NoticeItem } from './types'
import { gameDate } from './social'

// ---------- A 库：30 条天气播报 ----------

export const WEATHER_LINES = [
  '今天多云，太阳短暂露了个脸，又很快缩回云层后面。',
  '今天小雨，路面湿滑，从图书馆出来的人大多没带伞。',
  '今天晴，风不大，适合把被子抱到阳台晒一晒。',
  '今天阴，云层压得很低，教学楼里提前亮起了灯。',
  '今天降温，风从走廊尽头灌进来，穿薄外套的人开始后悔。',
  '今天回暖，梧桐树下已经有人换了短袖。',
  '今天有雾，早八的路上看不清远处的人，只能听见脚步声。',
  '今天午后有阵雨，操场上的积水映出一小块灰白的天空。',
  '今天晴转阴，傍晚的风带着一点凉意。',
  '今天大风，自行车棚里倒了一排车，没人承认是自己碰的。',
  '今天小雨转阴，空气里有一股潮湿的泥土味。',
  '今天晴，阳光把教室最后一排照得很暖，睡着的人比平时多。',
  '今天阴转小雨，晾在阳台的衣服又被忘在了外面。',
  '今天气温回升，食堂门口的冰柜前排起了短队。',
  '今天有雷阵雨，远处的天边亮了一下，教室里有人下意识抬头。',
  '今天多云转晴，傍晚的云被夕阳染成橘色。',
  '今天降温明显，校医院门口多了几个来看感冒的人。',
  '今天空气干燥，静电让每一次开门都像一次小型冒险。',
  '今天小雨，湖边的石凳空着，只有一只鸟停下来躲雨。',
  '今天晴，风把落叶吹到教学楼台阶上，保洁阿姨扫了两遍。',
  '今天阴天，适合待在自习室，不适合洗衣服。',
  '今天有雾，图书馆的玻璃幕墙看起来像一块没擦干净的镜子。',
  '今天傍晚有风，操场跑步的人比平时少了一半。',
  '今天晴间多云，紫外线不强，适合在校园里慢慢走一圈。',
  '今天阵雨，快递站门口的纸箱被临时挪到了屋檐下。',
  '今天气温偏低，早八教室里关窗的人比开窗的人多。',
  '今天晴，午后的食堂门口排起了买冰饮的长队。',
  '今天阴有小雨，校园广播的声音在雨里听起来有点远。',
  '今天风力较大，共享单车倒成一片，像一场小型多米诺。',
  '今天天气平稳，没有特别值得抱怨的地方，也没有特别值得高兴的地方。',
]

// ---------- B 库：300 条校园事件 ----------

const CAMPUS_PLACES = [
  '图书馆门口',
  '第一食堂',
  '医学楼大厅',
  '解剖楼走廊',
  '实验楼三层',
  '学生活动中心',
  '操场东侧',
  '湖边小路',
  '教学楼台阶',
  '校医院门口',
  '宿舍楼下',
  '快递站',
  '打印店',
  '咖啡店',
  '报告厅门口',
  '自习室',
  '篮球场',
  '网球场',
  '游泳馆入口',
  '社团活动室',
  '钟楼下面',
  '校园草坪',
  '书店门口',
  '便利店',
  '公交车站',
  '校门口',
  '纪念广场',
  '研究生公寓',
  '风雨操场',
  '绿化带小径',
]

const CAMPUS_HAPPENINGS = [
  '有人在发社团招新的传单，路过的学生接了一张又一张',
  '志愿者支起了义诊摊位，排队的人比预想中多',
  '一位新生举着地图在原地转了两圈，最后还是问了路人',
  '有人抱着一摞厚书从台阶上下来，最上面一本摇摇欲坠',
  '一只校园猫躺在路中间晒太阳，行人纷纷绕行',
  '几个学生蹲在地上调试音响，试音声一遍遍穿过走廊',
  '有人弹起吉他，围过来的听众比演奏者还紧张',
  '一场讲座的海报刚贴上墙，就被另一张活动海报盖住了一半',
  '雨突然落下来，没带伞的人一起躲进屋檐下',
  '一个社团在摆摊做手工体验，桌上很快堆满了半成品',
]

export const CAMPUS_EVENT_LINES = CAMPUS_PLACES.flatMap((place) =>
  CAMPUS_HAPPENINGS.map((happening) => `${place}${happening}。`),
)

// ---------- C 库：节日 / 校庆播报 ----------

interface HolidayDef {
  name: string
  month: number
  day: number
  line: string
  eveLine: string
}

const HOLIDAYS: HolidayDef[] = [
  {
    name: '元旦',
    month: 1,
    day: 1,
    line: '本周就是元旦假期。校园里还留着跨年的彩带，很多人把“新年第一天”过成了补觉第一天。',
    eveLine: '元旦快到了，校园里已经有人开始写新年计划，虽然往年那些计划通常只坚持到一月中旬。',
  },
  {
    name: '春节',
    month: 2,
    day: 17,
    line: '本周就是春节。宿舍楼比平时安静很多，留在学校的人会收到食堂特意准备的一份年夜饭。',
    eveLine: '春节快到了，校园里逐渐空下来，行李箱轮子的声音比上课铃还频繁。',
  },
  {
    name: '清明节',
    month: 4,
    day: 5,
    line: '本周就是清明。有人回家扫墓，有人留在学校，在春天的雨里走得很慢。',
    eveLine: '清明快到了，天气开始变得潮湿，校园里的花和雨一起落下来。',
  },
  {
    name: '劳动节',
    month: 5,
    day: 1,
    line: '本周就是劳动节。校园里有人计划出游，也有人决定把这几天全部用来补觉。',
    eveLine: '劳动节快到了，教室里已经有人偷偷查起了出行攻略。',
  },
  {
    name: '浙江大学校庆日',
    month: 5,
    day: 21,
    line: '5 月 21 日是浙江大学校庆日。校园里挂起了校旗，老校友陆续回来，在曾经上课的楼前拍照。',
    eveLine: '5 月 21 日校庆日快到了，校园里开始布置展板和横幅，空气里有一种要过节的热闹。',
  },
  {
    name: '端午节',
    month: 6,
    day: 19,
    line: '本周就是端午。食堂窗口排起了买粽子的队，甜粽和咸粽的争论又一次准时出现。',
    eveLine: '端午快到了，食堂已经提前挂出粽子口味的预告，甜咸之争正在酝酿。',
  },
  {
    name: '中秋节',
    month: 9,
    day: 25,
    line: '本周就是中秋。校园里有人提着月饼礼盒往宿舍走，也有人对着月亮给家里打电话。',
    eveLine: '中秋快到了，超市的月饼堆成了小山，宿舍群里开始讨论要不要一起赏月。',
  },
  {
    name: '国庆节',
    month: 10,
    day: 1,
    line: '本周就是国庆假期。校门口拖着行李箱的人排成一条线，校园会短暂地空下来。',
    eveLine: '国庆节快到了，校园里已经有人把行李箱从床底拖了出来。',
  },
]

const NEUTRAL_HOLIDAY_LINES = [
  '最近没有临近的法定节假日，校园按平常的节奏运转，考试和作业照常推进。',
  '这段时间没有节日安排，日子被课程、实验和自习切成一段一段。',
  '最近没有特别的节日，校园里最热闹的事情仍然是食堂的新菜和社团的例会。',
]

// 农历节日在游戏覆盖年份附近的公历日期，用于给 B 库广播配上更准确的时令提示。
const LUNAR_DATES: Record<string, Record<number, { month: number; day: number }>> = {
  春节: {
    2025: { month: 1, day: 29 },
    2026: { month: 2, day: 17 },
    2027: { month: 2, day: 6 },
    2028: { month: 1, day: 26 },
    2029: { month: 2, day: 13 },
    2030: { month: 2, day: 3 },
  },
  端午节: {
    2025: { month: 5, day: 31 },
    2026: { month: 6, day: 19 },
    2027: { month: 6, day: 9 },
    2028: { month: 5, day: 28 },
    2029: { month: 6, day: 16 },
    2030: { month: 6, day: 5 },
  },
  中秋节: {
    2025: { month: 10, day: 6 },
    2026: { month: 9, day: 25 },
    2027: { month: 9, day: 15 },
    2028: { month: 10, day: 3 },
    2029: { month: 9, day: 22 },
    2030: { month: 9, day: 12 },
  },
}

function holidayMonth(holiday: HolidayDef, year: number): number {
  const lunar = LUNAR_DATES[holiday.name]?.[year]
  return lunar?.month ?? holiday.month
}

export function getHolidayBroadcast(year: number, month: number): string {
  const current = HOLIDAYS.filter((holiday) => holidayMonth(holiday, year) === month)
  if (current.length > 0) {
    const zju = current.find((holiday) => holiday.name === '浙江大学校庆日')
    if (zju && current.some((holiday) => holiday.name === '劳动节')) {
      return '这个月既有劳动节，也迎来了 5 月 21 日浙江大学校庆日。校园里挂起了校旗，老校友陆续回来，在曾经上课的楼前拍照。'
    }
    return current[0].line
  }
  for (let offset = 1; offset <= 2; offset += 1) {
    const nextMonth = ((month - 1 + offset) % 12) + 1
    const upcoming = HOLIDAYS.filter(
      (holiday) => holidayMonth(holiday, year) === nextMonth,
    )
    if (upcoming.length > 0) return upcoming[0].eveLine
  }
  return NEUTRAL_HOLIDAY_LINES[year % NEUTRAL_HOLIDAY_LINES.length]
}

// ---------- 周播报 ----------

function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

export interface CampusBroadcast {
  weather: string
  campus: string
  holiday: string
}

export function getCampusBroadcast(state: GameState): CampusBroadcast {
  const { year, month } = gameDate(state)
  const seed = hashString(
    `${state.season.id}-${state.week}-${year}-${month}-${state.player?.name ?? ''}`,
  )
  const weather = WEATHER_LINES[seed % WEATHER_LINES.length]
  const campus =
    CAMPUS_EVENT_LINES[(seed * 7 + state.week) % CAMPUS_EVENT_LINES.length]
  const holiday = getHolidayBroadcast(year, month)
  return { weather, campus, holiday }
}

export function noticeTimeLabel(state: GameState): string {
  const { year, month } = gameDate(state)
  return `${year} 年 ${month} 月 · ${state.season.seasonLabel} 第 ${state.week} 周`
}

export function makeCampusNotice(
  state: GameState,
  title: string,
  text: string,
): NoticeItem {
  return {
    id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: noticeTimeLabel(state),
    title,
    text,
  }
}

export function pushCampusNotice(
  state: GameState,
  title: string,
  text: string,
): GameState {
  const notice = makeCampusNotice(state, title, text)
  return { ...state, noticeFeed: [notice, ...state.noticeFeed].slice(0, 60) }
}
