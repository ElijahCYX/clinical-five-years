import { useState } from 'react'
import type { OrganizationCategory } from '../types'
import { ORGANIZATIONS, ORG_CATEGORY_LABELS } from '../organizations'
import { Eyebrow, Pill, TopBar } from '../ui'

interface ClubRecruitmentProps {
  mode: 'initial' | 'application'
  onSubmit: (orgId: string) => void
  onSkip: () => void
  onTitle?: () => void
}

const CATEGORY_ORDER: OrganizationCategory[] = [
  'academic',
  'interest',
  'practice',
  'union',
]

export function ClubRecruitment({
  mode,
  onSubmit,
  onSkip,
  onTitle,
}: ClubRecruitmentProps) {
  const [category, setCategory] = useState<OrganizationCategory>('academic')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const organizations = ORGANIZATIONS.filter((org) => org.category === category)
  const selected = ORGANIZATIONS.find((org) => org.id === selectedId) ?? null

  return (
    <div className="screen club-recruit-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onSkip}>
              跳过招新
            </button>
          }
        />

        <header className="club-recruit-head">
          <Eyebrow>
            CLUB &amp; STUDENT UNION / {mode === 'initial' ? 'FRESHMAN RECRUITMENT' : 'SUPPLEMENTARY RECRUITMENT'}
          </Eyebrow>
          <h1 className="page-title">社团与学生会</h1>
          <p className="page-lede">
            你可以在大一大二加入一个组织。现在先看看哪个地方让你想停下来。
          </p>
          {mode === 'application' && (
            <div className="club-application-note">
              本次申请已经消耗一次本周行动。无论结果如何，先去看看。
            </div>
          )}
        </header>

        <div className="club-category-tabs">
          {CATEGORY_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className={category === key ? 'is-active' : ''}
              onClick={() => {
                setCategory(key)
                setSelectedId(null)
              }}
            >
              {ORG_CATEGORY_LABELS[key]}
            </button>
          ))}
        </div>

        <div className="club-recruit-grid">
          {organizations.map((org) => (
            <button
              key={org.id}
              type="button"
              className={`club-recruit-card ${selectedId === org.id ? 'is-selected' : ''}`}
              onClick={() => setSelectedId(org.id)}
            >
              <div className="club-recruit-meta">
                <span>{ORG_CATEGORY_LABELS[org.category]}</span>
                <Pill tone={org.category === 'union' ? 'gold' : 'plain'}>
                  {org.category === 'union' ? '学生会' : '社团'}
                </Pill>
              </div>
              <h3>{org.name}</h3>
              <p>{org.description}</p>
            </button>
          ))}
        </div>

        <footer className="club-recruit-footer">
          <div>
            <span>当前选择</span>
            <strong>{selected?.name ?? '还没有选择'}</strong>
            <small>组织收益会在正式加入后通过迎新通知告知。</small>
          </div>
          <div className="club-recruit-actions">
            <button type="button" className="btn btn-ghost" onClick={onSkip}>
              暂时不加入
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!selected}
              onClick={() => selected && onSubmit(selected.id)}
            >
              {mode === 'initial' ? '加入这个组织' : '提交申请'}
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
