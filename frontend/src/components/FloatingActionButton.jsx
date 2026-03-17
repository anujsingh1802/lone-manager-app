export function FloatingActionButton({ label, onClick }) {
  if (!label || !onClick) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-14 right-3 z-40 flex min-h-12 min-w-12 items-center justify-center rounded-full bg-teal-700 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white shadow-[0_8px_16px_rgba(15,118,110,0.3)] transition active:scale-95 lg:hidden"
    >
      + {label}
    </button>
  );
}
