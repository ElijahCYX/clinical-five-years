interface ActionDoodleProps {
  kind: string
}

function DoodlePaths({ kind }: ActionDoodleProps) {
  switch (kind) {
    case 'library':
      return (
        <>
          <path d="M36 72c16-10 32-10 44 0v44c-14-8-29-8-44 0z" />
          <path d="M80 72c14-10 30-10 44 0v44c-15-8-30-8-44 0z" />
          <path d="M80 72v44" />
          <path d="M48 88h18M48 98h14M94 88h18M94 98h14" />
          <path d="M54 54h52M64 54v-10h32v10" />
        </>
      )
    case 'electiveHomework':
      return (
        <>
          <rect x="48" y="46" width="62" height="74" rx="3" />
          <path d="M64 46v-8h30v8" />
          <path d="M62 68l6 6 12-14M62 90l6 6 12-14" />
          <path d="M88 76h14M88 98h14" />
          <path d="M108 108l15 15 7-25" />
        </>
      )
    case 'research':
      return (
        <>
          <path d="M68 40h24v22l20 46c4 9-2 18-12 18H60c-10 0-16-9-12-18l20-46z" />
          <path d="M60 96h40" />
          <path d="M64 112c8-4 14 4 22 0s14 4 20 0" />
          <circle cx="74" cy="60" r="3" />
          <circle cx="92" cy="52" r="2" />
          <path d="M112 58l6-6M118 52l8 8" />
        </>
      )
    case 'club':
      return (
        <>
          <circle cx="62" cy="68" r="12" />
          <circle cx="98" cy="74" r="10" />
          <path d="M42 104c4-13 12-20 20-20s16 7 20 20" />
          <path d="M80 106c4-12 11-18 18-18s15 6 19 18" />
          <path d="M80 38v30M80 38l20 9-20 9" />
        </>
      )
    case 'soloInvite':
      return (
        <>
          <path d="M38 60h56v32H62l-12 10v-10H38z" />
          <path d="M70 88h48v28H88l-10 10v-10H70z" />
          <path d="M82 66h18M90 66v14" />
          <path d="M60 46l8 8M112 42l-6 10" />
        </>
      )
    case 'social':
      return (
        <>
          <ellipse cx="80" cy="104" rx="46" ry="12" />
          <circle cx="56" cy="76" r="8" />
          <circle cx="80" cy="68" r="8" />
          <circle cx="104" cy="76" r="8" />
          <path d="M50 92c2-9 6-14 10-14s8 5 10 14" />
          <path d="M74 84c2-9 6-14 10-14s8 5 10 14" />
          <path d="M98 92c2-9 6-14 10-14s8 5 10 14" />
          <path d="M58 108v8M102 108v8M80 116v8" />
        </>
      )
    case 'partTime':
      return (
        <>
          <rect x="42" y="72" width="74" height="46" rx="4" />
          <path d="M64 72V60c0-4 3-7 7-7h18c4 0 7 3 7 7v12" />
          <path d="M42 88h74M74 88h16v12H74z" />
          <circle cx="120" cy="52" r="14" />
          <path d="M114 52h12M120 46v12" />
        </>
      )
    case 'sport':
      return (
        <>
          <path d="M48 76v24M40 68v40M56 80v16" />
          <path d="M112 76v24M104 68v40M120 80v16" />
          <path d="M56 88h48" />
          <path d="M34 60l-8-8M126 116l8 8" />
          <path d="M42 48h20M98 122h20" />
        </>
      )
    case 'english':
      return (
        <>
          <path d="M36 72c15-10 29-10 44 0v44c-14-8-29-8-44 0z" />
          <path d="M80 72c14-10 30-10 44 0v44c-15-8-30-8-44 0z" />
          <path d="M80 72v44" />
          <path d="M50 84l6 14M52 94h8M96 84l6 14M98 94h8M68 86h20" />
          <path d="M58 58h18M84 58h18" />
        </>
      )
    case 'kaoyan':
      return (
        <>
          <rect x="40" y="92" width="26" height="14" />
          <rect x="50" y="78" width="34" height="14" />
          <rect x="60" y="64" width="42" height="14" />
          <path d="M96 44l24 12-24 12-24-12z" />
          <path d="M78 58v10c0 4 8 8 18 8s18-4 18-8V58" />
          <path d="M104 68v10M56 116h48" />
        </>
      )
    case 'sleepIn':
      return (
        <>
          <circle cx="76" cy="78" r="31" />
          <path d="M58 54l-8-8M94 54l8-8M76 60v20l13 8M62 120h28" />
          <path d="M106 60h14M110 50h10M116 40h8" />
        </>
      )
    case 'rest':
      return (
        <>
          <path d="M34 98h92v22H34z" />
          <path d="M34 110h92M48 98V80h34v18M88 88h28v10" />
          <path d="M44 120v8M116 120v8" />
          <circle cx="66" cy="78" r="9" />
          <path d="M82 90c0-8 6-14 14-14h12" />
          <path d="M120 54h14M124 44h10" />
        </>
      )
    default:
      return null
  }
}

export function ActionDoodle({ kind }: ActionDoodleProps) {
  return (
    <div className="action-doodle" aria-hidden="true">
      <svg
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        preserveAspectRatio="xMidYMid meet"
      >
        <DoodlePaths kind={kind} />
      </svg>
    </div>
  )
}
