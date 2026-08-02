'use client';
interface Props { active: boolean; onToggle: () => void; }

export default function Toggle({ active, onToggle }: Props) {
  return (
    <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors ${active ? 'bg-[#0EA5E9]' : 'bg-slate-200'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
    </button>
  );
}
