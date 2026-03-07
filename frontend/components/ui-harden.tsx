'use client';

import { LucideIcon, Search, AlertCircle } from 'lucide-react';
import { Button } from './ui/button'; // Assuming button exists in ui/ (wait, check list_dir)

export const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-4 w-full">
        <div className="flex items-center justify-between space-x-4">
            <Skeleton className="h-10 w-[250px]" />
            <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 h-10 border-b" />
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="h-16 border-b flex items-center px-4 space-x-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/8" />
                </div>
            ))}
        </div>
    </div>
);

export const EmptyState = ({
    icon: Icon = Search,
    title,
    description,
    actionLabel,
    onAction,
}: {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}) => (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl border-gray-100 bg-gray-50/50">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
        {actionLabel && onAction && (
            <Button onClick={onAction}>{actionLabel}</Button>
        )}
    </div>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <h3 className="text-sm font-medium text-red-900 mb-1">Something went wrong</h3>
        <p className="text-xs text-red-600 mb-4">{message}</p>
        {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="bg-white border-red-200 text-red-700 hover:bg-red-50">
                Try Again
            </Button>
        )}
    </div>
);

import { Badge } from './ui/badge';
import { Pagination } from './pagination';

export type BadgeStatus = 'ACTIVE' | 'SUSPENDED' | 'PAST_DUE' | 'CANCELED' | 'TRIAL' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'PAID' | 'UNPAID' | 'PENDING';

export const StatusBadge = ({ status, className }: { status: BadgeStatus | string; className?: string }) => {
    const getVariant = (s: string) => {
        const up = s.toUpperCase();
        if (['ACTIVE', 'PAID', 'SUCCESS', 'CLOSED'].includes(up)) return 'success';
        if (['PAST_DUE', 'WARNING', 'IN_PROGRESS', 'PENDING'].includes(up)) return 'warning';
        if (['SUSPENDED', 'CANCELED', 'ERROR', 'UNPAID', 'DESTRUCTIVE'].includes(up)) return 'destructive';
        if (['TRIAL', 'INFO', 'OPEN'].includes(up)) return 'info';
        return 'secondary';
    };

    return (
        <Badge variant={getVariant(status) as any} className={`rounded-lg px-2.5 py-1 text-[10px] font-black tracking-widest border-none ${className}`}>
            {status.toUpperCase().replace(/_/g, ' ')}
        </Badge>
    );
};

interface DataTableProps<T> {
    columns: {
        header: string;
        accessor?: keyof T;
        render?: (item: T) => React.ReactNode;
        className?: string;
        align?: 'left' | 'right';
    }[];
    data?: T[];
    isLoading?: boolean;
    error?: any;
    emptyTitle?: string;
    emptyDescription?: string;
    // Pagination props
    total?: number;
    page?: number;
    limit?: number;
    onPageChange?: (page: number) => void;
    onLimitChange?: (limit: number) => void;
}

export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    isLoading,
    error,
    emptyTitle = 'No records found',
    emptyDescription = 'Try adjusting your filters or search terms.',
    total,
    page,
    limit,
    onPageChange,
    onLimitChange,
}: DataTableProps<T>) {
    if (isLoading) return <SkeletonTable rows={limit || 5} />;
    if (error) return <ErrorState message={error.message || 'Failed to load data'} />;

    const items = data || [];

    return (
        <div className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12">
                                    <EmptyState title={emptyTitle} description={emptyDescription} />
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                    {columns.map((col, idx) => (
                                        <td
                                            key={idx}
                                            className={`px-6 py-4 whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                                        >
                                            {col.render ? col.render(item) : col.accessor ? (item[col.accessor] as any) : null}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {onPageChange && onLimitChange && total !== undefined && page !== undefined && limit !== undefined && (
                <Pagination
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={onPageChange}
                    onLimitChange={onLimitChange}
                />
            )}
        </div>
    );
}

export const JsonView = ({ data, title }: { data: any; title?: string }) => {
    if (!data) return null;
    return (
        <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden">
            {title && <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">{title}</div>}
            <pre className="text-xs font-mono text-indigo-300 overflow-auto max-h-[300px] scrollbar-hide">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
};
