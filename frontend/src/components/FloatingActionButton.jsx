export function FloatingActionButton({ label, onClick }) {
  if (!label || !onClick) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-28 right-4 z-40 flex min-h-14 min-w-14 items-center justify-center rounded-full bg-teal-700 px-5 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(15,118,110,0.35)] transition active:scale-95 lg:hidden"
    >
      + {label}
    </button>
  );
}
