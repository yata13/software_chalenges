// Small line pictures for picture-questions.
const S = { fill: 'none', stroke: '#F5F5F7', strokeWidth: 1.6 };

const PICS = {
  lb: (
    <>
      <circle cx="24" cy="40" r="6" /><circle cx="24" cy="60" r="6" /><circle cx="24" cy="80" r="6" />
      <path d="M36 60H92M152 60H172M172 24V96M172 24H196M172 60H196M172 96H196" />
      <rect x="96" y="44" width="56" height="32" rx="6" />
      <rect x="200" y="12" width="44" height="24" rx="4" /><rect x="200" y="48" width="44" height="24" rx="4" /><rect x="200" y="84" width="44" height="24" rx="4" />
    </>
  ),
  single: (
    <>
      <circle cx="24" cy="40" r="6" /><circle cx="24" cy="60" r="6" /><circle cx="24" cy="80" r="6" />
      <path d="M36 60H96M152 60H196" /><rect x="100" y="44" width="52" height="32" rx="4" />
      <ellipse cx="220" cy="44" rx="20" ry="6" /><path d="M200 44V76c0 3.3 9 6 20 6s20-2.7 20-6V44" />
    </>
  ),
  replica: (
    <>
      <ellipse cx="70" cy="44" rx="24" ry="7" /><path d="M46 44V80c0 3.9 10.7 7 24 7s24-3.1 24-7V44" />
      <ellipse cx="200" cy="18" rx="20" ry="6" /><path d="M180 18V44c0 3.3 9 6 20 6s20-2.7 20-6V18" />
      <ellipse cx="200" cy="72" rx="20" ry="6" /><path d="M180 72V98c0 3.3 9 6 20 6s20-2.7 20-6V72" />
      <path d="M98 54L176 32M98 70L176 86" strokeDasharray="5 5" />
    </>
  ),
  dns: (
    <>
      <rect x="14" y="36" width="28" height="48" rx="5" />
      <path d="M42 60H96M140 60H172M172 24V96M172 24H196M172 60H196M172 96H196" />
      <circle cx="118" cy="60" r="20" /><path d="M98 60H138M118 40c7 6 7 34 0 40M118 40c-7 6-7 34 0 40" />
      <rect x="200" y="12" width="44" height="24" rx="4" /><rect x="200" y="48" width="44" height="24" rx="4" /><rect x="200" y="84" width="44" height="24" rx="4" />
    </>
  ),
  cpu: (
    <>
      <rect x="70" y="10" width="120" height="100" rx="8" />
      <rect x="82" y="22" width="44" height="34" rx="4" /><rect x="134" y="22" width="44" height="34" rx="4" />
      <rect x="82" y="64" width="44" height="34" rx="4" /><rect x="134" y="64" width="44" height="34" rx="4" />
    </>
  ),
  gpu: (
    <>
      <rect x="60" y="10" width="140" height="100" rx="8" />
      {Array.from({ length: 96 }, (_, k) => <rect key={k} x={68 + (k % 16) * 8} y={18 + Math.floor(k / 16) * 14.5} width="5" height="9" rx="1" />)}
    </>
  ),
  nn: (
    <>
      {[30, 60, 90].map((a) => [20, 50, 80, 100].map((b) => <path key={`${a}${b}`} d={`M70 ${a}L130 ${b}`} strokeOpacity=".4" strokeWidth="1" />))}
      {[20, 50, 80, 100].map((a) => [40, 80].map((b) => <path key={`b${a}${b}`} d={`M130 ${a}L190 ${b}`} strokeOpacity=".4" strokeWidth="1" />))}
      {[30, 60, 90].map((y) => <circle key={y} cx="70" cy={y} r="7" fill="#0D0D12" />)}
      {[20, 50, 80, 100].map((y) => <circle key={y} cx="130" cy={y} r="7" fill="#0D0D12" />)}
      {[40, 80].map((y) => <circle key={y} cx="190" cy={y} r="7" fill="#0D0D12" />)}
    </>
  ),
};

export default function Pic({ name, alt }) {
  return (
    <svg className="pic" viewBox="0 0 260 120" role="img" aria-label={alt} style={S}>
      {PICS[name]}
    </svg>
  );
}
