interface FilterButtonProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function FilterButton({
  active,
  onClick,
  children,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-full bg-[#1E3A8A] px-4 text-xs font-semibold text-white sm:h-8"
          : "h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-full border border-[#E2E8F0] bg-white px-4 text-xs font-medium text-[#64748B] transition hover:border-[#1E3A8A] hover:text-[#1E3A8A] sm:h-8"
      }
    >
      {children}
    </button>
  );
}
