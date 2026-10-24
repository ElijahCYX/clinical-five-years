/**
 * 中文姓名库：共 1000 个，长度 2–4 个汉字。
 * 由单姓/复姓与一字/二字名组合去重后定量截取，保证唯一。
 */

const SINGLE_SURNAMES = [
  '赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈',
  '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '尤', '许',
  '何', '吕', '施', '张', '孔', '曹', '严', '华', '金', '魏',
  '陶', '姜', '戚', '谢', '邹', '喻', '柏', '水', '窦', '章',
  '云', '苏', '潘', '葛', '范', '彭', '郎', '鲁', '韦', '昌',
]

const COMPOUND_SURNAMES = [
  '欧阳', '司马', '上官', '诸葛', '东方',
  '慕容', '尉迟', '长孙', '皇甫', '端木',
]

const GIVEN_ONE = [
  '嘉', '宁', '悦', '晨', '涵', '宇', '彤', '琪', '睿', '欣',
  '然', '安', '若', '思', '雨', '梓', '子', '明', '泽', '佳',
  '文', '可', '心', '亦', '天', '乐', '清', '知', '远', '星',
  '沐', '景', '书', '语', '梦', '初', '云', '舒', '青', '和',
]

const GIVEN_TWO = [
  '雨桐', '子涵', '思远', '嘉宁', '若曦', '晨阳', '语嫣', '明轩', '书瑶', '安然',
  '一诺', '清和', '知夏', '沐辰', '景行', '思齐', '望舒', '云舒', '星河', '若溪',
  '语桐', '念安', '亦辰', '嘉懿', '子墨', '晚晴', '听澜', '初晴', '予安', '知微',
  '南星', '北柠', '时雨', '见山', '逢春', '青禾', '临川', '照野', '映雪', '听白',
]

function buildNameLibrary(): string[] {
  const twoChar: string[] = []
  const threeChar: string[] = []
  const fourChar: string[] = []
  const seen = new Set<string>()

  for (const surname of SINGLE_SURNAMES) {
    for (const given of GIVEN_ONE) {
      if (twoChar.length >= 250) break
      const name = surname + given
      if (!seen.has(name)) {
        seen.add(name)
        twoChar.push(name)
      }
    }
    if (twoChar.length >= 250) break
  }

  outer: for (const given of GIVEN_TWO) {
    for (const surname of SINGLE_SURNAMES) {
      if (threeChar.length >= 500) break outer
      const name = surname + given
      if (!seen.has(name)) {
        seen.add(name)
        threeChar.push(name)
      }
    }
  }
  outerCompound: for (const given of GIVEN_ONE) {
    for (const surname of COMPOUND_SURNAMES) {
      if (threeChar.length >= 500) break outerCompound
      const name = surname + given
      if (!seen.has(name)) {
        seen.add(name)
        threeChar.push(name)
      }
    }
  }

  outerFour: for (const given of GIVEN_TWO) {
    for (const surname of COMPOUND_SURNAMES) {
      if (fourChar.length >= 250) break outerFour
      const name = surname + given
      if (!seen.has(name)) {
        seen.add(name)
        fourChar.push(name)
      }
    }
  }

  return [...twoChar, ...threeChar, ...fourChar]
}

export const NAME_LIBRARY = buildNameLibrary()

export function randomCharacterName(): string {
  return NAME_LIBRARY[Math.floor(Math.random() * NAME_LIBRARY.length)]
}
