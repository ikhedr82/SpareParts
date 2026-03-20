import { cn } from "@/lib/utils";

interface BrandLogoProps {
    variant?: 'light' | 'dark';
    className?: string;
    width?: string | number;
    height?: string | number;
    showText?: boolean;
}

export function BrandLogo({ 
    variant = 'dark', 
    className = '', 
    width = 'auto', 
    height = 32,
    showText = true 
}: BrandLogoProps) {
    const textColor = variant === 'light' ? 'white' : '#1E293B';
    
    return (
        <div className={cn("flex items-center gap-3 select-none transition-opacity hover:opacity-90", className)}>
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 40 48" 
                fill="none"
                style={{ width: 'auto', height }}
                className="flex-shrink-0"
            >
                {/* Icon: Cube with gear accent */}
                <g transform="translate(4, 4)">
                    <path d="M20 12L8 19V33L20 40L32 33V19L20 12Z" fill="url(#brand-grad1)" opacity="0.9"/>
                    <path d="M20 12L32 19V33L20 40V26L32 19" fill="url(#brand-grad2)" opacity="0.7"/>
                    <path d="M8 19L20 12L32 19L20 26L8 19Z" fill="url(#brand-grad3)" opacity="0.95"/>
                    <rect x="29" y="10" width="4" height="3" rx="0.5" fill="#10B981" transform="rotate(15, 31, 11.5)"/>
                    <rect x="32" y="14" width="4" height="3" rx="0.5" fill="#10B981" transform="rotate(45, 34, 15.5)"/>
                    <rect x="33" y="19" width="4" height="3" rx="0.5" fill="#10B981" transform="rotate(75, 35, 20.5)"/>
                </g>
                <defs>
                    <linearGradient id="brand-grad1" x1="8" y1="12" x2="32" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#10B981"/>
                        <stop offset="100%" stopColor="#059669"/>
                    </linearGradient>
                    <linearGradient id="brand-grad2" x1="20" y1="12" x2="32" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0EA5E9"/>
                        <stop offset="100%" stopColor="#0284C7"/>
                    </linearGradient>
                    <linearGradient id="brand-grad3" x1="8" y1="12" x2="32" y2="26" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#34D399"/>
                        <stop offset="100%" stopColor="#10B981"/>
                    </linearGradient>
                </defs>
            </svg>

            {showText && (
                <span 
                    className="text-2xl font-bold tracking-tight"
                    style={{ 
                        color: textColor,
                        fontFamily: "var(--font-inter), sans-serif"
                    }}
                >
                    Part<span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-sky-500">ivo</span>
                </span>
            )}
        </div>
    );
}
