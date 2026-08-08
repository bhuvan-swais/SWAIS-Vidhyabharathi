// Brand lockup: sun-ray mandala monogram + "SWAIS" wordmark + tagline.
export default function SwaisLogo({ variant = "dark", showTagline = true, size = 52 }) {
  const light = variant === "light";
  return (
    <div className="brand" aria-label="SWAIS VidhyaBharathi">
      <Monogram size={size} light={light} />
      <div>
        <div className="brand-wm" style={light ? { color: "#fff" } : undefined}>SWAIS</div>
        {showTagline && (
          <div className="brand-tag" style={light ? { color: "rgba(255,255,255,.85)" } : undefined}>
            <b className="dev">सा विद्या या विमुक्तये</b> · Learning that liberates
          </div>
        )}
      </div>
    </div>
  );
}

function Monogram({ size = 52, light = false }) {
  const ring = light ? "#fff" : "#F28C28";
  const ray = light ? "rgba(255,255,255,.9)" : "#C0562A";
  const letter = light ? "#fff" : "#C0562A";
  return (
    <svg className="monogram" width={size} height={size} viewBox="0 0 64 64" role="img" aria-hidden="true">
      <g fill="none" stroke={ring} strokeWidth="1.5">
        <circle cx="32" cy="32" r="30" />
        <circle cx="32" cy="32" r="22" />
      </g>
      <g stroke={ray} strokeWidth="1.5">
        <line x1="32" y1="2" x2="32" y2="10" /><line x1="32" y1="54" x2="32" y2="62" />
        <line x1="2" y1="32" x2="10" y2="32" /><line x1="54" y1="32" x2="62" y2="32" />
        <line x1="11" y1="11" x2="17" y2="17" /><line x1="47" y1="47" x2="53" y2="53" />
        <line x1="53" y1="11" x2="47" y2="17" /><line x1="11" y1="53" x2="17" y2="47" />
      </g>
      <text x="32" y="42" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="26" fontWeight="700" fill={letter}>S</text>
    </svg>
  );
}
