import { TALENTS } from './data'
import type { AttrKey, GameState, Gender, MentorProfile, Player, Relationship, SexualOrientation } from './types'

export const MENTOR_LIBRARY: MentorProfile[] = [
  {
    id: 'mentor-01',
    alias: '柴秀筠',
    department: '医学院',
    title: '主任医师',
    field: '肝胆胰外科、微创外科',
    level: 5,
    journals: ['Nature Communications', 'Advanced Science', 'Cell Death & Disease', 'Hepatobiliary Surgery and Nutrition', 'Frontiers in Oncology'],
    confidence: '高',
  },
  {
    id: 'mentor-02',
    alias: '良庭伯',
    department: '医学院',
    title: '主任医师',
    field: '肝胆胰外科、胰腺肿瘤',
    level: 5,
    journals: ['Annals of Surgery', 'Cancer Letters', 'Advanced Science', 'Cell Reports', 'International Journal of Surgery'],
    confidence: '高',
  },
  {
    id: 'mentor-03',
    alias: '黎岚鹃',
    department: '医学院',
    title: '主任医师',
    field: '感染病学、肝衰竭与微生态',
    level: 5,
    journals: ['Nature Communications', 'Journal of Hepatology', 'Gut', 'Clinical Infectious Diseases', 'Frontiers in Immunology'],
    confidence: '中',
  },
  {
    id: 'mentor-04',
    alias: '望荻',
    department: '基础医学院',
    title: '教授',
    field: '免疫代谢、巨噬细胞',
    level: 5,
    journals: ['Immunity', 'Nature Communications', 'Cellular & Molecular Immunology', 'Cell Reports', 'Cell Metabolism'],
    confidence: '高',
  },
  {
    id: 'mentor-05',
    alias: '鸥阳鸿玮',
    department: '基础医学院',
    title: '教授',
    field: '再生医学、肌腱与骨修复',
    level: 5,
    journals: ['Biomaterials', 'Acta Biomaterialia', 'Nature Communications', 'Bioactive Materials', 'Bone Research'],
    confidence: '高',
  },
  {
    id: 'mentor-06',
    alias: '望健安',
    department: '医学院',
    title: '主任医师',
    field: '心血管介入、心脏瓣膜病',
    level: 5,
    journals: ['Journal of the American College of Cardiology', 'Circulation', 'JACC: Cardiovascular Interventions', 'European Heart Journal', 'Circulation Research'],
    confidence: '高',
  },
  {
    id: 'mentor-07',
    alias: '扈海澜',
    department: '基础医学院',
    title: '教授',
    field: '神经科学、情绪与抑郁症',
    level: 5,
    journals: ['Nature', 'Science', 'Cell', 'Neuron', 'Nature Neuroscience'],
    confidence: '高',
  },
  {
    id: 'mentor-08',
    alias: '望清晴',
    department: '基础医学院',
    title: '教授',
    field: '肿瘤免疫、免疫调节',
    level: 4,
    journals: ['Cellular & Molecular Immunology', 'Nature Communications', 'Frontiers in Immunology', 'Journal of Cellular and Molecular Medicine', 'Cancer Immunology Research'],
    confidence: '中',
  },
  {
    id: 'mentor-09',
    alias: '皇禾',
    department: '医学院',
    title: '主任医师',
    field: '血液肿瘤、造血干细胞移植与 CAR-T',
    level: 5,
    journals: ['Journal of Hematology & Oncology', 'Blood', 'Bone Marrow Transplantation', 'Frontiers in Immunology', 'Annals of Hematology'],
    confidence: '中',
  },
  {
    id: 'mentor-10',
    alias: '扈绍华',
    department: '医学院',
    title: '主任医师',
    field: '精神病学、抑郁障碍',
    level: 3,
    journals: ['Molecular Psychiatry', 'Journal of Affective Disorders', 'Frontiers in Psychiatry', 'BMC Psychiatry', 'Neuropsychiatric Disease and Treatment'],
    confidence: '高',
  },
  {
    id: 'mentor-11',
    alias: '章炎',
    department: '基础医学院',
    title: '教授',
    field: '心血管受体结构与信号转导',
    level: 5,
    journals: ['Nature', 'Cell Research', 'Nature Communications', 'Science Advances', 'Cell Reports'],
    confidence: '中',
  },
  {
    id: 'mentor-12',
    alias: '厉晓鸣',
    department: '基础医学院',
    title: '教授',
    field: '神经科学、精神疾病机制',
    level: 4,
    journals: ['Nature Neuroscience', 'Neuron', 'Nature Communications', 'Advanced Science', 'Neuroscience Bulletin'],
    confidence: '高',
  },
  {
    id: 'mentor-13',
    alias: '端澍民',
    department: '基础医学院',
    title: '教授',
    field: '神经科学、胶质细胞与突触',
    level: 5,
    journals: ['Neuron', 'Nature Communications', 'eLife', 'Cell Reports', 'Nature Neuroscience'],
    confidence: '高',
  },
  {
    id: 'mentor-14',
    alias: '甄澍森',
    department: '医学院',
    title: '主任医师',
    field: '肝移植、肝胆外科',
    level: 5,
    journals: ['Journal of Hepatology', 'Annals of Surgery', 'Nature Communications', 'Cancer Letters', 'American Journal of Transplantation'],
    confidence: '中',
  },
  {
    id: 'mentor-15',
    alias: '霞鸿光',
    department: '基础医学院',
    title: '研究员',
    field: '药理学、神经药理与肿瘤药理',
    level: 4,
    journals: ['Nature Communications', 'Autophagy', 'Protein & Cell', 'Advanced Science', 'Acta Pharmacologica Sinica'],
    confidence: '高',
  },
  {
    id: 'mentor-16',
    alias: '定可丰',
    department: '医学院',
    title: '主任医师',
    field: '结直肠外科、肿瘤',
    level: 4,
    journals: ['International Journal of Cancer', 'Annals of Surgery', 'Frontiers in Oncology', 'BMC Cancer', 'Cancer Letters'],
    confidence: '中',
  },
  {
    id: 'mentor-17',
    alias: '房向铭',
    department: '医学院',
    title: '主任医师',
    field: '麻醉学、脓毒症与围术期医学',
    level: 4,
    journals: ['Anesthesiology', 'Shock', 'Critical Care', 'Chinese Medical Journal', 'BMC Anesthesiology'],
    confidence: '高',
  },
  {
    id: 'mentor-18',
    alias: '百雪丽',
    department: '医学院',
    title: '主任医师',
    field: '肝胆胰肿瘤外科',
    level: 4,
    journals: ['Annals of Surgery', 'Cancer Letters', 'International Journal of Surgery', 'HPB', 'Journal of Hepatology'],
    confidence: '高',
  },
  {
    id: 'mentor-19',
    alias: '黎秀鸯',
    department: '医学院',
    title: '副教授',
    field: '流行病与卫生统计',
    level: 3,
    journals: ['Frontiers in Public Health', 'BMC Public Health', 'Frontiers in Nutrition', 'PLoS One', 'Chinese Journal of Epidemiology'],
    confidence: '中',
  },
  {
    id: 'mentor-20',
    alias: '章建闵',
    department: '医学院',
    title: '主任医师',
    field: '神经外科、脑血管病',
    level: 4,
    journals: ['Advanced Science', 'Journal of Neuroinflammation', 'CNS Neuroscience & Therapeutics', 'Frontiers in Oncology', 'World Neurosurgery'],
    confidence: '高',
  },
  {
    id: 'mentor-21',
    alias: '俞韵贤',
    department: '医学院',
    title: '副教授',
    field: '流行病学、生殖健康',
    level: 3,
    journals: ['Clinical Nutrition', 'Nutrients', 'Frontiers in Endocrinology', 'BMC Pregnancy and Childbirth', 'PLoS One'],
    confidence: '中',
  },
  {
    id: 'mentor-22',
    alias: '望炜林',
    department: '医学院',
    title: '主任医师',
    field: '肝胆胰外科、肝移植',
    level: 5,
    journals: ['Annals of Surgery', 'Advanced Science', 'Hepatobiliary Surgery and Nutrition', 'Journal of Hepatology', 'Frontiers in Oncology'],
    confidence: '中',
  },
  {
    id: 'mentor-23',
    alias: '扈新阳',
    department: '医学院',
    title: '主任医师',
    field: '心血管病、干细胞治疗',
    level: 5,
    journals: ['Circulation', 'Circulation Research', 'JACC: Cardiovascular Interventions', 'Advanced Science', 'Nature Communications'],
    confidence: '高',
  },
  {
    id: 'mentor-24',
    alias: '克跃海',
    department: '基础医学院',
    title: '教授',
    field: '病理学、肿瘤信号',
    level: 4,
    journals: ['Journal of Experimental Medicine', 'Journal of Immunology', 'Nature Communications', 'Advanced Science', 'Journal of Biological Chemistry'],
    confidence: '高',
  },
  {
    id: 'mentor-25',
    alias: '玛环',
    department: '基础医学院',
    title: '教授',
    field: '神经科学、突触可塑性',
    level: 4,
    journals: ['Nature', 'Neuron', 'Cell Reports', 'Nature Communications', 'Science Advances'],
    confidence: '高',
  },
  {
    id: 'mentor-26',
    alias: '武溪凤',
    department: '医学院',
    title: '教授',
    field: '公共卫生、肿瘤流行病学',
    level: 4,
    journals: ['European Journal of Epidemiology', 'Cancer Epidemiology, Biomarkers & Prevention', 'Cancers', 'Frontiers in Oncology', 'Frontiers in Immunology'],
    confidence: '中',
  },
  {
    id: 'mentor-27',
    alias: '封友君',
    department: '基础医学院',
    title: '教授',
    field: '微生物学、细菌感染',
    level: 4,
    journals: ['Science Advances', 'PLoS Pathogens', 'Science Bulletin', 'Virulence', 'Scientific Reports'],
    confidence: '高',
  },
  {
    id: 'mentor-28',
    alias: '柏歌',
    department: '基础医学院',
    title: '教授',
    field: '神经生物学、运动神经元',
    level: 4,
    journals: ['Nature', 'Brain', 'Nature Communications', 'Neuron', 'Advanced Science'],
    confidence: '高',
  },
  {
    id: 'mentor-29',
    alias: '莱懋德',
    department: '基础医学院',
    title: '教授',
    field: '病理学、肿瘤',
    level: 4,
    journals: ['Gut', 'Journal of Pathology', 'Nature Communications', 'Clinical Cancer Research', 'Cancer Letters'],
    confidence: '中',
  },
  {
    id: 'mentor-30',
    alias: '律志敏',
    department: '基础医学院',
    title: '教授',
    field: '肿瘤代谢、细胞信号',
    level: 5,
    journals: ['Cell Metabolism', 'Molecular Cell', 'Nature Cell Biology', 'Nature Communications', 'Cancer Communications'],
    confidence: '高',
  },
  {
    id: 'mentor-31',
    alias: '柳先保',
    department: '医学院',
    title: '主任医师',
    field: '心血管介入、心脏瓣膜病',
    level: 4,
    journals: ['Journal of the American College of Cardiology', 'JACC: Cardiovascular Interventions', 'Circulation', 'Catheterization and Cardiovascular Interventions', 'Frontiers in Cardiovascular Medicine'],
    confidence: '高',
  },
  {
    id: 'mentor-32',
    alias: '章凝',
    department: '基础医学院',
    title: '教授',
    field: '肿瘤生物学、纳米医学',
    level: 4,
    journals: ['ACS Nano', 'Journal of Nanobiotechnology', 'Stem Cell Research & Therapy', 'Bioactive Materials', 'Advanced Science'],
    confidence: '中',
  },
  {
    id: 'mentor-33',
    alias: '舟丹',
    department: '基础医学院',
    title: '研究员',
    field: '肿瘤精准医学、生物信息学',
    level: 3,
    journals: ['Molecular Psychiatry', 'European Heart Journal', 'Kidney International Reports', 'npj Precision Oncology', 'Bioinformatics'],
    confidence: '待校准',
  },
  {
    id: 'mentor-34',
    alias: '烨鹃',
    department: '医学院',
    title: '主任医师',
    field: '眼科、眼表与眼整形',
    level: 4,
    journals: ['Bioactive Materials', 'Investigative Ophthalmology & Visual Science', 'Acta Ophthalmologica', "Graefe's Archive for Clinical and Experimental Ophthalmology", 'Frontiers in Medicine'],
    confidence: '高',
  },
  {
    id: 'mentor-35',
    alias: '寒沛东',
    department: '基础医学院',
    title: '研究员',
    field: '心血管发育与再生',
    level: 3,
    journals: ['Circulation', 'Circulation Research', 'eLife', 'Cell Regeneration', 'International Journal of Molecular Sciences'],
    confidence: '中',
  },
]

export const MENTOR_BY_ID = Object.fromEntries(MENTOR_LIBRARY.map((mentor) => [mentor.id, mentor])) as Record<string, MentorProfile>

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomOrientation(): SexualOrientation {
  return (['heterosexual', 'homosexual', 'bisexual'] as SexualOrientation[])[randInt(0, 2)]
}

function randomStats() {
  const attrs = {} as Record<AttrKey, number>
  for (const key of [
    'memory',
    'comprehension',
    'dexterity',
    'social',
    'appearance',
    'energy',
    'constitution',
    'resilience',
  ] as AttrKey[]) {
    attrs[key] = randInt(2, 10)
  }
  return {
    talent: TALENTS[randInt(0, TALENTS.length - 1)].id,
    gpa: Number((2 + Math.random() * 2).toFixed(2)),
    attrs,
  }
}

export function pickMentorProfile(): MentorProfile {
  return MENTOR_LIBRARY[randInt(0, MENTOR_LIBRARY.length - 1)]
}

export function createMentorRelationship(
  profile: MentorProfile,
  player: Player,
): Relationship {
  return {
    id: `rel-mentor-${profile.id}-${Math.random().toString(36).slice(2, 7)}`,
    name: profile.alias,
    gender: (Math.random() < 0.5 ? '女' : '男') as Gender,
    orientation: randomOrientation(),
    kind: 'mentor',
    identity: `${profile.department} · ${profile.title}`,
    // 初始亲密度 0-40：悟性 : 交际 = 3 : 1，不参考建模。
    intimacy: Math.max(
      0,
      Math.min(
        40,
        Math.round((player.attrs.comprehension * 3 + player.attrs.social) * 1.25) -
          10,
      ),
    ),
    statsKnown: false,
    knownStats: null,
    stats: randomStats(),
    weeklyAction: '在办公室改论文、开组会、催学生补实验。',
    lastPatKey: '',
    lastPatAbsWeek: 0,
    partner: false,
    confessionRisk: 0,
    breakupRisk: 0,
    ex: false,
    exWeek: 0,
    exPenalty: false,
  }
}

export function unlockMentor(state: GameState): GameState {
  if (!state.player) return state
  if (state.mentorProfileId) return state
  const profile = pickMentorProfile()
  return {
    ...state,
    mentorContactUnlocked: true,
    mentorProfileId: profile.id,
    relationships: [
      ...state.relationships,
      createMentorRelationship(profile, state.player),
    ],
  }
}

export function ensureMentor(state: GameState): GameState {
  if (!state.mentorContactUnlocked || state.mentorProfileId) return state
  return unlockMentor(state)
}

export function researchStage(progress: number): {
  name: string
  description: string
} {
  if (progress >= 100) {
    return { name: '已发表', description: '论文已经见刊，科研阶段完成。' }
  }
  if (progress >= 81) {
    return { name: '投稿发表', description: '稿件已投出，正在等待审稿意见。' }
  }
  if (progress >= 61) {
    return { name: '论文撰写', description: '数据已经整理，开始把结果写成论文。' }
  }
  if (progress >= 26) {
    return { name: '实验推进', description: '课题已经开始运转，实验和数据在逐步积累。' }
  }
  return { name: '开题设计', description: '正在读文献、找问题、写开题报告。' }
}
