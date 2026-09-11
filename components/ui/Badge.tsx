import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type BadgeStatus = "APTO" | "PENDIENTE" | "RECHAZADO" | "CONDICIONAL" | "VENCIDO" | "NO_CARGADO";

export function Badge({ status }: { status: BadgeStatus }) {
  const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider";
  
  const statusConfig: Record<BadgeStatus, string> = {
    APTO: "bg-semantic-success/10 text-semantic-success border-semantic-success/20",
    PENDIENTE: "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20",
    RECHAZADO: "bg-semantic-error/10 text-semantic-error border-semantic-error/20",
    CONDICIONAL: "bg-semantic-info/10 text-semantic-info border-semantic-info/20",
    VENCIDO: "bg-slate-100 text-slate-600 border-slate-200",
    NO_CARGADO: "bg-slate-50 text-slate-400 border-slate-200",
  };

  const dotColor: Record<BadgeStatus, string> = {
    APTO: "bg-semantic-success",
    PENDIENTE: "bg-semantic-warning",
    RECHAZADO: "bg-semantic-error",
    CONDICIONAL: "bg-semantic-info",
    VENCIDO: "bg-slate-400",
    NO_CARGADO: "bg-transparent",
  };

  const label = status.replace("_", " ");

  return (
    <span className={twMerge(baseClasses, statusConfig[status])}>
      {status !== "NO_CARGADO" && (
        <div className={twMerge("w-1.5 h-1.5 rounded-full", dotColor[status])}></div>
      )}
      {label}
    </span>
  );
}
