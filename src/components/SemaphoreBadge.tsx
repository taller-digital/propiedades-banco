import { type SemaphoreStatus, getDaysRemaining, semaphoreLabels } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SemaphoreBadgeProps {
  status: SemaphoreStatus;
  dueDate: string;
  showDays?: boolean;
  size?: 'sm' | 'md';
}

const statusClasses: Record<SemaphoreStatus, string> = {
  al_dia: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  por_vencer: 'bg-amber-50 text-amber-700 border-amber-200',
  vencido: 'bg-red-50 text-red-700 border-red-200',
};

const dotClasses: Record<SemaphoreStatus, string> = {
  al_dia: 'bg-emerald-500',
  por_vencer: 'bg-amber-500',
  vencido: 'bg-red-500',
};

export default function SemaphoreBadge({ status, dueDate, showDays = true, size = 'md' }: SemaphoreBadgeProps) {
  const days = getDaysRemaining(dueDate);
  const label = semaphoreLabels[status];
  const daysText = days < 0
    ? `Vencido hace ${Math.abs(days)} día(s)`
    : days === 0
    ? 'Vence hoy'
    : `Vence en ${days} día(s)`;

  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center font-semibold rounded-full border ${statusClasses[status]} ${sizeClasses}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[status]} shrink-0`} />
            <span>{label}</span>
            {showDays && (
              <span className="font-normal opacity-75 ml-0.5">
                {days < 0 ? `(${Math.abs(days)}d)` : days === 0 ? '(hoy)' : `(${days}d)`}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{daysText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
