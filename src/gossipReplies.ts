/**
 * 玩家听完八卦后的回复库。
 * 共 30 条：15 条用于对方真的说了八卦，15 条用于对方拒绝或没有情报。
 */
const TOLD_REPLIES = [
  '原来如此，我记下了。',
  '行，谢谢你告诉我。',
  '我不会到处说的。',
  '这消息有点意外啊。',
  '嗯……让我消化一下。',
  '你确定吗？',
  '好，我知道了。',
  '谢谢，你有心了。',
  '这种事你怎么知道的？',
  '我就说他们最近怪怪的。',
  '明白了，我先当作没听见。',
  '你嘴巴还挺严的嘛。',
  '这八卦我收下了。',
  '有点意思，回头我留意一下。',
  '我保证不把你供出去。',
]

const REFUSED_REPLIES = [
  '没关系，不说也没事。',
  '好吧，我不逼你。',
  '那我自己再观察观察。',
  '知道了，谢谢你愿意提一句。',
  '算了，不知道反而轻松。',
  '好，就聊到这儿吧。',
  '你提醒得对。',
  '我先不掺和这件事。',
  '嗯，心里有数了。',
  '听起来比我想的复杂。',
  '行，就当今天没问过。',
  '谢谢，至少我知道该注意什么了。',
  '好，换个话题吧。',
  '没事，我也就是随口一问。',
  '懂了，不追问了。',
]

export const PLAYER_GOSSIP_REPLIES = [...TOLD_REPLIES, ...REFUSED_REPLIES]

export function pickGossipReply(told: boolean): string {
  const pool = told ? TOLD_REPLIES : REFUSED_REPLIES
  return pool[Math.floor(Math.random() * pool.length)]
}
