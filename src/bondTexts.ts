import type { BondType } from './types'

export const BOND_BREAK_CONFIRM: Record<BondType, string> = {
  lover:
    '你想了很久，还是决定把这段关系停下来。不是某一次争吵，也不是某一句说错的话，而是你开始意识到，你们想要的未来已经不在同一个方向。你知道这句话说出口会伤人，但继续拖下去，只会让两个人都更累。你准备把 TA 约出来，认真谈一次。',
  brother:
    '你不想再用“兄弟”两个字把一些问题盖过去。你们一起熬过夜、扛过事，也正因为这样，你更清楚有些分歧已经不能再装作没看见。你决定把话说开：不是不认这段情谊，而是暂时不再用兄弟的名义绑住彼此。',
  sister:
    '你反复删改了几次消息，最后还是决定当面说。你们分享过太多秘密，所以这次你不想用一句轻飘飘的“算了吧”结束。你想告诉 TA，你珍惜这段关系，但也需要把一些边界重新放回两个人之间。',
}

const BREAK_BASES: Record<BondType, string[]> = {
  lover: [
    'TA 听完后没有立刻说话，只是低头看着桌面。你说完最后一句，TA 才轻轻“嗯”了一声，像是终于确认这件事真的发生了。',
    'TA 的眼睛红了一点，但没有哭。TA 问你：“你想清楚了吗？”你点头。TA 把原本想伸过来的手收回去，放进外套口袋里。',
    'TA 沉默了很久，最后说：“好。”没有追问，也没有挽留。你们一起走了一段路，到岔路口时，TA 往另一边去了。',
    'TA 努力把语气放得很平静，可你还是听出了那点发抖。TA 说：“谢谢你至少愿意当面告诉我。”你一时不知道该怎么接。',
    'TA 笑了一下，那笑比不笑更让人难受。TA 说：“其实我最近也有这种感觉。”你们把最后的体面留给了彼此。',
  ],
  brother: [
    'TA 听完后把手里的饮料放下，半天没说话。最后 TA 说：“行，你既然这么想，那就这样吧。”语气不重，却比吵一架还生分。',
    'TA 点了点头，问你是不是早就想好了。你没有否认。TA 说：“兄弟归兄弟，但有些事确实不能一直糊弄。”',
    'TA 拍了拍你的肩，力道比平时轻。“以后见面别装不认识。”TA 说完就先走了，没有回头。',
    'TA 沉默了一会儿，忽然笑了一声：“行，阋墙就阋墙。”可那笑里没有多少玩笑的意思。',
    'TA 说：“我以为我们不至于走到这一步。”你没有解释。TA 低头把手机收起来，像是把这件事也一起收走了。',
  ],
  sister: [
    'TA 看着你，眼圈慢慢红了。“你确定吗？”TA 问。你说确定。TA 把脸转开，过了一会儿才说：“好，我知道了。”',
    'TA 没有哭，只是把你们合照的聊天背景换掉了。你看见那个变化时，TA 说：“这样对我们都好。”',
    'TA 安静地听你说完，然后把纸巾推到你面前，明明你才是提出来的人。TA 说：“那就先这样吧，别互相折磨。”',
    'TA 说：“我其实早就感觉到了。”声音很轻，像在说一件已经练习过很多遍的事。你忽然不知道该心疼谁。',
    'TA 抱了你一下，很快松开。“谢谢你没有让我最后一个知道。”说完 TA 转身走了，背影比平时慢。',
  ],
}

const BREAK_CLOSERS = [
  '你站在原地看了一会儿，才意识到自己已经把想说的话都说完了。',
  '回去的路上你们没有并肩，风把两个人的影子拉得很远。',
  '你打开手机，看见聊天框里还留着上次的晚安，突然不知道该不该删。',
  '这次没有人提高声音，可你知道，有些东西已经和以前不一样了。',
]

const RECONCILE_SUCCESS_BASES: Record<BondType, string[]> = {
  lover: [
    'TA 在电话那头沉默了几秒，然后说：“我也有话没说完。”你们约在第一次见面的地方，谁都没先提这几周的事。',
    'TA 问你：“这次还会走吗？”你没有立刻回答，而是伸手把 TA 被风吹乱的头发别到耳后。TA 没有躲。',
    'TA 说：“重新开始可以，但这次别什么都自己扛着。”你点头，发现原来承认自己想念一个人没有那么难。',
    'TA 把手机递给你看，备忘录里写满了这周想对你说的话，最后一条只写了三个字：“快回来。”',
    'TA 笑了一下，眼眶还是红的：“你来得有点晚。”你说对不起。TA 说：“那你以后别迟到了。”',
  ],
  brother: [
    'TA 把饮料推到你面前，像之前什么都没有发生过。“喝完这杯，这事翻篇。”你说好，杯子碰在一起。',
    'TA 说：“兄弟之间吵架可以，别真把门关上。”你拍了拍 TA 的肩，力道回到以前那样。',
    'TA 骂了你一句，语气却已经松了。你们坐在操场边看别人打球，谁也没再提那段别扭。',
    'TA 在群里发了一句“晚上老地方”，然后单独@你。下面有人问怎么了，TA 回：“没事，兄弟复合。”',
    'TA 说：“行，我也有不对。”你愣了一下，这是 TA 第一次先低头。你说：“那就算我们都没长大。”',
  ],
  sister: [
    'TA 抱住你的时候，你才发现自己一直在等这个拥抱。TA 说：“下次有事要先告诉我。”你说好。',
    'TA 把之前删掉的一半聊天记录找回来给你看：“你看，我其实也舍不得。”你们一起笑了出来。',
    'TA 说：“和好可以，但你要请我喝奶茶。”你说两杯。TA 说：“成交。”',
    'TA 在你们常坐的位置放了一杯热饮，杯身上写着你的名字。TA 假装没看见你，耳尖却先红了。',
    'TA 说：“我生气不是因为你要分开，是因为你一个人想了那么久。”你低头道歉，TA 叹了口气，拉你坐下。',
  ],
}

const RECONCILE_SUCCESS_CLOSERS = [
  '你们把之前没说完的话慢慢补上，气氛一点点回到熟悉的样子。',
  '这一次你们没有急着保证以后，只约好先把眼前这一周过好。',
  '走出门时你们的距离比进来时近了一点，没有人刻意提起这件事。',
  '你忽然发现，原来“复合”不是回到从前，而是重新决定再走一段。',
]

const RECONCILE_FAIL_BASES: Record<BondType, string[]> = {
  lover: [
    'TA 听完后摇了摇头。“我很感谢你还愿意来找我，”TA 说，“但我不想因为心软再重来一次。”',
    'TA 说：“我们之间的问题不是一句对不起就能解决的。”你知道 TA 说得对，却还是站在原地没动。',
    'TA 沉默了很久，最后说：“这次的答案还是不行。”你点头，没有再问第二次。',
    'TA 看着你，眼神里有一点难过：“如果复合只是因为我们都不习惯分开，那对谁都不好。”',
    'TA 说：“我们还是先别联系了。”这次没有争吵，也没有眼泪，比任何一次都安静。',
  ],
  brother: [
    'TA 说：“算了，别勉强。”你想再说点什么，TA 已经转身去接电话，像是把这件事放到了一边。',
    'TA 听完后没有骂你，也没有答应。TA 说：“我现在还没想好怎么继续当兄弟。”',
    'TA 说：“有些话说过一次就够了。”你明白 TA 不是在生气，只是不想再回到从前。',
    'TA 把饮料喝完，站起来：“回见吧。”没有说下次是什么时候。',
    'TA 说：“不是所有裂缝都能假装没看见。”你没有反驳，因为你也知道。',
  ],
  sister: [
    'TA 低头搅着杯子里的饮料，半天才说：“我还没有准备好。”你说理解，可声音有点哑。',
    'TA 说：“我没有怪你，但我也不想这么快当没事发生。”你点头，没再强求。',
    'TA 把所有客气的词都用上了：“谢谢你来，但我现在不需要。”你听懂了。',
    'TA 说：“我们的关系不是开关，不能说断就断、说开就开。”这句话让你沉默了很久。',
    'TA 把纸巾递给你，像以前一样，可这次 TA 先站起来：“我先走了，你慢慢回去。”',
  ],
}

const RECONCILE_FAIL_CLOSERS = [
  '你回到宿舍才反应过来，这可能是你们这段时间里最后一次认真说话。',
  '你删掉了输入框里又打的一长段话，最后只留下一个没有发出去的表情。',
  '你们没有互相拉黑，但聊天框安静得像一间没人住的房间。',
  '你告诉自己至少试过了，可这句话并没有让胸口轻多少。',
]

function buildPool(bases: string[], closers: string[]): string[] {
  return Array.from({ length: 20 }, (_, index) => {
    const base = bases[index % bases.length]
    const closer = closers[Math.floor(index / bases.length) % closers.length]
    return `${base} ${closer}`
  })
}

export const BOND_BREAK_REACTIONS: Record<BondType, string[]> = {
  lover: buildPool(BREAK_BASES.lover, BREAK_CLOSERS),
  brother: buildPool(BREAK_BASES.brother, BREAK_CLOSERS),
  sister: buildPool(BREAK_BASES.sister, BREAK_CLOSERS),
}

export const BOND_RECONCILE_SUCCESS_REACTIONS: Record<BondType, string[]> = {
  lover: buildPool(RECONCILE_SUCCESS_BASES.lover, RECONCILE_SUCCESS_CLOSERS),
  brother: buildPool(RECONCILE_SUCCESS_BASES.brother, RECONCILE_SUCCESS_CLOSERS),
  sister: buildPool(RECONCILE_SUCCESS_BASES.sister, RECONCILE_SUCCESS_CLOSERS),
}

export const BOND_RECONCILE_FAIL_REACTIONS: Record<BondType, string[]> = {
  lover: buildPool(RECONCILE_FAIL_BASES.lover, RECONCILE_FAIL_CLOSERS),
  brother: buildPool(RECONCILE_FAIL_BASES.brother, RECONCILE_FAIL_CLOSERS),
  sister: buildPool(RECONCILE_FAIL_BASES.sister, RECONCILE_FAIL_CLOSERS),
}

export function pickBondReaction(
  type: BondType,
  outcome: 'break' | 'success' | 'fail',
): string {
  const pool =
    outcome === 'break'
      ? BOND_BREAK_REACTIONS[type]
      : outcome === 'success'
        ? BOND_RECONCILE_SUCCESS_REACTIONS[type]
        : BOND_RECONCILE_FAIL_REACTIONS[type]
  return pool[Math.floor(Math.random() * pool.length)]
}
