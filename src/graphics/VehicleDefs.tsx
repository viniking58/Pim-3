/** Gradientes e filtros compartilhados por uma instância de veículo. */
export function VehicleDefs({ uid, accent }: { uid: string; accent: string }) {
  return (
    <defs>
      <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="#3a4152" />
        <stop offset="42%" stopColor="#1b1f2a" />
        <stop offset="100%" stopColor="#0a0c11" />
      </linearGradient>

      <linearGradient id={`${uid}-accent`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity="1" />
        <stop offset="100%" stopColor={accent} stopOpacity="0.35" />
      </linearGradient>

      <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
        <stop offset="60%" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      <radialGradient id={`${uid}-halo`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
        <stop offset="100%" stopColor={accent} stopOpacity="0" />
      </radialGradient>

      <linearGradient id={`${uid}-tyre`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2a2f3a" />
        <stop offset="100%" stopColor="#0b0d12" />
      </linearGradient>

      <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
  )
}
