interface ActionDoodleProps {
  kind: string
}

/**
 * Single-colour comic-style line art. Thick contours, medium details and thin
 * hatching share one ink colour, with a few solid accent shapes for contrast.
 */
function DoodlePaths({ kind }: ActionDoodleProps) {
  switch (kind) {
    case 'library':
      return (
        <>
          <path className="d-thick" d="M26 48c16-10 32-10 46 0v66c-14-8-30-8-46 0z" />
          <path className="d-thick" d="M72 48c14-10 32-10 48 0v66c-16-8-32-8-48 0z" />
          <path className="d-fill" d="M26 48c16-10 32-10 46 0v9c-14-8-30-8-46 0zM72 48c14-10 32-10 48 0v9c-16-8-32-8-48 0z" />
          <path className="d-main" d="M72 48v66M40 65h22M40 77h18M88 65h22M92 77h18M52 94h10M96 94h10" />
          <path className="d-fine" d="M38 54c10-4 20-4 28 0M84 54c10-4 20-4 28 0M44 87h9M100 87h9M56 34h28v13H56zM62 34v13M78 34v13" />
          <path className="d-fine" d="M116 28l7-9M124 38h10M118 48l5 7M18 40l-6-8" />
        </>
      )
    case 'electiveHomework':
      return (
        <>
          <rect className="d-thick" x="42" y="42" width="70" height="86" rx="5" />
          <path className="d-thick" d="M58 42v-8h34v8" />
          <path className="d-fill" d="M58 42v-8h34v8z" />
          <path className="d-main" d="M56 66l7 7 13-15M56 88l7 7 13-15M86 74h16M86 96h16" />
          <path className="d-fine" d="M50 54h12M50 118h42M100 54h6M50 63h3M50 76h3M50 89h3M50 102h3" />
          <path className="d-thick" d="M104 103l20 20 8-30" />
          <path className="d-main" d="M112 111l8 4 8-12" />
          <path className="d-fine" d="M126 36l8-8M130 48h9M30 52l-7-7" />
        </>
      )
    case 'research':
      return (
        <>
          <path className="d-thick" d="M62 34h30v20l23 52c5 12-4 24-17 24H56c-13 0-22-12-17-24l23-52z" />
          <path className="d-fill" d="M52 104c8-6 18-6 26 0s18 6 26 0l8 18c4 9-3 18-14 18H56c-11 0-18-9-14-18z" />
          <path className="d-main" d="M55 92h44M69 34v18M84 34v18M69 52l-8 20M84 52l8 20" />
          <path className="d-fine" d="M58 112c7-4 14 4 21 0s14 4 21 0M64 122h28M60 104h8M88 108h8" />
          <circle className="d-thick" cx="78" cy="80" r="7" />
          <circle className="d-fill" cx="96" cy="68" r="4" />
          <circle className="d-main" cx="58" cy="66" r="2.5" />
          <path className="d-fine" d="M118 34l8-8M126 44h8M120 54l6 5M30 42l-8-6" />
        </>
      )
    case 'club':
      return (
        <>
          <path className="d-thick" d="M80 32v38M80 32l25 10-25 11" />
          <path className="d-fill" d="M80 32l25 10-25 11z" />
          <circle className="d-thick" cx="52" cy="74" r="12" />
          <circle className="d-fill" cx="52" cy="74" r="12" />
          <circle className="d-thick" cx="92" cy="78" r="10" />
          <circle className="d-fill" cx="92" cy="78" r="10" />
          <path className="d-thick" d="M28 112c4-15 12-23 24-23s20 8 24 23M76 112c4-13 12-21 22-21s18 8 22 21" />
          <path className="d-main" d="M44 68l-5-5M60 68l5-5M86 74l5-4M70 92l10-6M36 102l-10 2M118 102l9 3" />
          <path className="d-fine" d="M32 122h30M88 122h26M60 54l8-4M102 58l7-3" />
        </>
      )
    case 'soloInvite':
      return (
        <>
          <path className="d-thick" d="M24 52h64v38H58L42 104V90H24z" />
          <path className="d-fill" d="M24 52h64v38H58L42 104V90H24z" />
          <path className="d-thick" d="M70 86h62v34H96l-14 14V120H70z" />
          <path className="d-main" d="M40 66h34M40 76h24M84 98h34M84 108h24" />
          <path className="d-fine" d="M40 44l7-9M118 34l-5 10M130 74l9-4M32 116l-7 8" />
          <path className="d-fine" d="M62 46c2-5 8-5 10 0M110 78c2-5 8-5 10 0" />
        </>
      )
    case 'social':
      return (
        <>
          <ellipse className="d-thick" cx="80" cy="106" rx="48" ry="13" />
          <path className="d-fill" d="M32 106c0-7 22-13 48-13s48 6 48 13-22 13-48 13-48-6-48-13z" />
          <circle className="d-thick" cx="54" cy="72" r="9" />
          <circle className="d-fill" cx="54" cy="72" r="9" />
          <circle className="d-thick" cx="80" cy="64" r="9" />
          <circle className="d-fill" cx="80" cy="64" r="9" />
          <circle className="d-thick" cx="106" cy="72" r="9" />
          <circle className="d-fill" cx="106" cy="72" r="9" />
          <path className="d-thick" d="M44 96c2-10 6-16 10-16s8 6 10 16M70 88c2-10 6-16 10-16s8 6 10 16M96 96c2-10 6-16 10-16s8 6 10 16" />
          <path className="d-main" d="M44 112h16M100 112h16M76 114h8M60 58l-5-5M86 50l5-5M112 58l5-5" />
          <path className="d-fine" d="M48 82c1-3 4-3 5 0M74 74c1-3 4-3 5 0M100 82c1-3 4-3 5 0M44 44l4-7M116 42l6-6" />
        </>
      )
    case 'partTime':
      return (
        <>
          <rect className="d-thick" x="34" y="68" width="82" height="52" rx="5" />
          <path className="d-fill" d="M34 68h82v13H34z" />
          <path className="d-thick" d="M56 68V55c0-5 4-9 9-9h22c5 0 9 4 9 9v13" />
          <path className="d-main" d="M34 92h82M70 92h14v14H70zM46 80h14M96 80h10" />
          <path className="d-fine" d="M46 108h10M98 108h8M44 60l-7-7M112 58l8-8" />
          <circle className="d-thick" cx="126" cy="42" r="16" />
          <circle className="d-fine" cx="126" cy="42" r="11" />
          <path className="d-main" d="M119 42h14M126 35v14" />
          <path className="d-fine" d="M120 30l-4-6M138 52l7 4" />
        </>
      )
    case 'sport':
      return (
        <>
          <path className="d-thick" d="M44 78v22M32 66v44M56 84v12" />
          <path className="d-thick" d="M116 78v22M128 66v44M104 84v12" />
          <path className="d-thick" d="M56 89h48" />
          <path className="d-fill" d="M32 66h10v44H32zM118 66h10v44h-10z" />
          <path className="d-main" d="M44 76h12M44 102h12M104 76h12M104 102h12M72 78v22" />
          <path className="d-fine" d="M26 52l-10-8M132 132l9 7M40 44l-6-7M128 58l9-6M22 116h22M118 28l6-8" />
          <path className="d-fill" d="M140 72l5-2-2 6z" />
        </>
      )
    case 'english':
      return (
        <>
          <path className="d-thick" d="M28 70c17-11 34-11 52 0v46c-16-9-34-9-52 0z" />
          <path className="d-thick" d="M80 70c18-11 35-11 52 0v46c-18-9-35-9-52 0z" />
          <path className="d-fill" d="M28 70c17-11 34-11 52 0v9c-16-9-34-9-52 0zM80 70c18-11 35-11 52 0v9c-18-9-35-9-52 0z" />
          <path className="d-thick" d="M80 70v46" />
          <path className="d-main" d="M44 82l7 17M47 94h10M103 82l7 17M106 94h10M68 84h18M72 84v15M88 84v15M88 99h-16" />
          <path className="d-fine" d="M42 108h20M96 108h22M102 56h14M110 48v16M48 52h14M55 45v14" />
          <path className="d-fine" d="M22 60l-7-8M142 62l7-8" />
        </>
      )
    case 'kaoyan':
      return (
        <>
          <rect className="d-thick" x="32" y="94" width="32" height="16" />
          <rect className="d-thick" x="46" y="78" width="42" height="16" />
          <rect className="d-thick" x="60" y="62" width="50" height="16" />
          <path className="d-fill" d="M32 94h32v6H32zM46 78h42v6H46zM60 62h50v6H60z" />
          <path className="d-thick" d="M102 42l30 14-30 14-30-14z" />
          <path className="d-fill" d="M102 42l30 14-30 14-30-14z" />
          <path className="d-main" d="M78 58v15c0 5 10 10 24 10s24-5 24-10V58M132 56v22M132 78c0 6-4 10-9 10" />
          <path className="d-fine" d="M48 126h64M40 114h20M72 94h16M88 78h20" />
          <path className="d-fine" d="M132 28l5-8M140 42h10M24 72l-7-6M122 104l7 6" />
        </>
      )
    case 'sleepIn':
      return (
        <>
          <circle className="d-thick" cx="72" cy="82" r="34" />
          <circle className="d-fill" cx="72" cy="82" r="27" />
          <path className="d-main" d="M72 62v22l14 8M58 52l-7-7M86 52l7-7M42 82h6M96 82h6" />
          <path className="d-thick" d="M106 58h16M112 46h12M120 34h8" />
          <path className="d-fine" d="M50 112l-8 8M94 112l8 8M58 122h28M28 68l-8-4M116 90l8 4" />
          <path className="d-fine" d="M46 94c4 8 10 14 18 18M100 98c-4 8-10 14-18 18" />
        </>
      )
    case 'rest':
      return (
        <>
          <path className="d-thick" d="M24 98h112v24H24z" />
          <path className="d-fill" d="M24 98h112v10H24z" />
          <path className="d-thick" d="M24 108V80h34v18M86 84h34v14" />
          <path className="d-main" d="M24 122v10M136 122v10M54 98V86h24v12" />
          <circle className="d-thick" cx="54" cy="78" r="11" />
          <circle className="d-fill" cx="54" cy="78" r="11" />
          <path className="d-thick" d="M72 92c0-8 7-14 16-14h14" />
          <path className="d-fine" d="M112 60h16M118 48h12M126 38h8M28 68l-8-6M84 72l6-8" />
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
        strokeLinecap="round"
        strokeLinejoin="round"
        preserveAspectRatio="xMidYMid meet"
      >
        <DoodlePaths kind={kind} />
      </svg>
    </div>
  )
}
