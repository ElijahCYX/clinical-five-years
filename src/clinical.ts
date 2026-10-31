import type {
  ClinicalActionMode,
  ClinicalCourseInfo,
  ClinicalDayState,
  ClinicalRotationResult,
  ClinicalSkillId,
  ClinicalSkillKind,
  ClinicalSkillLevel,
  ClinicalSkillRecord,
  ClinicalSkillState,
  ClinicalState,
  Course,
  GameState,
} from './types'

export const CLINICAL_SEASON_MIN = 13
export const CLINICAL_SEASON_MAX = 20

export function isClinicalSeason(index: number): boolean {
  return index >= CLINICAL_SEASON_MIN && index <= CLINICAL_SEASON_MAX
}

export interface ClinicalSkillDef {
  id: ClinicalSkillId
  name: string
  en: string
  kind: ClinicalSkillKind
  desc: string
}

export const CLINICAL_SKILLS: ClinicalSkillDef[] = [
  { id: 'interview', name: '问诊', en: 'INTERVIEW', kind: 'common', desc: '采集病史、归纳主诉与现病史。' },
  { id: 'communicationCommon', name: '医患沟通', en: 'COMMUNICATION', kind: 'common', desc: '日常沟通、签字告知与陪检沟通。' },
  { id: 'communicationMedium', name: '医患沟通', en: 'COMMUNICATION', kind: 'medium', desc: '知情同意、风险告知与复杂病情沟通。' },
  { id: 'physicalExam', name: '体格检查', en: 'EXAM', kind: 'medium', desc: '系统查体与重点查体。' },
  { id: 'record', name: '病历书写', en: 'RECORD', kind: 'common', desc: '入院记录、首程、病程与出院小结。' },
  { id: 'sterile', name: '无菌术', en: 'STERILE', kind: 'medium', desc: '洗手、穿脱无菌衣、铺无菌台。' },
  { id: 'dressing', name: '拆线换药', en: 'DRESSING', kind: 'common', desc: '换药、拆线、拔管与更换引流袋。' },
  { id: 'suture', name: '缝合', en: 'SUTURE', kind: 'medium', desc: '单纯间断缝合与打结。' },
  { id: 'ecg', name: '心电图', en: 'ECG', kind: 'common', desc: '拉图、识别常见心律失常。' },
  { id: 'urinary', name: '导尿', en: 'CATHETER', kind: 'medium', desc: '导尿术与无菌操作。' },
  { id: 'ngtube', name: '插胃管', en: 'NG TUBE', kind: 'difficult', desc: '胃管置入与位置确认。' },
  { id: 'thoracentesis', name: '胸腔穿刺', en: 'THORACENTESIS', kind: 'difficult', desc: '胸穿定位、进针与并发症观察。' },
  { id: 'abdominal', name: '腹腔穿刺', en: 'PARACENTESIS', kind: 'difficult', desc: '腹穿定位、放液与标本送检。' },
  { id: 'boneMarrow', name: '骨髓穿刺', en: 'BONE MARROW', kind: 'difficult', desc: '骨穿部位选择与涂片。' },
  { id: 'lumbar', name: '腰椎穿刺', en: 'LUMBAR', kind: 'difficult', desc: '腰穿体位、进针与脑脊液采集。' },
  { id: 'drain', name: '更换引流袋', en: 'DRAIN', kind: 'common', desc: '引流管护理、无菌更换与记录。' },
  { id: 'drainRemoval', name: '拔引流管', en: 'DRAIN REMOVAL', kind: 'common', desc: '评估引流量、拔管与伤口观察。' },
  { id: 'specimen', name: '留取标本', en: 'SPECIMEN', kind: 'common', desc: '咽拭子、鼻拭子、腹水或胸水标本留取。' },
]

export const CLINICAL_SKILL_BY_ID = Object.fromEntries(
  CLINICAL_SKILLS.map((skill) => [skill.id, skill]),
) as Record<ClinicalSkillId, ClinicalSkillDef>

export function skillName(id: ClinicalSkillId): string {
  return CLINICAL_SKILL_BY_ID[id]?.name ?? id
}

export function initialClinicalSkills(): Record<ClinicalSkillId, ClinicalSkillState> {
  return Object.fromEntries(
    CLINICAL_SKILLS.map((skill) => [
      skill.id,
      { level: 0, xp: 0, observes: 0, assists: 0, supervised: 0, independentUsed: false },
    ]),
  ) as Record<ClinicalSkillId, ClinicalSkillState>
}

export function skillLevelLabel(level: ClinicalSkillLevel): string {
  return ['未接触', '观摩学习', '带教监督下操作', '独立操作'][level] ?? '未接触'
}

const COURSE_DEPARTMENT: Record<string, { department: string; scheduleKey: string }> = {
  internalClerk: { department: '内科', scheduleKey: 'internal' },
  emergency: { department: '急诊医学科', scheduleKey: 'emergency' },
  surgeryClerk: { department: '外科', scheduleKey: 'surgery' },
  dermatology: { department: '皮肤性病科', scheduleKey: 'generic' },
  obgynClerk: { department: '妇产科', scheduleKey: 'obgyn' },
  pediatricsClerk: { department: '儿科', scheduleKey: 'pediatrics' },
  generalPractice: { department: '全科医学科', scheduleKey: 'generic' },
  psychiatry: { department: '精神卫生科', scheduleKey: 'generic' },
  surgeryIntern: { department: '外科', scheduleKey: 'surgery' },
  ophthalmology: { department: '眼科', scheduleKey: 'generic' },
  internalIntern: { department: '内科', scheduleKey: 'internal' },
  communication: { department: '医患沟通教研室', scheduleKey: 'generic' },
  obgynIntern: { department: '妇产科', scheduleKey: 'obgyn' },
  pedsIntern: { department: '儿科', scheduleKey: 'pediatrics' },
  community: { department: '社区实习基地', scheduleKey: 'generic' },
  rehab: { department: '老年医学科', scheduleKey: 'generic' },
}

export function clinicalCourseInfo(course: Course): ClinicalCourseInfo {
  const mapped = COURSE_DEPARTMENT[course.id]
  return {
    courseId: course.id,
    name: course.name,
    credits: course.credits,
    clinicalDays: Math.max(1, course.credits - 1),
    scheduleKey: mapped?.scheduleKey ?? 'generic',
    department: mapped?.department ?? (course.name.replace(/见习|实习/g, '') || '临床科室'),
  }
}

export interface ClinicalBlock {
  id: string
  start: number
  end: number
  title: string
  kind: 'routine' | 'fixed' | 'free'
  fixedTitle?: string
}

const SCHEDULES: Record<string, ClinicalBlock[]> = {
  internal: [
    { id: 'commute', start: 0, end: 40, title: '上班通勤中', kind: 'routine' },
    { id: 'prep', start: 40, end: 60, title: '到院更衣，准备查房资料', kind: 'routine' },
    { id: 'preround', start: 60, end: 120, title: '电脑预查房', kind: 'fixed', fixedTitle: '该去电脑预查房了' },
    { id: 'round', start: 120, end: 180, title: '正式查房', kind: 'fixed', fixedTitle: '该去正式查房了' },
    { id: 'lecture', start: 180, end: 240, title: '带教小讲课', kind: 'fixed', fixedTitle: '该去带教小讲课了' },
    { id: 'free1', start: 240, end: 300, title: '病房机动，处理临时事情', kind: 'free' },
    { id: 'lunch', start: 300, end: 390, title: '午饭与午休', kind: 'free' },
    { id: 'free2', start: 390, end: 420, title: '午间机动', kind: 'free' },
    { id: 'skills', start: 420, end: 480, title: '操作实践课', kind: 'fixed', fixedTitle: '该去操作实践课了' },
    { id: 'wrap', start: 480, end: 600, title: '写病历、收尾、等下班', kind: 'free' },
  ],
  surgery: [
    { id: 'commute', start: 0, end: 40, title: '上班通勤中', kind: 'routine' },
    { id: 'prep', start: 40, end: 60, title: '到院更衣，准备交班', kind: 'routine' },
    { id: 'round', start: 60, end: 90, title: '外科查房', kind: 'fixed', fixedTitle: '该去外科查房了' },
    { id: 'free1', start: 90, end: 180, title: '跟组换药、术前准备', kind: 'free' },
    { id: 'lecture', start: 180, end: 240, title: '带教小讲课', kind: 'fixed', fixedTitle: '该去带教小讲课了' },
    { id: 'free2', start: 240, end: 300, title: '病房机动', kind: 'free' },
    { id: 'lunch', start: 300, end: 390, title: '午饭与午休', kind: 'free' },
    { id: 'free3', start: 390, end: 420, title: '午间机动', kind: 'free' },
    { id: 'skills', start: 420, end: 480, title: '操作实践 / 手术室观摩', kind: 'fixed', fixedTitle: '该去操作实践 / 手术室观摩了' },
    { id: 'wrap', start: 480, end: 600, title: '写病历、收尾、等下班', kind: 'free' },
  ],
  obgyn: [
    { id: 'commute', start: 0, end: 40, title: '上班通勤中', kind: 'routine' },
    { id: 'prep', start: 40, end: 60, title: '到院更衣，准备交班', kind: 'routine' },
    { id: 'round', start: 60, end: 120, title: '妇产科查房', kind: 'fixed', fixedTitle: '该去妇产科查房了' },
    { id: 'lecture', start: 120, end: 180, title: '带教小讲课', kind: 'fixed', fixedTitle: '该去带教小讲课了' },
    { id: 'free1', start: 180, end: 300, title: '病房机动，处理临时事情', kind: 'free' },
    { id: 'lunch', start: 300, end: 390, title: '午饭与午休', kind: 'free' },
    { id: 'free2', start: 390, end: 420, title: '午间机动', kind: 'free' },
    { id: 'skills', start: 420, end: 480, title: '操作实践课', kind: 'fixed', fixedTitle: '该去操作实践课了' },
    { id: 'wrap', start: 480, end: 600, title: '写病历、收尾、等下班', kind: 'free' },
  ],
  pediatrics: [
    { id: 'commute', start: 0, end: 40, title: '上班通勤中', kind: 'routine' },
    { id: 'prep', start: 40, end: 60, title: '到院更衣，准备交班', kind: 'routine' },
    { id: 'round', start: 60, end: 120, title: '儿科查房', kind: 'fixed', fixedTitle: '该去儿科查房了' },
    { id: 'lecture', start: 120, end: 180, title: '带教小讲课', kind: 'fixed', fixedTitle: '该去带教小讲课了' },
    { id: 'free1', start: 180, end: 300, title: '病房机动，处理临时事情', kind: 'free' },
    { id: 'lunch', start: 300, end: 390, title: '午饭与午休', kind: 'free' },
    { id: 'free2', start: 390, end: 420, title: '午间机动', kind: 'free' },
    { id: 'skills', start: 420, end: 480, title: '操作实践课', kind: 'fixed', fixedTitle: '该去操作实践课了' },
    { id: 'wrap', start: 480, end: 600, title: '写病历、收尾、等下班', kind: 'free' },
  ],
  emergency: [
    { id: 'commute', start: 0, end: 40, title: '上班通勤中', kind: 'routine' },
    { id: 'prep', start: 40, end: 60, title: '到院更衣，准备交班', kind: 'routine' },
    { id: 'round', start: 60, end: 120, title: '急诊早交班与查房', kind: 'fixed', fixedTitle: '该去急诊早交班了' },
    { id: 'free1', start: 120, end: 240, title: '急诊机动，处理病人', kind: 'free' },
    { id: 'lunch', start: 240, end: 330, title: '午饭与午休', kind: 'free' },
    { id: 'lecture', start: 330, end: 390, title: '带教小讲课', kind: 'fixed', fixedTitle: '该去带教小讲课了' },
    { id: 'free2', start: 390, end: 420, title: '午间机动', kind: 'free' },
    { id: 'skills', start: 420, end: 480, title: '操作实践课', kind: 'fixed', fixedTitle: '该去操作实践课了' },
    { id: 'wrap', start: 480, end: 600, title: '写病历、收尾、等下班', kind: 'free' },
  ],
  generic: [
    { id: 'commute', start: 0, end: 40, title: '上班通勤中', kind: 'routine' },
    { id: 'prep', start: 40, end: 60, title: '到院更衣，准备交班', kind: 'routine' },
    { id: 'round', start: 60, end: 120, title: '科室查房', kind: 'fixed', fixedTitle: '该去科室查房了' },
    { id: 'lecture', start: 120, end: 180, title: '带教小讲课', kind: 'fixed', fixedTitle: '该去带教小讲课了' },
    { id: 'free1', start: 180, end: 300, title: '科室机动，处理临时事情', kind: 'free' },
    { id: 'lunch', start: 300, end: 390, title: '午饭与午休', kind: 'free' },
    { id: 'free2', start: 390, end: 420, title: '午间机动', kind: 'free' },
    { id: 'skills', start: 420, end: 480, title: '操作实践课', kind: 'fixed', fixedTitle: '该去操作实践课了' },
    { id: 'wrap', start: 480, end: 600, title: '写病历、收尾、等下班', kind: 'free' },
  ],
}

export function scheduleFor(course: ClinicalCourseInfo): ClinicalBlock[] {
  return SCHEDULES[course.scheduleKey] ?? SCHEDULES.generic
}

export function blockAt(course: ClinicalCourseInfo, clock: number): ClinicalBlock | null {
  const minutes = Math.max(0, Math.min(599, clock))
  return scheduleFor(course).find((block) => minutes >= block.start && minutes < block.end) ?? null
}

export function fixedBlockAt(course: ClinicalCourseInfo, clock: number): ClinicalBlock | null {
  const block = blockAt(course, clock)
  return block?.kind === 'fixed' ? block : null
}

export interface ClinicalTaskChoice {
  id: string
  label: string
  timeBonus: number
  stress: number
  skillBonus: number
  mode?: ClinicalActionMode
  recommended?: boolean
  disabled?: boolean
}

export interface ClinicalTaskDef {
  id: string
  title: string
  description: string
  duration: number
  skillId: ClinicalSkillId
  kind: ClinicalSkillKind
  departments: string[]
  choices: ClinicalTaskChoice[]
  onlyIndependent?: boolean
}

const STANDARD_CHOICE: ClinicalTaskChoice = {
  id: 'standard',
  label: '按标准流程做',
  timeBonus: 0,
  stress: 0,
  skillBonus: 4,
}

export const CLINICAL_TASKS: ClinicalTaskDef[] = [
  {
    id: 'ecg',
    title: '给新来的患者拉心电图',
    description: '组里老师把心电图机推给你：“会拉吧？拉完把图拿给我看。”',
    duration: 15,
    skillId: 'ecg',
    kind: 'common',
    departments: ['内科', '急诊医学科', '外科', '妇产科', '儿科', '老年医学科'],
    choices: [STANDARD_CHOICE, { id: 'quick', label: '赶时间，快速拉完', timeBonus: -5, stress: 2, skillBonus: 1 }, { id: 'explain', label: '先和患者解释再操作', timeBonus: 5, stress: -1, skillBonus: 3 }],
  },
  {
    id: 'admission',
    title: '新病人入院：问病史、写入院病历和首程',
    description: '护士站说 12 床新收了一个病人。带教让你去问病史，回来后把入院病历和首程写出来。',
    duration: 40,
    skillId: 'interview',
    kind: 'common',
    departments: ['内科', '外科', '妇产科', '儿科', '急诊医学科', '精神卫生科', '老年医学科'],
    choices: [STANDARD_CHOICE, { id: 'focused', label: '只问主诉和现病史，先写首程', timeBonus: -10, stress: 2, skillBonus: 2 }, { id: 'full', label: '完整问诊并做重点查体', timeBonus: 15, stress: 1, skillBonus: 5 }],
  },
  {
    id: 'consent',
    title: '给准备手术的患者签知情同意书',
    description: '患者明天手术，带教把知情同意书交给你，让你先去和患者及家属谈。',
    duration: 20,
    skillId: 'communicationMedium',
    kind: 'common',
    departments: ['外科', '妇产科', '眼科'],
    choices: [STANDARD_CHOICE, { id: 'fast', label: '按模板逐条念完', timeBonus: -5, stress: 1, skillBonus: 1 }, { id: 'family', label: '先听家属的顾虑再解释', timeBonus: 10, stress: 1, skillBonus: 4 }],
  },
  {
    id: 'dressing',
    title: '给 XX 床患者拆线换药',
    description: '术后第 5 天，带教让你去换药并评估切口。',
    duration: 20,
    skillId: 'dressing',
    kind: 'common',
    departments: ['外科', '妇产科', '骨科', '皮肤性病科'],
    choices: [STANDARD_CHOICE, { id: 'quick', label: '快速换完，赶下一台', timeBonus: -8, stress: 2, skillBonus: 1 }, { id: 'observe', label: '仔细看切口并记录', timeBonus: 8, stress: 0, skillBonus: 5 }],
  },
  {
    id: 'accompany',
    title: '陪 XX 床患者去做检查',
    description: '患者行动不便，家属还没到。带教让你陪去影像科。',
    duration: 30,
    skillId: 'communicationCommon',
    kind: 'common',
    departments: ['内科', '外科', '妇产科', '儿科', '老年医学科'],
    choices: [STANDARD_CHOICE, { id: 'ask', label: '路上顺便问一下症状变化', timeBonus: 5, stress: 0, skillBonus: 4 }, { id: 'wait', label: '送到就回来', timeBonus: -10, stress: 0, skillBonus: 1 }],
    onlyIndependent: true
  },
  {
    id: 'authorization',
    title: '找患者签授权委托书、自费同意书和连续用药表',
    description: '护士站催这三份文书，带教让你去病房找患者和家属签。',
    duration: 25,
    skillId: 'communicationCommon',
    kind: 'common',
    departments: ['内科', '外科', '妇产科', '儿科', '眼科', '老年医学科'],
    choices: [STANDARD_CHOICE, { id: 'check', label: '逐项核对身份和签字关系', timeBonus: 5, stress: 0, skillBonus: 4 }, { id: 'rush', label: '先让家属签，之后再补', timeBonus: -10, stress: 2, skillBonus: 0 }],
    onlyIndependent: true
  },
  {
    id: 'chartAudit',
    title: '帮组里老师做待归档病人的病历查缺补漏',
    description: '一批病历要归档，带教让你把缺项、签名和检查报告补齐。',
    duration: 30,
    skillId: 'record',
    kind: 'common',
    departments: ['内科', '外科', '妇产科', '儿科', '急诊医学科', '眼科', '老年医学科'],
    choices: [STANDARD_CHOICE, { id: 'detail', label: '逐页核对，列缺项清单', timeBonus: 10, stress: 1, skillBonus: 5 }, { id: 'quick', label: '先补最明显的几项', timeBonus: -10, stress: 0, skillBonus: 2 }],
  },
  {
    id: 'dayPatientRecord',
    title: '帮组里老师写日间病人病历',
    description: '日间病房收了一批病人，带教让你先写病历。',
    duration: 30,
    skillId: 'record',
    kind: 'common',
    departments: ['内科', '外科', '妇产科', '眼科', '皮肤性病科'],
    choices: [STANDARD_CHOICE, { id: 'template', label: '按模板快速写', timeBonus: -5, stress: 1, skillBonus: 3 }, { id: 'verify', label: '核对检查结果再写', timeBonus: 5, stress: 1, skillBonus: 5 }],
  },
  {
    id: 'thoracentesis',
    title: '跟带教做一例胸腔穿刺',
    description: '带教问你：“之前看过胸穿吗？今天你来做助手。”',
    duration: 35,
    skillId: 'thoracentesis',
    kind: 'difficult',
    departments: ['内科', '急诊医学科', '呼吸内科'],
    choices: [STANDARD_CHOICE, { id: 'assist', label: '先当助手，认真看定位和进针', timeBonus: 0, stress: 1, skillBonus: 4 }, { id: 'hands', label: '主动要求试着进针', timeBonus: 10, stress: 2, skillBonus: 7 }],
  },
  {
    id: 'abdominal',
    title: '跟带教做一例腹腔穿刺',
    description: '患者腹水明显，带教准备放腹水，让你在旁边帮忙。',
    duration: 35,
    skillId: 'abdominal',
    kind: 'difficult',
    departments: ['内科', '急诊医学科', '外科'],
    choices: [STANDARD_CHOICE, { id: 'assist', label: '先当助手，熟悉穿刺包', timeBonus: 0, stress: 1, skillBonus: 4 }, { id: 'hands', label: '主动要求负责消毒铺巾', timeBonus: 8, stress: 2, skillBonus: 6 }],
  },
  {
    id: 'boneMarrow',
    title: '跟组里老师做骨髓穿刺',
    description: '血液科会诊病人需要骨穿，带教带你一起去。',
    duration: 40,
    skillId: 'boneMarrow',
    kind: 'difficult',
    departments: ['内科', '血液科', '儿科'],
    choices: [STANDARD_CHOICE, { id: 'observe', label: '先观摩，记住体位和进针点', timeBonus: 0, stress: 1, skillBonus: 3 }, { id: 'hands', label: '申请做助手并练习涂片', timeBonus: 10, stress: 2, skillBonus: 6 }],
  },
  {
    id: 'lumbar',
    title: '跟带教做腰椎穿刺',
    description: '神经内科会诊需要腰穿，带教让你准备穿刺包。',
    duration: 40,
    skillId: 'lumbar',
    kind: 'difficult',
    departments: ['内科', '神经内科', '急诊医学科'],
    choices: [STANDARD_CHOICE, { id: 'observe', label: '先观摩，记住体位和进针层次', timeBonus: 0, stress: 1, skillBonus: 3 }, { id: 'hands', label: '申请做助手并帮忙测压', timeBonus: 10, stress: 2, skillBonus: 6 }],
  },
  {
    id: 'urinary',
    title: '给患者导尿',
    description: '患者尿潴留，护士忙不过来，带教让你去处理。',
    duration: 25,
    skillId: 'urinary',
    kind: 'difficult',
    departments: ['内科', '外科', '妇产科', '急诊医学科', '老年医学科'],
    choices: [STANDARD_CHOICE, { id: 'observe', label: '请护士一起做，自己当助手', timeBonus: 5, stress: 0, skillBonus: 3 }, { id: 'hands', label: '自己按无菌步骤操作', timeBonus: 10, stress: 2, skillBonus: 6 }],
  },
  {
    id: 'ngtube',
    title: '给患者插胃管',
    description: '患者需要鼻饲，带教让你去置胃管并确认位置。',
    duration: 25,
    skillId: 'ngtube',
    kind: 'difficult',
    departments: ['内科', '外科', '急诊医学科', '老年医学科'],
    choices: [STANDARD_CHOICE, { id: 'observe', label: '请护士带教，自己先观摩', timeBonus: 5, stress: 0, skillBonus: 3 }, { id: 'hands', label: '自己尝试置入并听气过水声', timeBonus: 10, stress: 2, skillBonus: 6 }],
  },
  {
    id: 'sterile',
    title: '跟着上台做一台小手术的助手',
    description: '手术室缺人，带教让你上去拉钩。',
    duration: 60,
    skillId: 'sterile',
    kind: 'common',
    departments: ['外科', '妇产科', '眼科'],
    choices: [STANDARD_CHOICE, { id: 'follow', label: '按带教要求洗手、穿无菌衣', timeBonus: 0, stress: 2, skillBonus: 6 }, { id: 'observe', label: '只在旁边看，不碰无菌台', timeBonus: -10, stress: 0, skillBonus: 3 }],
    onlyIndependent: true
  },
  {
    id: 'physicalExam',
    title: '给新病人做重点体格检查',
    description: '带教让你先去给新病人做一遍重点查体，回来汇报阳性体征。',
    duration: 20,
    skillId: 'physicalExam',
    kind: 'medium',
    departments: ['内科', '外科', '妇产科', '儿科', '急诊医学科', '老年医学科'],
    choices: [],
  },
  {
    id: 'suture',
    title: '跟带教缝合一个切口',
    description: '清创结束后，带教把持针器和缝线递给你：“来，试两针。”',
    duration: 30,
    skillId: 'suture',
    kind: 'medium',
    departments: ['外科', '妇产科', '眼科', '皮肤性病科'],
    choices: [],
  },
  {
    id: 'drainRemoval',
    title: '给 XX 床患者拔引流管',
    description: '引流量已经连续两天很少，带教确认后让你去拔管并观察伤口。',
    duration: 20,
    skillId: 'drainRemoval',
    kind: 'common',
    departments: ['外科', '妇产科', '内科', '老年医学科'],
    choices: [],
  },
  {
    id: 'specimenThroat',
    title: '留取咽拭子标本',
    description: '护士站让你去给患者留一份咽拭子，送检验科。',
    duration: 15,
    skillId: 'specimen',
    kind: 'common',
    departments: ['内科', '儿科', '急诊医学科', '老年医学科'],
    choices: [],
  },
  {
    id: 'specimenNose',
    title: '留取鼻拭子标本',
    description: '患者需要做呼吸道病原检测，带教让你去留一份鼻拭子。',
    duration: 15,
    skillId: 'specimen',
    kind: 'common',
    departments: ['内科', '儿科', '急诊医学科', '老年医学科'],
    choices: [],
  },
  {
    id: 'specimenAscites',
    title: '留取腹水标本',
    description: '腹穿后需要留取腹水送常规、生化和培养，带教让你负责分装。',
    duration: 15,
    skillId: 'specimen',
    kind: 'common',
    departments: ['内科', '外科', '急诊医学科'],
    choices: [],
  },
  {
    id: 'specimenPleural',
    title: '留取胸水标本',
    description: '胸穿后需要留取胸水送检，带教让你把标本管核对清楚。',
    duration: 15,
    skillId: 'specimen',
    kind: 'common',
    departments: ['内科', '急诊医学科', '外科'],
    choices: [],
  },

]

export function clinicalTaskBedNumber(taskId: string, dayIndex: number): number {
  const candidates = Array.from({ length: 66 }, (_, index) => index + 1)
    .filter((value) => !String(value).includes('4'))
  let hash = dayIndex * 37 + 17
  for (const char of taskId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return candidates[hash % candidates.length] ?? 1
}

export function formatClinicalTaskForDay(
  task: ClinicalTaskDef,
  dayIndex: number,
): ClinicalTaskDef {
  const bed = clinicalTaskBedNumber(task.id, dayIndex)
  return {
    ...task,
    title: task.title.replace(/XX/g, String(bed)),
    description: task.description.replace(/XX/g, String(bed)),
  }
}

export const CLINICAL_TASK_BY_ID = Object.fromEntries(
  CLINICAL_TASKS.map((task) => [task.id, task]),
) as Record<string, ClinicalTaskDef>

export interface ClinicalQuestionDef {
  id: string
  text: string
  skillId: ClinicalSkillId
  category: string
  options: Array<{ text: string; correct: boolean }>
}

export const CLINICAL_QUESTIONS: ClinicalQuestionDef[] = [
  { id: "q-001", category: "鉴别诊断", skillId: "interview", text: "患者胸痛，除了急性心梗，还要优先和什么鉴别？", options: [{ text: "主动脉夹层、肺栓塞", correct: true }, { text: "慢性胃炎、反流性食管炎", correct: false }, { text: "肋软骨炎、焦虑", correct: false }] },
  { id: "q-002", category: "鉴别诊断", skillId: "physicalExam", text: "患者突发腹痛，查体最需要先关注什么？", options: [{ text: "腹膜刺激征、生命体征和休克表现", correct: true }, { text: "肠鸣音是否活跃", correct: false }, { text: "既往是否有胃病史", correct: false }] },
  { id: "q-003", category: "诊疗方案", skillId: "record", text: "新入院糖尿病患者，第一步处理最合适的是？", options: [{ text: "评估血糖、酮症和并发症风险后再定方案", correct: true }, { text: "立刻上胰岛素泵", correct: false }, { text: "先让患者禁食观察", correct: false }] },
  { id: "q-004", category: "诊疗方案", skillId: "interview", text: "术后患者发热，最不应该忽略的是什么？", options: [{ text: "切口、肺部、泌尿系统和导管相关感染", correct: true }, { text: "先给退烧药再说", correct: false }, { text: "只查血常规", correct: false }] },
  { id: "q-005", category: "操作规范", skillId: "sterile", text: "无菌操作中，手套碰到无菌台边缘后应该？", options: [{ text: "立即更换手套或重新消毒", correct: true }, { text: "继续操作，边缘不算污染", correct: false }, { text: "用酒精擦一下继续", correct: false }] },
  { id: "q-006", category: "病历书写", skillId: "record", text: "入院记录中，主诉应该怎么写？", options: [{ text: "患者主要症状和持续时间，简短明确", correct: true }, { text: "把现病史全部抄一遍", correct: false }, { text: "直接写诊断", correct: false }] },
  { id: "q-007", category: "心电图", skillId: "ecg", text: "心电图出现 ST 段抬高，首先应该考虑？", options: [{ text: "急性心肌缺血或梗死，结合临床紧急处理", correct: true }, { text: "正常变异，可以观察", correct: false }, { text: "只是电极接触不良", correct: false }] },
  { id: "q-008", category: "医患沟通", skillId: "interview", text: "家属反复追问“手术能不能保证成功”，最合适的回答是？", options: [{ text: "说明风险和获益，给出现实预期", correct: true }, { text: "保证一定成功，让家属放心", correct: false }, { text: "拒绝回答，让上级医生来", correct: false }] },
  { id: "q-009", category: "鉴别诊断", skillId: "interview", text: "患者突发胸痛、呼吸困难、低氧，D-二聚体明显升高，最需要优先考虑？", options: [{ text: "肺栓塞", correct: true }, { text: "稳定型心绞痛", correct: false }, { text: "肋软骨炎", correct: false }] },
  { id: "q-010", category: "鉴别诊断", skillId: "physicalExam", text: "患者突发撕裂样胸背痛，双上肢血压差异明显，最应考虑？", options: [{ text: "主动脉夹层", correct: true }, { text: "急性心包炎", correct: false }, { text: "带状疱疹", correct: false }] },
  { id: "q-011", category: "鉴别诊断", skillId: "physicalExam", text: "患者起初脐周痛，后转移至右下腹，麦氏点压痛反跳痛，最应考虑？", options: [{ text: "急性阑尾炎", correct: true }, { text: "急性胃炎", correct: false }, { text: "输尿管结石", correct: false }] },
  { id: "q-012", category: "鉴别诊断", skillId: "interview", text: "患者黄疸伴陶土样便和皮肤瘙痒，最符合？", options: [{ text: "梗阻性黄疸", correct: true }, { text: "溶血性黄疸", correct: false }, { text: "Gilbert 综合征", correct: false }] },
  { id: "q-013", category: "鉴别诊断", skillId: "physicalExam", text: "患者发热、新出现心脏杂音、皮肤瘀点，最应考虑？", options: [{ text: "感染性心内膜炎", correct: true }, { text: "病毒性心肌炎", correct: false }, { text: "甲状腺功能亢进", correct: false }] },
  { id: "q-014", category: "鉴别诊断", skillId: "interview", text: "患者乏力、低钠、低血压、皮肤色素沉着，最应考虑？", options: [{ text: "肾上腺皮质功能减退", correct: true }, { text: "甲状腺功能减退", correct: false }, { text: "抗利尿激素分泌不当综合征", correct: false }] },
  { id: "q-015", category: "鉴别诊断", skillId: "physicalExam", text: "老年患者新发头痛、颞动脉压痛、视力下降，最应考虑？", options: [{ text: "巨细胞动脉炎", correct: true }, { text: "偏头痛", correct: false }, { text: "紧张性头痛", correct: false }] },
  { id: "q-016", category: "鉴别诊断", skillId: "interview", text: "青年女性蝶形红斑、关节痛、蛋白尿，最应考虑？", options: [{ text: "系统性红斑狼疮", correct: true }, { text: "类风湿关节炎", correct: false }, { text: "痛风", correct: false }] },
  { id: "q-017", category: "鉴别诊断", skillId: "physicalExam", text: "老年人跌倒后髋部疼痛、下肢短缩外旋，最应考虑？", options: [{ text: "髋部骨折", correct: true }, { text: "腰椎间盘突出", correct: false }, { text: "膝关节扭伤", correct: false }] },
  { id: "q-018", category: "鉴别诊断", skillId: "interview", text: "患者咳嗽、咯血、消瘦、夜间盗汗，最应考虑？", options: [{ text: "肺结核", correct: true }, { text: "支气管扩张", correct: false }, { text: "肺癌", correct: false }] },
  { id: "q-019", category: "鉴别诊断", skillId: "physicalExam", text: "患者腹胀、移动性浊音阳性、低白蛋白，最符合？", options: [{ text: "腹水", correct: true }, { text: "肠梗阻", correct: false }, { text: "巨大卵巢囊肿", correct: false }] },
  { id: "q-020", category: "鉴别诊断", skillId: "interview", text: "房颤患者突发单侧肢体无力，最应考虑？", options: [{ text: "脑栓塞", correct: true }, { text: "低血糖", correct: false }, { text: "周围神经病", correct: false }] },
  { id: "q-021", category: "诊疗方案", skillId: "record", text: "急性 ST 段抬高型心肌梗死，最优先的处理是？", options: [{ text: "尽快再灌注治疗", correct: true }, { text: "先口服止痛药观察", correct: false }, { text: "等待心肌酶结果", correct: false }] },
  { id: "q-022", category: "诊疗方案", skillId: "record", text: "糖尿病酮症酸中毒患者，初始治疗最关键的是？", options: [{ text: "积极补液", correct: true }, { text: "立即大剂量胰岛素静推", correct: false }, { text: "立即补钾", correct: false }] },
  { id: "q-023", category: "诊疗方案", skillId: "ecg", text: "高钾血症伴宽 QRS 和心律失常，最应立即？", options: [{ text: "静脉钙剂稳定心肌", correct: true }, { text: "口服降钾树脂", correct: false }, { text: "限制饮水", correct: false }] },
  { id: "q-024", category: "诊疗方案", skillId: "record", text: "社区获得性肺炎经验性治疗，最重要的依据是？", options: [{ text: "病情严重度与当地耐药情况", correct: true }, { text: "只根据患者年龄", correct: false }, { text: "只根据胸片大小", correct: false }] },
  { id: "q-025", category: "诊疗方案", skillId: "record", text: "患者出现喉头水肿、低血压和喘鸣，首选药物是？", options: [{ text: "肌注肾上腺素", correct: true }, { text: "口服抗组胺药", correct: false }, { text: "吸入激素", correct: false }] },
  { id: "q-026", category: "诊疗方案", skillId: "record", text: "重症哮喘急性发作，最合理的初始治疗是？", options: [{ text: "吸入短效支气管扩张剂联合全身激素", correct: true }, { text: "单独口服抗生素", correct: false }, { text: "立即使用镇静药", correct: false }] },
  { id: "q-027", category: "诊疗方案", skillId: "record", text: "急性肺水肿患者端坐呼吸、双肺湿啰音，最应优先？", options: [{ text: "坐位、吸氧与静脉利尿", correct: true }, { text: "大量补液", correct: false }, { text: "立即口服降糖药", correct: false }] },
  { id: "q-028", category: "诊疗方案", skillId: "record", text: "房颤伴快速心室率且血压不稳定，最合适的是？", options: [{ text: "同步电复律", correct: true }, { text: "仅观察", correct: false }, { text: "口服β受体阻滞剂后回家", correct: false }] },
  { id: "q-029", category: "诊疗方案", skillId: "record", text: "急性胰腺炎早期处理的核心是？", options: [{ text: "液体复苏与镇痛", correct: true }, { text: "立即禁食并长期全肠外营养", correct: false }, { text: "常规使用抗生素", correct: false }] },
  { id: "q-030", category: "诊疗方案", skillId: "record", text: "上消化道大出血患者，最先要处理的是？", options: [{ text: "评估并稳定循环", correct: true }, { text: "立即口服止血药", correct: false }, { text: "先做胃镜", correct: false }] },
  { id: "q-031", category: "诊疗方案", skillId: "record", text: "肝性脑病患者，常用的降氨治疗是？", options: [{ text: "乳果糖", correct: true }, { text: "口服铁剂", correct: false }, { text: "静脉补钙", correct: false }] },
  { id: "q-032", category: "诊疗方案", skillId: "record", text: "甲亢危象治疗中，抑制甲状腺激素合成常用？", options: [{ text: "丙硫氧嘧啶或甲巯咪唑", correct: true }, { text: "左甲状腺素", correct: false }, { text: "碘化钾单药", correct: false }] },
  { id: "q-033", category: "诊疗方案", skillId: "record", text: "糖尿病患者意识障碍、出汗、血糖低，应立即？", options: [{ text: "静脉葡萄糖", correct: true }, { text: "静脉胰岛素", correct: false }, { text: "口服降糖药", correct: false }] },
  { id: "q-034", category: "诊疗方案", skillId: "record", text: "休克患者初始评估中，最关键的动态指标是？", options: [{ text: "组织灌注与乳酸变化", correct: true }, { text: "单纯体温", correct: false }, { text: "单纯尿色", correct: false }] },
  { id: "q-035", category: "诊疗方案", skillId: "record", text: "慢阻肺急性加重伴低氧，氧疗目标通常是？", options: [{ text: "维持 SpO2 88%–92%", correct: true }, { text: "维持 SpO2 100%", correct: false }, { text: "不吸氧", correct: false }] },
  { id: "q-036", category: "操作规范", skillId: "sterile", text: "中心静脉穿刺预防感染最关键的环节是？", options: [{ text: "严格无菌与皮肤消毒", correct: true }, { text: "穿刺后立即洗澡", correct: false }, { text: "常规口服抗生素", correct: false }] },
  { id: "q-037", category: "操作规范", skillId: "thoracentesis", text: "胸腔穿刺抽液时，一次抽液量一般不宜超过？", options: [{ text: "1000–1200 ml", correct: true }, { text: "3000 ml", correct: false }, { text: "200 ml", correct: false }] },
  { id: "q-038", category: "操作规范", skillId: "abdominal", text: "腹腔穿刺放液时，预防循环紊乱应？", options: [{ text: "控制放液速度并观察生命体征", correct: true }, { text: "快速大量放液", correct: false }, { text: "放液后立即剧烈活动", correct: false }] },
  { id: "q-039", category: "操作规范", skillId: "lumbar", text: "腰椎穿刺前最应排除的情况是？", options: [{ text: "颅内压增高或脑疝风险", correct: true }, { text: "轻度贫血", correct: false }, { text: "近视", correct: false }] },
  { id: "q-040", category: "操作规范", skillId: "boneMarrow", text: "成人骨髓穿刺最常用部位是？", options: [{ text: "髂后上棘", correct: true }, { text: "胸骨正中", correct: false }, { text: "胫骨", correct: false }] },
  { id: "q-041", category: "操作规范", skillId: "urinary", text: "导尿时预防尿路感染最重要的是？", options: [{ text: "严格无菌操作并保持引流通畅", correct: true }, { text: "常规预防性抗生素", correct: false }, { text: "夹闭尿管", correct: false }] },
  { id: "q-042", category: "操作规范", skillId: "ngtube", text: "胃管置入后确认位置最可靠的方法是？", options: [{ text: "结合抽吸液 pH 与影像确认", correct: true }, { text: "只看患者是否咳嗽", correct: false }, { text: "只闻气味", correct: false }] },
  { id: "q-043", category: "操作规范", skillId: "drain", text: "拔除引流管前最重要的评估是？", options: [{ text: "引流量、性状及病情需要", correct: true }, { text: "患者是否想拔", correct: false }, { text: "固定是否牢固", correct: false }] },
  { id: "q-044", category: "操作规范", skillId: "dressing", text: "清洁伤口换药时，正确的顺序是？", options: [{ text: "先清洁伤口后污染伤口", correct: true }, { text: "先污染伤口后清洁伤口", correct: false }, { text: "从远心端向近心端", correct: false }] },
  { id: "q-045", category: "操作规范", skillId: "sterile", text: "无菌手套碰到无菌台边缘后应？", options: [{ text: "立即更换或重新消毒", correct: true }, { text: "继续操作", correct: false }, { text: "用嘴吹一下", correct: false }] },
  { id: "q-046", category: "操作规范", skillId: "sterile", text: "手术区消毒范围一般应超过切口边缘？", options: [{ text: "15 cm 以上", correct: true }, { text: "2 cm", correct: false }, { text: "紧贴切口", correct: false }] },
  { id: "q-047", category: "操作规范", skillId: "specimen", text: "留取血培养标本时，最应确保？", options: [{ text: "无菌采集并在抗菌药前完成", correct: true }, { text: "采集后室温放置过夜", correct: false }, { text: "从输液管路随意抽取", correct: false }] },
  { id: "q-048", category: "操作规范", skillId: "specimen", text: "血气分析标本采集后应？", options: [{ text: "尽快送检并避免气泡", correct: true }, { text: "长时间暴露空气", correct: false }, { text: "冷冻保存", correct: false }] },
  { id: "q-049", category: "操作规范", skillId: "dressing", text: "外周静脉留置针出现红肿疼痛时，应？", options: [{ text: "立即拔除并评估感染", correct: true }, { text: "继续输液观察", correct: false }, { text: "仅更换敷料", correct: false }] },
  { id: "q-050", category: "操作规范", skillId: "drain", text: "胸腔闭式引流的水封瓶应保持？", options: [{ text: "低于胸腔并直立", correct: true }, { text: "高于胸腔", correct: false }, { text: "随意放置", correct: false }] },
  { id: "q-051", category: "心电图", skillId: "ecg", text: "心电图 II、III、aVF 导联 ST 段抬高，最可能提示？", options: [{ text: "下壁心肌梗死", correct: true }, { text: "前壁心肌梗死", correct: false }, { text: "高侧壁心肌梗死", correct: false }] },
  { id: "q-052", category: "心电图", skillId: "ecg", text: "宽 QRS 心动过速患者血压不稳定，最优先？", options: [{ text: "同步电复律", correct: true }, { text: "静推维拉帕米", correct: false }, { text: "刺激迷走神经", correct: false }] },
  { id: "q-053", category: "心电图", skillId: "ecg", text: "心电图 RR 间期绝对不规则、无明确 P 波，最符合？", options: [{ text: "心房颤动", correct: true }, { text: "窦性心动过速", correct: false }, { text: "室上性心动过速", correct: false }] },
  { id: "q-054", category: "心电图", skillId: "ecg", text: "II 度 I 型房室传导阻滞的典型表现是？", options: [{ text: "PR 间期逐渐延长后脱漏", correct: true }, { text: "PR 间期固定", correct: false }, { text: "QRS 增宽", correct: false }] },
  { id: "q-055", category: "心电图", skillId: "ecg", text: "高钾血症典型心电图改变是？", options: [{ text: "T 波高尖、QRS 增宽", correct: true }, { text: "T 波低平、U 波明显", correct: false }, { text: "ST 段抬高", correct: false }] },
  { id: "q-056", category: "心电图", skillId: "ecg", text: "低钾血症常见心电图改变是？", options: [{ text: "U 波增高、T 波低平", correct: true }, { text: "T 波高尖", correct: false }, { text: "PR 间期缩短", correct: false }] },
  { id: "q-057", category: "心电图", skillId: "ecg", text: "心室颤动最有效的处理是？", options: [{ text: "立即非同步电除颤", correct: true }, { text: "同步电复律", correct: false }, { text: "静推地高辛", correct: false }] },
  { id: "q-058", category: "心电图", skillId: "ecg", text: "长 QT 间期患者应特别警惕？", options: [{ text: "尖端扭转型室速", correct: true }, { text: "窦性心动过缓", correct: false }, { text: "房性期前收缩", correct: false }] },
  { id: "q-059", category: "心电图", skillId: "ecg", text: "肺栓塞患者可能出现的心电图改变是？", options: [{ text: "S1Q3T3 与右心负荷表现", correct: true }, { text: "典型左束支阻滞", correct: false }, { text: "P 波消失", correct: false }] },
  { id: "q-060", category: "心电图", skillId: "ecg", text: "大量心包积液时可能出现？", options: [{ text: "电交替", correct: true }, { text: "左室高电压", correct: false }, { text: "异常 Q 波", correct: false }] },
  { id: "q-061", category: "病历书写", skillId: "record", text: "入院记录中的主诉应包含？", options: [{ text: "主要症状及持续时间", correct: true }, { text: "完整既往史", correct: false }, { text: "全部治疗经过", correct: false }] },
  { id: "q-062", category: "病历书写", skillId: "record", text: "现病史的核心内容是？", options: [{ text: "起病、演变、诊疗经过及伴随症状", correct: true }, { text: "家族成员职业", correct: false }, { text: "完整体检结果", correct: false }] },
  { id: "q-063", category: "病历书写", skillId: "record", text: "首次病程记录一般应在患者入院后多久内完成？", options: [{ text: "8 小时内", correct: true }, { text: "72 小时内", correct: false }, { text: "一周内", correct: false }] },
  { id: "q-064", category: "病历书写", skillId: "record", text: "知情同意书签署后，医生还应完成？", options: [{ text: "病程记录中记录沟通内容", correct: true }, { text: "把同意书交给患者自己保存", correct: false }, { text: "只记录手术名称", correct: false }] },
  { id: "q-065", category: "病历书写", skillId: "record", text: "输血前必须完成的关键步骤是？", options: [{ text: "核对血型、交叉配血并签署同意", correct: true }, { text: "只测体温", correct: false }, { text: "先输血再补记录", correct: false }] },
  { id: "q-066", category: "病历书写", skillId: "record", text: "死亡记录应在何时完成？", options: [{ text: "死亡后及时完成", correct: true }, { text: "一周后", correct: false }, { text: "出院时", correct: false }] },
  { id: "q-067", category: "病历书写", skillId: "record", text: "会诊记录应重点记录？", options: [{ text: "会诊意见与后续处理计划", correct: true }, { text: "会诊医生个人经历", correct: false }, { text: "病房环境", correct: false }] },
  { id: "q-068", category: "病历书写", skillId: "record", text: "出院小结应包含？", options: [{ text: "诊断、治疗经过、出院医嘱与随访计划", correct: true }, { text: "仅出院日期", correct: false }, { text: "仅费用明细", correct: false }] },
  { id: "q-069", category: "医患沟通", skillId: "communicationMedium", text: "向家属告知坏消息时，较合适的做法是？", options: [{ text: "先了解家属所知，再逐步告知并回应情绪", correct: true }, { text: "一开口就列出所有最坏结果", correct: false }, { text: "避免回答任何问题", correct: false }] },
  { id: "q-070", category: "医患沟通", skillId: "communicationCommon", text: "家属情绪激动拒绝抢救时，最合适的首要做法是？", options: [{ text: "先确认其理解与意愿，同时说明紧急风险", correct: true }, { text: "立即与家属争吵", correct: false }, { text: "完全不解释直接放弃", correct: false }] },
  { id: "q-071", category: "医患沟通", skillId: "communicationMedium", text: "术前谈话中，医生应重点说明？", options: [{ text: "手术获益、风险、替代方案和不确定性", correct: true }, { text: "保证手术百分之百成功", correct: false }, { text: "只说明费用", correct: false }] },
  { id: "q-072", category: "医患沟通", skillId: "communicationMedium", text: "发生医疗差错后，较合适的沟通原则是？", options: [{ text: "及时、坦诚、按流程报告并说明后续处理", correct: true }, { text: "先隐瞒再观察", correct: false }, { text: "只告诉护士", correct: false }] },
  { id: "q-073", category: "医患沟通", skillId: "communicationMedium", text: "临终患者沟通中，最重要的是？", options: [{ text: "尊重患者意愿并处理症状与心理需求", correct: true }, { text: "反复强调治愈可能", correct: false }, { text: "回避所有问题", correct: false }] },
  { id: "q-074", category: "医患沟通", skillId: "communicationCommon", text: "未成年人手术知情同意通常应由？", options: [{ text: "法定监护人签署并尊重患儿理解能力", correct: true }, { text: "患儿独自签署", correct: false }, { text: "任何同学签署", correct: false }] },
  { id: "q-075", category: "医患沟通", skillId: "communicationCommon", text: "保护患者隐私的正确做法是？", options: [{ text: "仅在诊疗需要范围内讨论病情", correct: true }, { text: "在电梯里讨论床号姓名", correct: false }, { text: "把病历照片发到群里", correct: false }] },
  { id: "q-076", category: "医患沟通", skillId: "communicationMedium", text: "临床试验知情同意必须包括？", options: [{ text: "研究目的、风险、获益、替代方案与自愿退出", correct: true }, { text: "保证治愈", correct: false }, { text: "只写补偿金额", correct: false }] },
  { id: "q-077", category: "医患沟通", skillId: "communicationCommon", text: "患者担心费用时，较合适的回应是？", options: [{ text: "解释费用构成与可及的支持渠道", correct: true }, { text: "回避费用问题", correct: false }, { text: "承诺全部免费", correct: false }] },
  { id: "q-078", category: "医患沟通", skillId: "communicationCommon", text: "面对情绪激动的家属，首先应？", options: [{ text: "倾听并确认其担忧，再解释医疗决策", correct: true }, { text: "立即叫保安", correct: false }, { text: "打断对方", correct: false }] },
  { id: "q-079", category: "急症处理", skillId: "record", text: "张力性气胸患者呼吸困难、血压下降，应立即？", options: [{ text: "紧急胸腔减压", correct: true }, { text: "等待胸片", correct: false }, { text: "给予镇静药", correct: false }] },
  { id: "q-080", category: "急症处理", skillId: "record", text: "心包填塞患者出现低血压、颈静脉怒张、心音低钝，应？", options: [{ text: "紧急心包穿刺引流", correct: true }, { text: "大量补液后回家", correct: false }, { text: "口服利尿剂", correct: false }] },
  { id: "q-081", category: "急症处理", skillId: "record", text: "癫痫持续状态首选初始处理是？", options: [{ text: "静脉苯二氮䓬类药物", correct: true }, { text: "口服抗癫痫药", correct: false }, { text: "立即头颅 CT 后再处理", correct: false }] },
  { id: "q-082", category: "急症处理", skillId: "record", text: "低血糖昏迷患者无静脉通路时，可考虑？", options: [{ text: "肌注胰高血糖素", correct: true }, { text: "口服降糖药", correct: false }, { text: "静脉胰岛素", correct: false }] },
  { id: "q-083", category: "急症处理", skillId: "record", text: "急性中毒患者初始处理最重要的是？", options: [{ text: "评估气道、呼吸、循环并明确毒物", correct: true }, { text: "立即催吐所有患者", correct: false }, { text: "先洗胃再评估", correct: false }] },
  { id: "q-084", category: "急症处理", skillId: "record", text: "热射病患者最关键的早期处理是？", options: [{ text: "快速降温与液体复苏", correct: true }, { text: "立即保暖", correct: false }, { text: "口服退烧药后观察", correct: false }] },
  { id: "q-085", category: "急症处理", skillId: "record", text: "溺水患者救上岸后首先应？", options: [{ text: "评估呼吸循环并开始心肺复苏", correct: true }, { text: "立即倒挂控水", correct: false }, { text: "先送远处医院", correct: false }] },
  { id: "q-086", category: "急症处理", skillId: "record", text: "大咯血患者最危险的情况是？", options: [{ text: "窒息与气道阻塞", correct: true }, { text: "轻度贫血", correct: false }, { text: "咳嗽加重", correct: false }] },
  { id: "q-087", category: "急症处理", skillId: "record", text: "上消化道大出血患者出现休克，应优先？", options: [{ text: "建立通路、补液与输血准备", correct: true }, { text: "立即进食", correct: false }, { text: "先做钡餐", correct: false }] },
  { id: "q-088", category: "急症处理", skillId: "record", text: "羊水栓塞最突出的早期表现是？", options: [{ text: "突发低氧、低血压和凝血障碍", correct: true }, { text: "慢性高血压", correct: false }, { text: "单纯腰痛", correct: false }] },
  { id: "q-089", category: "急症处理", skillId: "record", text: "儿童热性惊厥持续超过 5 分钟，应？", options: [{ text: "按癫痫持续状态处理并评估病因", correct: true }, { text: "按压人中后等待", correct: false }, { text: "立即口服抗生素", correct: false }] },
  { id: "q-090", category: "检验判读", skillId: "record", text: "血钙明显升高伴乏力、便秘、多尿，最应考虑？", options: [{ text: "原发性甲状旁腺功能亢进", correct: true }, { text: "低钙血症", correct: false }, { text: "甲状腺功能减退", correct: false }] },
  { id: "q-091", category: "检验判读", skillId: "record", text: "低钠血症评估中，首先应判断？", options: [{ text: "血浆渗透压与容量状态", correct: true }, { text: "是否贫血", correct: false }, { text: "血小板数量", correct: false }] },
  { id: "q-092", category: "检验判读", skillId: "record", text: "代谢性酸中毒伴阴离子间隙升高，常见原因是？", options: [{ text: "乳酸酸中毒或酮症酸中毒", correct: true }, { text: "大量呕吐", correct: false }, { text: "低钾血症", correct: false }] },
  { id: "q-093", category: "检验判读", skillId: "record", text: "血淀粉酶升高最应结合什么判断？", options: [{ text: "临床症状与影像，排除其他急腹症", correct: true }, { text: "只看数值高低", correct: false }, { text: "只根据年龄", correct: false }] },
  { id: "q-094", category: "检验判读", skillId: "record", text: "小细胞低色素性贫血最常见于？", options: [{ text: "缺铁性贫血", correct: true }, { text: "巨幼细胞性贫血", correct: false }, { text: "再生障碍性贫血", correct: false }] },
  { id: "q-095", category: "检验判读", skillId: "record", text: "血小板明显减少且伴出血倾向，应优先？", options: [{ text: "评估出血风险并查找原因", correct: true }, { text: "立即拔牙", correct: false }, { text: "口服阿司匹林", correct: false }] },
  { id: "q-096", category: "检验判读", skillId: "record", text: "INR 明显延长且患者出血，应首先考虑？", options: [{ text: "维生素 K 依赖凝血因子缺乏或抗凝过量", correct: true }, { text: "血小板增多", correct: false }, { text: "血友病 A", correct: false }] },
  { id: "q-097", category: "检验判读", skillId: "record", text: "肌酐短期内明显升高，最应考虑？", options: [{ text: "急性肾损伤", correct: true }, { text: "慢性肾病稳定期", correct: false }, { text: "脱水已完全纠正", correct: false }] },
  { id: "q-098", category: "检验判读", skillId: "record", text: "尿蛋白定量升高最有助于判断？", options: [{ text: "蛋白尿程度与肾病范围", correct: true }, { text: "血糖控制", correct: false }, { text: "肝功能分期", correct: false }] },
  { id: "q-099", category: "检验判读", skillId: "record", text: "血气 pH 7.30、PaCO2 明显升高，最符合？", options: [{ text: "呼吸性酸中毒", correct: true }, { text: "代谢性碱中毒", correct: false }, { text: "呼吸性碱中毒", correct: false }] },
  { id: "q-100", category: "鉴别诊断", skillId: "physicalExam", text: "患者突发单侧下肢肿胀、疼痛，最需要警惕？", options: [{ text: "深静脉血栓形成", correct: true }, { text: "肌肉拉伤", correct: false }, { text: "蜂窝织炎", correct: false }] },
]

export const CLINICAL_QUESTION_BY_ID = Object.fromEntries(
  CLINICAL_QUESTIONS.map((question) => [question.id, question]),
) as Record<string, ClinicalQuestionDef>

export const ESCAPE_PURPOSES = [
  { id: 'exam' as const, label: '复习考试', desc: '获得当前课程准备度收益。' },
  { id: 'study' as const, label: '备考考研', desc: '获得考研准备度收益。' },
  { id: 'rest' as const, label: '休息', desc: '恢复精力、降低压力。' },
]

export const ESCAPE_HIDEOUTS = [
  { id: 'duty', label: '值班室', desc: '离科室最近，容易被发现，但能及时听到消息。', risk: 0.26 },
  { id: 'classroom', label: '示教室', desc: '相对安静，消息慢一点，被发现风险中等。', risk: 0.16 },
  { id: 'outside', label: '医院外', desc: '最安全，但一旦被发现后果最重。', risk: 0.08 },
]

export function createClinicalState(courses: Course[]): ClinicalState {
  return {
    courseIndex: 0,
    dayIndex: 0,
    mode: 'intro',
    courses: courses.map(clinicalCourseInfo),
    skills: initialClinicalSkills(),
    recognition: 50,
    taskRecords: [],
    rotationResults: [],
    currentDay: null,
    todos: [],
    dayAttendance: 0,
    dayAbsences: 0,
    escapeMinutes: 0,
    lastDaySummary: null,
    lastRotation: null,
    askedQuestionIds: [],
  }
}

export function createDayState(course: ClinicalCourseInfo, dayIndex: number): ClinicalDayState {
  return {
    courseId: course.courseId,
    dayIndex,
    totalDays: course.clinicalDays,
    clock: 0,
    phaseId: 'commute',
    suspicion: 0,
    suspicionBlockId: 'commute',
    holdAction: null,
    holdProgresses: { phone: 0, exam: 0, study: 0, nap: 0 },
    fixedPromptId: null,
    currentTaskId: null,
    currentQuestionId: null,
    escape: null,
    tasks: {
      expectedAdmissions: 1 + Math.floor(Math.random() * 4),
      admitted: 0,
      totalTasks: 2 + Math.floor(Math.random() * 3),
      completedTasks: 0,
    },
    recognition: 50,
    dayLog: [],
    attendedBlocks: [],
    lateArrival: false,
  }
}

export function questionSuccessChance(
  skills: Record<ClinicalSkillId, ClinicalSkillState>,
  skillId: ClinicalSkillId,
): number {
  const level = skills[skillId]?.level ?? 0
  return Math.min(0.95, 0.35 + level * 0.2)
}

export function questionLabel(chance: number): string {
  if (chance >= 0.75) return '很有把握'
  if (chance >= 0.5) return '一般'
  return '没底'
}

export function examineRotation(
  clinical: ClinicalState,
  course: ClinicalCourseInfo,
): ClinicalRotationResult {
  const relevantSkills = course.name.includes('内科') || course.name.includes('急诊')
    ? ['interview', 'physicalExam', 'record', 'ecg', 'thoracentesis', 'abdominal', 'lumbar']
    : ['record', 'sterile', 'dressing', 'suture', 'ecg', 'interview']
  const avgSkill =
    relevantSkills.reduce(
      (sum, id) => sum + (clinical.skills[id as ClinicalSkillId]?.level ?? 0),
      0,
    ) / relevantSkills.length
  const tasks = clinical.taskRecords.filter((task) => task.courseId === course.courseId)
  const successRate = tasks.length > 0
    ? tasks.filter((task) => task.success).length / tasks.length
    : 0.6
  const score = Math.max(
    45,
    Math.min(
      100,
      Math.round(
        52 +
          clinical.recognition * 0.2 +
          avgSkill * 9 +
          successRate * 12 -
          clinical.dayAbsences * 2,
      ),
    ),
  )
  const skillGains = CLINICAL_SKILLS.map((skill) => ({
    skillId: skill.id,
    gained: clinical.skills[skill.id]?.xp ?? 0,
  })).filter((item) => item.gained > 0)
  return {
    courseId: course.courseId,
    name: course.name,
    credits: course.credits,
    score,
    gpa: score >= 90 ? 4.0 : score >= 85 ? 3.7 : score >= 80 ? 3.3 : score >= 75 ? 3.0 : score >= 70 ? 2.7 : score >= 65 ? 2.3 : score >= 60 ? 2.0 : 0,
    recognition: clinical.recognition,
    attendance: clinical.dayAttendance,
    absences: clinical.dayAbsences,
    escapeMinutes: clinical.escapeMinutes,
    taskCount: tasks.length,
    skills: skillGains,
  }
}

export function currentClinicalCourse(clinical: ClinicalState): ClinicalCourseInfo | null {
  return clinical.courses[clinical.courseIndex] ?? null
}

export function currentTaskPool(course: ClinicalCourseInfo): ClinicalTaskDef[] {
  const pool = CLINICAL_TASKS.filter(
    (task) => task.departments.includes(course.department) || task.departments.includes('内科'),
  )
  return pool.length > 0 ? pool : CLINICAL_TASKS
}

export function randomTaskFor(
  course: ClinicalCourseInfo,
  excludeTaskIds: string[] = [],
): ClinicalTaskDef {
  const all = currentTaskPool(course)
  const pool = all.filter((task) => !excludeTaskIds.includes(task.id))
  const source = pool.length > 0 ? pool : all
  return source[Math.floor(Math.random() * source.length)] ?? CLINICAL_TASKS[0]
}

export function randomQuestionFor(course: ClinicalCourseInfo, askedIds: string[] = []): ClinicalQuestionDef {
  const asked = new Set(askedIds)
  const fresh = CLINICAL_QUESTIONS.filter((question) => !asked.has(question.id))
  const pool = fresh.length > 0 ? fresh : CLINICAL_QUESTIONS
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0]
}

export function findFixedBlock(course: ClinicalCourseInfo, clock: number): ClinicalBlock | null {
  return fixedBlockAt(course, clock)
}

export function findBlock(course: ClinicalCourseInfo, clock: number): ClinicalBlock | null {
  return blockAt(course, clock)
}

export function scheduleStartFor(course: ClinicalCourseInfo, blockId: string): number {
  return scheduleFor(course).find((block) => block.id === blockId)?.start ?? 0
}

export function phaseProgress(block: ClinicalBlock, clock: number): number {
  const duration = Math.max(1, block.end - block.start)
  return Math.max(0, Math.min(1, (clock - block.start) / duration))
}

export function normalizeClinicalSkill(
  skill?: Partial<ClinicalSkillState>,
): ClinicalSkillState {
  return {
    level: (skill?.level ?? 0) as ClinicalSkillLevel,
    xp: skill?.xp ?? 0,
    observes: skill?.observes ?? 0,
    assists: skill?.assists ?? 0,
    supervised: skill?.supervised ?? 0,
    independentUsed: skill?.independentUsed ?? false,
  }
}

const MODE_CHOICES: Array<ClinicalTaskChoice & { mode: ClinicalActionMode }> = [
  { id: 'observe', label: '观摩学习', timeBonus: 5, stress: -1, skillBonus: 0, mode: 'observe' },
  { id: 'assist', label: '带教协助下操作', timeBonus: 0, stress: 0, skillBonus: 0, mode: 'assist' },
  { id: 'supervise', label: '带教监督下操作', timeBonus: 0, stress: 1, skillBonus: 0, mode: 'supervise' },
  { id: 'independent', label: '独立操作', timeBonus: -3, stress: 2, skillBonus: 0, mode: 'independent' },
]

export function choicesForSkill(
  _task: ClinicalTaskDef,
  skillState: ClinicalSkillState,
): ClinicalTaskChoice[] {
  const skill = normalizeClinicalSkill(skillState)
  if (_task.onlyIndependent) {
    return [{ ...MODE_CHOICES[3], recommended: true, disabled: false }]
  }
  const level = skill.level
  const available =
    level === 0 ? 1 : level === 1 ? 2 : level === 2 ? 3 : 4
  return MODE_CHOICES.slice(0, available).map((choice) => {
    const recommended = skill.independentUsed
      ? choice.mode === 'independent'
      : (level === 1 && choice.mode === 'assist') ||
        (level === 2 && choice.mode === 'supervise') ||
        (level === 3 && choice.mode === 'independent')
    const disabled =
      skill.independentUsed && choice.mode !== 'independent'
    return { ...choice, recommended, disabled }
  })
}

export function trainClinicalSkill(
  skills: Record<ClinicalSkillId, ClinicalSkillState>,
  skillId: ClinicalSkillId,
  mode: ClinicalActionMode,
): { skills: Record<ClinicalSkillId, ClinicalSkillState>; leveledUp: boolean } {
  const current = normalizeClinicalSkill(skills[skillId])
  if (current.independentUsed && mode !== 'independent') {
    return { skills, leveledUp: false }
  }
  const kind = CLINICAL_SKILL_BY_ID[skillId]?.kind ?? 'common'
  const next: ClinicalSkillState = { ...current }
  let leveledUp = false
  if (mode === 'observe') {
    next.observes += 1
    if (next.level < 1) {
      next.level = 1
      leveledUp = true
    }
  } else if (mode === 'assist') {
    next.assists += 1
    const needed = kind === 'difficult' ? 2 : 1
    if (next.level < 2 && next.assists >= needed) {
      next.level = 2
      leveledUp = true
    }
  } else if (mode === 'supervise') {
    next.supervised += 1
    const needed = kind === 'common' ? 1 : kind === 'medium' ? 2 : 3
    if (next.level < 3 && next.supervised >= needed) {
      next.level = 3
      leveledUp = true
    }
  } else if (mode === 'independent') {
    next.independentUsed = true
    if (next.level < 3) {
      next.level = 3
      leveledUp = true
    }
  }
  next.xp = Math.max(current.xp, [0, 25, 70, 140][next.level] ?? current.xp)
  return {
    skills: { ...skills, [skillId]: next },
    leveledUp,
  }
}
