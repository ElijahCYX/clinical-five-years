import type {
  ConsumptionDuration,
  ConsumptionEffects,
  ConsumptionEvent,
  ConsumptionInstallment,
} from './types'

const event = (
  id: string,
  title: string,
  text: string,
  cost: number,
  duration: ConsumptionDuration,
  effects: ConsumptionEffects,
  benefitLines: string[],
  installment?: ConsumptionInstallment,
): ConsumptionEvent => ({
  id: `cons-${id}`,
  kind: 'consumption',
  title,
  text,
  cost,
  duration,
  effects,
  benefitLines,
  installment,
})

export const CONSUMPTION_EVENTS: ConsumptionEvent[] = [
  event('phone', '新手机发布', '新手机发布，旧手机其实还能用，但导购说以旧换新今天最后一天。你站在柜台前，摸了摸口袋里那张生活费卡。', 5000, 'permanent', {}, ['永久：每天压力 -4', '永久：单独邀约成功率 +5%'], { weeks: 24, amount: 250 }),
  event('books', '辅导书全套', '书店老板把一摞厚厚的辅导书推到你面前：“同学，这套书今年押题很准。”你翻了翻目录，发现每一页都写着“重点”。', 120, 'semester', { prep: 5 }, ['本学期专业课程准备度 +5', '本学期考试复习行动压力 -5']),
  event('sale', '购物节大促销', '零点刚到，购物车里的东西齐刷刷变成红色价格。你明明只是想买一包纸巾，却发现自己已经凑满了满减。', 300, 'permanent', { energy: 10, stress: -20 }, ['精力 +10', '压力 -20']),
  event('cherry', '应季水果', '水果店门口摆出第一箱应季水果，红得过分。老板说今天刚到的，你尝了一颗，确实比食堂的苹果甜。', 50, 'permanent', { energy: 10, stress: -10, constitutionGrowth: 10 }, ['精力 +10', '体质成长 +10%', '压力 -10']),
  event('coffee', '宿舍咖啡机', '你刷到一个“宿舍咖啡自由”的视频，评论区都在说买了不亏。你算了算，每天一杯外卖咖啡好像确实更贵。', 600, 'permanent', {}, ['永久：每日行动中的喝咖啡不再花费生活费'], { weeks: 8, amount: 100 }),
  event('headphone', '降噪耳机', '图书馆里有人一直小声聊天，你戴上试听耳机的一瞬间，世界安静了。价格牌在灯光下有点刺眼。', 800, 'permanent', {}, ['永久：泡图书馆获得的课程准备度 +5%'], { weeks: 12, amount: 80 }),
  event('gym', '健身房年卡', '健身房销售拦住你，说今天办年卡送私教课。你看着自己久坐的腰，突然觉得这笔钱可能不是消费，是投资。', 500, 'year', {}, ['本学年：每周体质成长值 +5%'], { weeks: 12, amount: 50 }),
  event('massager', '颈椎按摩仪', '连续低头复习几天，你的脖子发出了一声不属于大学生的声音。电商首页适时推来一个颈椎按摩仪。', 200, 'year', {}, ['本学年：每天压力 -1']),
  event('delivery', '外卖年度会员', '外卖会员今天打折，配送费减免和红包叠在一起，看起来能省下一大笔。你点开结算页，发现先要付一笔会员费。', 88, 'year', {}, ['本学年：「高碳日！爱你老己」花费 -10']),
  event('concert', '演唱会门票', '你喜欢的歌手加场了。抢票页面转了三分钟，居然还有余票。你盯着价格，心跳比抢课时还快。', 500, 'permanent', { energy: 5, stress: -10 }, ['当天及接下来两天：精力 +5，压力 -10']),
  event('shoes', '限量球鞋', '限量球鞋补货，宿舍群里已经有人开始摇号。你低头看了看自己那双开了胶的运动鞋。', 1000, 'permanent', {}, ['永久：建模成长值 +50%', '永久：每天压力 -2'], { weeks: 24, amount: 50 }),
  event('skincare', '护肤套装', '换季之后脸上开始起皮，专柜姐给你试了一整套。镜子里的自己确实看起来精神了一点。', 400, 'year', {}, ['本学年：每天建模成长值 +1%', '本学年：每天压力 -1']),
  event('textbook', '教材全套', '二手教材群里有人出整套专业书，笔记做得很认真。你翻了翻，发现比新书便宜不少，但加起来还是一笔钱。', 200, 'semester', { prep: 5 }, ['本学期专业课程准备度 +5', '本学期考试准备度收益 +10%']),
  event('ereader', '电子阅读器', '你刷到一台二手电子阅读器，卖家说只用了三次。你想了想宿舍里那堆没地方放的书。', 600, 'permanent', {}, ['永久：每天压力 -2'], { weeks: 10, amount: 70 }),
  event('fridge', '宿舍小冰箱', '夏天到了，宿舍里的酸奶总是坏。你刷到一台迷你冰箱，评论区全是“宿舍神器”。', 400, 'permanent', {}, ['永久：每天压力 -5', '永久：每天精力 +5'], { weeks: 10, amount: 48 }),
  event('airfryer', '宿舍电煮锅', '食堂吃腻了，你刷到一口能煮一切的宿舍电煮锅。宿舍限电说明被你翻出来看了三遍，但视频里的面条实在太香。', 200, 'permanent', {}, ['永久：每天压力 -2']),
  event('laundry', '洗衣年卡', '洗衣房充值满减，年卡看起来能省下不少。你抱着攒了一周的衣服，在充值机前站了很久。', 300, 'year', {}, ['本学年：每天压力 -2']),
  event('movie', '电影购票优惠卡', '你喜欢的电影重映，场次只剩午夜。你刷到一张电影购票优惠卡，计算了一下，发现常去看确实划算。', 100, 'permanent', {}, ['永久：与羁绊对象单独邀约看电影的生活费 -20']),
  event('park', '网吧年卡', '室友约你开黑，说网吧年卡今天最后一天。你想起自己已经很久没有在晚上出门了。', 100, 'year', {}, ['本学年：与兄弟单独邀约去网吧不扣生活费']),
  event('breakfast', '早餐年卡', '食堂推出早餐年卡，豆浆包子随便搭。你算了算，如果每天都能起床，确实比单买便宜。', 200, 'year', {}, ['本学年：上午没睡懒觉时，当天下午精力 +5']),
  event('lamp', '护眼台灯', '宿舍的灯管闪了几天，你终于刷到一盏护眼台灯。评论区说“早买早享受”，你想了想熬夜的眼睛。', 150, 'permanent', {}, ['永久：每天压力 -1']),
  event('chair', '人体工学椅', '你坐在宿舍硬板凳上复习到腰疼，购物软件精准推送了一把人体工学椅。价格让你清醒了一下。', 600, 'permanent', {}, ['永久：每天压力 -3'], { weeks: 10, amount: 70 }),
  event('printer', '宿舍打印机', '打印店排队半小时，你突然想买一台二手打印机。以后资料、论文、讲义都能自己打。', 600, 'permanent', {}, ['永久：每天随机在修课程准备度 +1'], { weeks: 10, amount: 70 }),
  event('course', '网课会员', '你收藏的网课平台推出年度会员，名师课程全场免费。你看了看自己收藏夹里吃灰的课程。', 200, 'year', {}, ['本学年：每天随机在修课程准备度 +1']),
  event('band', '运动手环', '运动手环打折，能测心率、睡眠和步数。你想起自己上次运动还是体测。', 500, 'permanent', {}, ['永久：每周体质成长值 +5%'], { weeks: 12, amount: 50 }),
  event('camping', '露营装备', '宿舍群里有人组织露营，装备可以合买。你看着购物车里的帐篷和折叠椅，开始想象山里的风。', 500, 'permanent', {}, ['永久解锁「去露营」邀约事件'], { weeks: 12, amount: 50 }),
  event('mat', '宿舍哑铃', '你刷到一个“宿舍十分钟力量训练”的视频，评论区说只需要一对哑铃。哑铃不贵，但你得先把它从快递站搬回来。', 300, 'permanent', {}, ['永久：每周体质成长值 +4%']),
]

export function pickConsumptionEvent(
  excludeIds: string[] = [],
): ConsumptionEvent | null {
  const pool = CONSUMPTION_EVENTS.filter(
    (item) => !excludeIds.includes(item.id.replace(/^cons-/, '')),
  )
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
