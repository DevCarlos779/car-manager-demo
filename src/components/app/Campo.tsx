export default function Campo({
  label,
  valor,
}: {
  label: string;
  valor: string | number;
}) {
  return (
    <div className="min-w-0">
      <div className="text-xs uppercase text-[#64748B]">{label}</div>
      <div className="break-words text-sm font-semibold text-[#0F172A]">
        {valor}
      </div>
    </div>
  );
}
