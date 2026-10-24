import { useState } from 'react'
import type { OrganizationCategory } from '../types'
import { ORGANIZATIONS, ORG_CATEGORY_LABELS } from '../organizations'
import { Eyebrow, Pill, TopBar } from '../ui'

interface ClubRecruitmentProps {
  mode: 'initial' | 'application'
  hasExistingClub?: boolean
  onSubmit: (orgId: string) => void
  onSkip: () => void
  onTitle?: () => void
}

type Track = 'club' | 'union' | 'debate'

const TRACKS: { key: Track; label: string }[] = [
  { key: 'club', label: '社团' },
  { key: 'union', label: '学生会' },
  { key: 'debate', label: '辩论队' },
]

const CLUB_CATEGORIES: OrganizationCategory[] = [
  'academic',
  'interest',
  'practice',
]

export function ClubRecruitment({
  mode,
  hasExistingClub = false,
  onSubmit,
  onSkip,
  onTitle,
}: ClubRecruitmentProps) {
  const [track, setTrack] = useState<Track>('club')
  const [category, setCategory] = useState<OrganizationCategory>('academic')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const organizations =
    track === 'club'
      ? ORGANIZATIONS.filter((org) => org.category === category)
      : ORGANIZATIONS.filter((org) => org.category === track)
  const selected = ORGANIZATIONS.find((org) => org.id === selectedId) ?? null

  return (
    <div className="screen club-recruit-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onSkip}>
              跳过
            </button>
          }
        />

        <header className="club-recruit-head">
          <Eyebrow>
            CLUB / STUDENT UNION / DEBATE
          </Eyebrow>
          <h1 className="page-title">
            {mode === 'initial' ? '社团与组织招新' : '补充招新'}
          </h1>
          <p className="page-lede">
            社团、学生会、辩论队三者只能选择其一。社团最多可以加入两个。
          </p>
          {mode === 'application' && (
            <div className="club-application-note">
              本次申请已经消耗一次本周行动。无论结果如何，先去看看。
            </div>
          )}
          {hasExistingClub && (
            <div className="club-application-note">
              你已加入一个社团，这次只能继续申请第二个社团，不能再加入学生会或辩论队。
            </div>
          )}
        </header>

        <div className="club-track-tabs">
          {TRACKS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={track === item.key ? 'is-active' : ''}
              disabled={hasExistingClub && item.key !== 'club'}
              onClick={() => {
                setTrack(item.key)
                setSelectedId(null)
                if (item.key === 'club') setCategory('academic')
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {track === 'club' && (
          <div className="club-category-tabs">
            {CLUB_CATEGORIES.map((key) => (
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
        )}

        <div
          className={`club-recruit-grid ${
            track !== 'club' ? 'is-single' : ''
          }`}
        >
          {organizations.map((org) => (
            <button
              key={org.id}
              type="button"
              className={`club-recruit-card ${selectedId === org.id ? 'is-selected' : ''}`}
              onClick={() => setSelectedId(org.id)}
            >
              <div className="club-recruit-meta">
                <span>{ORG_CATEGORY_LABELS[org.category]}</span>
                <Pill tone={org.category === 'union' || org.category === 'debate' ? 'gold' : 'plain'}>
                  {org.category === 'union'
                    ? '学生会'
                    : org.category === 'debate'
                      ? '辩论队'
                      : '社团'}
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
