import { cn } from '@/lib/utils';

interface KPICardProps {
    title: string;
    value: string | number;
    change?: string;
    positive?: boolean;
}

export function KPICard({ title, value, change, positive }: KPICardProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <div className="mt-2 flex items-baseline justify-between">
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                {change && (
                    <span
                        className={cn(
                            'text-sm font-medium',
                            positive ? 'text-green-600' : 'text-red-600'
                        )}
                    >
                        {positive ? '+' : ''}{change}
                    </span>
                )}
            </div>
        </div>
    );
}
