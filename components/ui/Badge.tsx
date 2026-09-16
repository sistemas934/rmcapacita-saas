import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type BadgeStatus = "APTO" | "PENDIENTE" | "RECHAZADO" | "CONDICIONAL" | "VENCIDO" | "NO_CARGADO" | "APPROVED" | "PENDING" | "REJECTED" | "EXPIRED";

export function Badge({ status }: { status: BadgeStatus | string }) {
  const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider";
  
  // Normalize the status string
  const normalizedStatus = status as BadgeStatus;

  // Map database English statuses to Spanish labels
  const labelMap: Record<string, string> = {
    APPROVED: "APROBADO",
    APTO: "APTO",
    PENDING: "PENDIENTE",
    PENDIENTE: "PENDIENTE",
    REJECTED: "RECHAZADO",
    RECHAZADO: "RECHAZADO",
    EXPIRED: "VENCIDO",
    VENCIDO: "VENCIDO",
    CONDICIONAL: "CONDICIONAL",
    NO_CARGADO: "NO CARGADO",
    INCOMPLETO: "INCOMPLETO",
  };

  // Traffic light colors configuration
  const statusConfig: Record<string, string> = {
    APPROVED: "bg-semantic-success/10 text-semantic-success border-semantic-success/20",
    APTO: "bg-semantic-success/10 text-semantic-success border-semantic-success/20",
    PENDING: "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20",
    PENDIENTE: "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20",
    REJECTED: "bg-semantic-error/10 text-semantic-error border-semantic-error/20",
    RECHAZADO: "bg-semantic-error/10 text-semantic-error border-semantic-error/20",
    CONDICIONAL: "bg-semantic-info/10 text-semantic-info border-semantic-info/20",
    EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
    VENCIDO: "bg-slate-100 text-slate-600 border-slate-200",
    NO_CARGADO: "bg-slate-50 text-slate-400 border-slate-200",
    INCOMPLETO: "bg-slate-100 text-slate-500 border-slate-300",
  };

  const dotColor: Record<string, string> = {
    APPROVED: "bg-semantic-success",
    APTO: "bg-semantic-success",
    PENDING: "bg-semantic-warning",
    PENDIENTE: "bg-semantic-warning",
    REJECTED: "bg-semantic-error",
    RECHAZADO: "bg-semantic-error",
    CONDICIONAL: "bg-semantic-info",
    EXPIRED: "bg-slate-400",
    VENCIDO: "bg-slate-400",
    NO_CARGADO: "bg-transparent",
    INCOMPLETO: "bg-slate-400",
  };

  const finalLabel = labelMap[normalizedStatus] || status.replace("_", " ");
  const currentConfig = statusConfig[normalizedStatus] || "bg-slate-50 text-slate-400 border-slate-200";
  const currentDot = dotColor[normalizedStatus] || "bg-transparent";

  return (
    <span className={twMerge(baseClasses, currentConfig)}>
      {normalizedStatus !== "NO_CARGADO" && (
        <div className={twMerge("w-1.5 h-1.5 rounded-full", currentDot)}></div>
      )}
      {finalLabel}
    </span>
  );
}
