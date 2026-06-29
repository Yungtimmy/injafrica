// components/PointsTicker.tsx
export default function PointsTicker() {
  const items = [
    { label: 'Win', pts: '+1' },
    { label: 'Draw', pts: '+3' },
    { label: 'Correct Score', pts: '+5' },
    { label: 'Qualifiers', pts: '+2' },
  ];

  // Duplicate for seamless loop
  const repeated = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden bg-sb-yellow py-1.5 flex items-center">
      {/* Left fade */}
      <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-sb-yellow to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-sb-yellow to-transparent z-10 pointer-events-none" />

      <div className="flex animate-ticker whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 mx-6 text-xs font-black text-black uppercase tracking-wider">
            <span>{item.label}</span>
            <span className="bg-black text-sb-yellow rounded px-1.5 py-0.5 text-[10px] font-black">
              {item.pts} pts
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
