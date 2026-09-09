import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { VehicleDefs } from './VehicleDefs'
import { Wheel } from './Wheel'
import './vehicle.css'

export type VehicleType = 'jetski' | 'utv' | 'utvUtility' | 'atv' | 'roadster' | 'pontoon'

type VehicleProps = {
  type: VehicleType
  /** Cor de acento da linha (Sea-Doo, Can-Am, Switch…). */
  accent?: string
  /** Liga rodas girando, balanço e respingos. */
  animate?: boolean
  className?: string
  title?: string
}

/**
 * Ilustrações vetoriais autorais das linhas vendidas pela loja.
 * Cada veículo é montado por camadas para que rodas, suspensão e água
 * possam ser animadas de forma independente.
 */
export function Vehicle({ type, accent = '#ff2d18', animate = true, className, title }: VehicleProps) {
  const reactId = useId()
  const uid = `v${reactId.replace(/[^a-zA-Z0-9]/g, '')}`
  const reduced = useReducedMotion()
  const live = animate && !reduced

  const isWater = type === 'jetski' || type === 'pontoon'

  return (
    <svg
      className={`vehicle vehicle--${type}${className ? ` ${className}` : ''}`}
      viewBox="0 0 420 220"
      role="img"
      aria-label={title ?? 'Ilustração do veículo'}
      preserveAspectRatio="xMidYMid meet"
    >
      <VehicleDefs uid={uid} accent={accent} />

      {/* Halo de luz sob o veículo */}
      <ellipse cx="210" cy="188" rx="168" ry="20" fill={`url(#${uid}-halo)`} opacity="0.7" />

      <motion.g
        animate={live ? { y: [0, -5, 0] } : { y: 0 }}
        transition={live ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        {type === 'jetski' && <JetSki uid={uid} accent={accent} />}
        {type === 'utv' && <Utv uid={uid} accent={accent} live={live} variant="sport" />}
        {type === 'utvUtility' && <Utv uid={uid} accent={accent} live={live} variant="utility" />}
        {type === 'atv' && <Atv uid={uid} accent={accent} live={live} />}
        {type === 'roadster' && <Roadster uid={uid} accent={accent} live={live} />}
        {type === 'pontoon' && <Pontoon uid={uid} accent={accent} />}
      </motion.g>

      {isWater ? <Water uid={uid} accent={accent} live={live} /> : <SpeedLines accent={accent} live={live} />}
    </svg>
  )
}

/* ------------------------------------------------------------------ Jet ski */

function JetSki({ uid, accent }: { uid: string; accent: string }) {
  return (
    <g>
      {/* Casco */}
      <path
        d="M44 150 L58 120 L206 104 L300 108 L392 142 L378 166 Q300 178 180 174 L66 166 Z"
        fill={`url(#${uid}-body)`}
        stroke="#000"
        strokeOpacity="0.5"
      />
      {/* Faixa de acento no casco */}
      <path
        d="M74 154 L214 144 L306 148 L364 162 Q300 172 180 170 L80 162 Z"
        fill={`url(#${uid}-accent)`}
        opacity="0.9"
      />
      {/* Convés e banco */}
      <path
        d="M112 110 Q158 80 224 86 L272 98 L276 114 L112 120 Z"
        fill="#171b24"
        stroke="#000"
        strokeOpacity="0.4"
      />
      <path d="M120 106 Q162 86 218 92 L246 99 L246 106 L120 112 Z" fill="#222834" />
      {/* Brilho do gelcoat */}
      <path d="M62 122 L204 107 L294 111 L316 120 L64 130 Z" fill={`url(#${uid}-gloss)`} />

      {/* Coluna do guidão */}
      <path d="M268 100 L286 74 L300 78 L282 106 Z" fill="#141821" />
      <rect x="272" y="62" width="52" height="9" rx="4.5" fill="#2c3340" transform="rotate(-8 298 66)" />
      <circle cx="330" cy="60" r="5" fill={accent} />
      {/* Para-brisa */}
      <path d="M292 78 L318 66 L326 78 L300 88 Z" fill="#7fd4ff" opacity="0.25" />
      {/* Bico */}
      <path d="M322 112 L392 142 L380 156 L318 128 Z" fill="#20242f" />
      <circle cx="356" cy="132" r="4" fill={accent} opacity="0.9" />
      {/* Alça traseira */}
      <rect x="58" y="112" width="34" height="7" rx="3.5" fill="#2c3340" />
    </g>
  )
}

/* ---------------------------------------------------------------------- UTV */

function Utv({
  uid,
  accent,
  live,
  variant,
}: {
  uid: string
  accent: string
  live: boolean
  /** `sport` = biposto baixo (Maverick); `utility` = cabine + caçamba (Defender). */
  variant: 'sport' | 'utility'
}) {
  const utility = variant === 'utility'

  return (
    <g>
      {/* Braços de suspensão */}
      <path d="M136 140 L96 152 M136 156 L96 152" stroke="#39404f" strokeWidth="7" strokeLinecap="round" />
      <path d="M284 140 L324 152 M284 156 L324 152" stroke="#39404f" strokeWidth="7" strokeLinecap="round" />

      <Wheel uid={uid} cx={96} cy={152} r={46} accent={accent} spin={live} duration={0.85} />
      <Wheel uid={uid} cx={324} cy={152} r={46} accent={accent} spin={live} duration={0.85} />

      {/* Carroceria */}
      <path
        d={
          utility
            ? 'M108 158 L112 108 L176 104 L196 118 L288 116 L308 96 L352 104 L360 130 L356 158 Q240 168 108 158 Z'
            : 'M112 156 L118 122 L150 116 L286 114 L306 96 L352 104 L360 130 L356 158 Q240 168 112 158 Z'
        }
        fill={`url(#${uid}-body)`}
        stroke="#000"
        strokeOpacity="0.5"
      />

      {/* Caçamba basculante da versão utilitária */}
      {utility && (
        <>
          <path d="M108 108 L176 104 L178 152 L110 154 Z" fill="#12161e" stroke="#000" strokeOpacity="0.45" />
          <path d="M114 114 L172 111 L173 122 L115 125 Z" fill={`url(#${uid}-accent)`} opacity="0.8" />
          <rect x="106" y="104" width="74" height="6" rx="3" fill="#454e5f" />
        </>
      )}
      {/* Porta com painel de acento */}
      <path d="M158 152 L164 124 L246 122 L250 152 Z" fill={`url(#${uid}-accent)`} opacity="0.95" />
      <path d="M158 152 L164 124 L246 122 L250 152 Z" fill="none" stroke="#000" strokeOpacity="0.35" />

      {/* Gaiola de proteção (teto reto na versão de trabalho) */}
      <path
        d={
          utility
            ? 'M186 118 L188 58 Q188 50 198 50 L286 50 Q296 50 297 58 L300 118'
            : 'M132 120 L152 56 Q155 48 166 48 L268 48 Q278 48 281 57 L298 118'
        }
        fill="none"
        stroke="#4e5768"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {utility && <rect x="182" y="44" width="122" height="9" rx="4" fill="#3d4553" />}
      <path d="M166 50 L182 118 M252 50 L268 118" stroke="#3d4553" strokeWidth="6" strokeLinecap="round" />
      {/* Barra de LEDs */}
      <rect x="176" y="40" width="86" height="9" rx="4.5" fill="#1c212b" />
      <rect x="180" y="42.5" width="78" height="4" rx="2" fill="#dbe7ff" opacity="0.85" />

      {/* Bancos concha */}
      <path d="M186 118 L190 82 L206 80 L208 118 Z" fill="#232a36" />
      <path d="M228 118 L232 82 L248 80 L250 118 Z" fill="#232a36" />

      {/* Capô e farol */}
      <path d="M306 98 L350 106 L356 124 L304 118 Z" fill="#1a1f29" />
      <rect x="330" y="112" width="26" height="12" rx="5" fill={accent} />
      <rect x="330" y="112" width="26" height="12" rx="5" fill="#fff" opacity="0.35" />
      {/* Estribo */}
      <rect x="150" y="152" width="112" height="8" rx="4" fill="#12151d" />
    </g>
  )
}

/* ---------------------------------------------------------------------- ATV */

function Atv({ uid, accent, live }: { uid: string; accent: string; live: boolean }) {
  return (
    <g>
      <Wheel uid={uid} cx={110} cy={152} r={44} accent={accent} spin={live} duration={0.9} lugs={14} />
      <Wheel uid={uid} cx={312} cy={152} r={44} accent={accent} spin={live} duration={0.9} lugs={14} />

      {/* Chassi central */}
      <path d="M132 154 L140 122 L292 120 L302 154 Z" fill="#151922" />

      {/* Para-lamas */}
      <path
        d="M56 152 A54 54 0 0 1 164 152 L164 160 L56 160 Z"
        fill={`url(#${uid}-body)`}
        stroke="#000"
        strokeOpacity="0.45"
      />
      <path
        d="M258 152 A54 54 0 0 1 366 152 L366 160 L258 160 Z"
        fill={`url(#${uid}-body)`}
        stroke="#000"
        strokeOpacity="0.45"
      />
      <path d="M66 146 A44 44 0 0 1 154 146 L154 152 L66 152 Z" fill={`url(#${uid}-accent)`} opacity="0.9" />
      <path d="M268 146 A44 44 0 0 1 356 146 L356 152 L268 152 Z" fill={`url(#${uid}-accent)`} opacity="0.9" />

      {/* Banco */}
      <path d="M146 122 Q168 96 214 94 L252 98 L256 122 Z" fill="#1e2530" />
      <path d="M152 118 Q172 100 212 99 L240 103 L242 112 L152 116 Z" fill="#2a3240" />
      {/* Tanque / capô dianteiro */}
      <path d="M252 118 L262 88 L300 84 L312 118 Z" fill="#1a1f29" />
      <path d="M262 90 L298 86 L300 96 L264 100 Z" fill={`url(#${uid}-gloss)`} />

      {/* Guidão */}
      <path d="M282 88 L288 58" stroke="#39404f" strokeWidth="7" strokeLinecap="round" />
      <rect x="256" y="50" width="70" height="8" rx="4" fill="#2c3340" transform="rotate(-4 291 54)" />
      <circle cx="322" cy="52" r="4.5" fill={accent} />
      {/* Farol */}
      <path d="M312 96 L342 100 L344 114 L314 112 Z" fill="#dbe7ff" opacity="0.85" />
      {/* Bagageiros */}
      <rect x="92" y="98" width="66" height="7" rx="3.5" fill="#333b49" />
      <rect x="300" y="72" width="54" height="7" rx="3.5" fill="#333b49" />
      {/* Escapamento */}
      <rect x="120" y="132" width="44" height="10" rx="5" fill="#4a525f" />
    </g>
  )
}

/* ----------------------------------------------------------------- Roadster */

function Roadster({ uid, accent, live }: { uid: string; accent: string; live: boolean }) {
  return (
    <g>
      {/* Roda dianteira interna (triciclo em Y) */}
      <g opacity="0.45">
        <Wheel uid={uid} cx={286} cy={158} r={34} accent={accent} spin={live} duration={0.75} lugs={12} />
      </g>

      <Wheel uid={uid} cx={110} cy={156} r={40} accent={accent} spin={live} duration={0.75} lugs={12} />
      <Wheel uid={uid} cx={324} cy={156} r={40} accent={accent} spin={live} duration={0.75} lugs={12} />

      {/* Braço oscilante */}
      <path d="M150 140 L112 156" stroke="#39404f" strokeWidth="9" strokeLinecap="round" />
      {/* Suspensão dianteira em A */}
      <path d="M280 128 L324 150 M280 144 L324 160" stroke="#39404f" strokeWidth="7" strokeLinecap="round" />

      {/* Carenagem */}
      <path
        d="M92 148 L108 116 L166 104 L246 96 L286 72 L322 84 L336 120 L330 148 Q240 160 150 156 Z"
        fill={`url(#${uid}-body)`}
        stroke="#000"
        strokeOpacity="0.5"
      />
      <path d="M172 132 L250 116 L292 100 L306 122 L232 142 L176 146 Z" fill={`url(#${uid}-accent)`} />
      <path d="M112 118 L168 106 L244 98 L282 76 L292 82 L250 106 L172 118 L118 130 Z" fill={`url(#${uid}-gloss)`} />

      {/* Banco */}
      <path d="M126 116 Q152 92 196 92 L214 98 L212 112 L128 124 Z" fill="#1f2531" />
      {/* Guidão */}
      <path d="M264 92 L272 66" stroke="#39404f" strokeWidth="7" strokeLinecap="round" />
      <rect x="240" y="58" width="66" height="8" rx="4" fill="#2c3340" transform="rotate(-6 273 62)" />
      {/* Farol e para-brisa */}
      <path d="M290 76 L318 86 L326 104 L296 96 Z" fill="#dbe7ff" opacity="0.9" />
      <path d="M272 68 L296 60 L302 74 L278 80 Z" fill="#7fd4ff" opacity="0.25" />
      <circle cx="316" cy="96" r="5" fill={accent} />
    </g>
  )
}

/* ------------------------------------------------------------------ Pontoon */

function Pontoon({ uid, accent }: { uid: string; accent: string }) {
  return (
    <g>
      {/* Flutuadores */}
      <path d="M52 156 L360 156 Q380 156 380 166 Q380 176 358 176 L60 176 Q40 176 44 166 Z" fill="#20252f" />
      <path d="M60 160 L354 160 Q368 160 368 166 L58 166 Z" fill={`url(#${uid}-accent)`} opacity="0.75" />

      {/* Convés */}
      <rect x="44" y="132" width="336" height="16" rx="5" fill={`url(#${uid}-body)`} />
      <rect x="44" y="132" width="336" height="5" rx="2.5" fill="#4b5364" opacity="0.5" />

      {/* Guarda-corpo */}
      <path
        d="M52 132 L52 106 M120 132 L120 106 M198 132 L198 106 M276 132 L276 106 M356 132 L356 106"
        stroke="#3d4553"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="48" y="102" width="312" height="5" rx="2.5" fill="#5a6375" />

      {/* Console */}
      <path d="M232 132 L236 92 L288 88 L292 132 Z" fill="#1a1f29" />
      <rect x="242" y="98" width="40" height="20" rx="4" fill="#7fd4ff" opacity="0.28" />
      {/* Banco do piloto */}
      <path d="M190 132 L194 108 L222 106 L224 132 Z" fill="#232a36" />
      {/* Sofá de proa */}
      <path d="M62 132 L66 112 L140 110 L142 132 Z" fill="#232a36" />

      {/* Toldo bimini */}
      <path d="M168 66 Q248 52 330 66 L330 74 Q248 60 168 74 Z" fill={accent} opacity="0.9" />
      <path d="M176 70 L192 106 M320 70 L306 106" stroke="#4e5768" strokeWidth="4" strokeLinecap="round" />
      {/* Mastro com bandeira */}
      <path d="M96 110 L96 58" stroke="#5a6375" strokeWidth="3" strokeLinecap="round" />
      <path d="M96 60 L128 68 L96 78 Z" fill={accent} />
    </g>
  )
}

/* -------------------------------------------------------------- Ambientação */

/** Esteira, ondas e respingos para as linhas náuticas. */
function Water({ uid, accent, live }: { uid: string; accent: string; live: boolean }) {
  const droplets = [
    { cx: 30, cy: 150, r: 4, delay: 0 },
    { cx: 18, cy: 132, r: 3, delay: 0.35 },
    { cx: 42, cy: 122, r: 2.5, delay: 0.7 },
    { cx: 10, cy: 158, r: 3.5, delay: 1.05 },
    { cx: 34, cy: 106, r: 2, delay: 1.4 },
  ]

  return (
    <g>
      {/* Espuma sob o casco */}
      <motion.path
        d="M20 178 Q80 168 150 178 T286 178 T410 176"
        fill="none"
        stroke={`url(#${uid}-water)`}
        strokeWidth="4"
        strokeLinecap="round"
        animate={live ? { x: [0, -28, 0], opacity: [0.5, 0.9, 0.5] } : undefined}
        transition={live ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
      />
      <motion.path
        d="M0 190 Q70 180 140 190 T280 190 T420 188"
        fill="none"
        stroke={accent}
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
        animate={live ? { x: [0, 26, 0] } : undefined}
        transition={live ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      />

      {/* Respingos saindo da popa */}
      {droplets.map((drop, index) => (
        <motion.circle
          key={index}
          cx={drop.cx}
          cy={drop.cy}
          r={drop.r}
          fill="#ffffff"
          initial={{ opacity: 0 }}
          animate={live ? { opacity: [0, 0.8, 0], x: [0, -26], y: [0, -18] } : { opacity: 0 }}
          transition={
            live
              ? { duration: 1.7, repeat: Infinity, delay: drop.delay, ease: 'easeOut' }
              : undefined
          }
        />
      ))}
    </g>
  )
}

/** Rastros de velocidade para as linhas terrestres. */
function SpeedLines({ accent, live }: { accent: string; live: boolean }) {
  const lines = [
    { y: 86, w: 60, delay: 0 },
    { y: 116, w: 96, delay: 0.25 },
    { y: 146, w: 72, delay: 0.5 },
    { y: 172, w: 110, delay: 0.15 },
  ]

  return (
    <g opacity="0.55">
      {lines.map((line, index) => (
        <motion.rect
          key={index}
          x={0}
          y={line.y}
          width={line.w}
          height="2.5"
          rx="1.25"
          fill={accent}
          initial={{ opacity: 0, x: 40 }}
          animate={live ? { opacity: [0, 0.85, 0], x: [40, -70] } : { opacity: 0 }}
          transition={
            live
              ? { duration: 1.25, repeat: Infinity, delay: line.delay, ease: 'easeIn' }
              : undefined
          }
        />
      ))}
    </g>
  )
}
