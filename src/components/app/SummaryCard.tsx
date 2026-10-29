export default function SummaryCard({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: number;
  valueClass: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-5">
      <p className="truncate text-xs font-medium text-[#64748B]">{title}</p>

      <p
        className={`mt-1 text-2xl font-extrabold sm:mt-2 sm:text-[28px] ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}
