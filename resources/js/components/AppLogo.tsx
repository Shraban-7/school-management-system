import React, { useState } from 'react';

export interface AppLogoProps {
    src?: string | null;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    withText?: boolean;
    subtitle?: string;
    className?: string;
    textClassName?: string;
}

const sizeMap = {
    xs: { icon: 'h-6 w-6', rounded: 'rounded-md', text: 'text-xs', sub: 'text-[9px]' },
    sm: { icon: 'h-8 w-8', rounded: 'rounded-lg', text: 'text-sm font-bold', sub: 'text-[10px]' },
    md: { icon: 'h-9 w-9', rounded: 'rounded-xl', text: 'text-base font-bold', sub: 'text-xs' },
    lg: { icon: 'h-12 w-12', rounded: 'rounded-2xl', text: 'text-lg font-extrabold', sub: 'text-xs' },
    xl: { icon: 'h-16 w-16', rounded: 'rounded-2xl', text: 'text-xl font-extrabold', sub: 'text-sm' },
};

/**
 * Built-in SVG vector emblem for instant first-paint without network latency.
 */
export function DefaultLogoEmblem({ className = 'h-9 w-9' }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="appLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3730a3" />
                    <stop offset="45%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="appLogoCap" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="85%" stopColor="#eef2ff" />
                    <stop offset="100%" stopColor="#e0e7ff" />
                </linearGradient>
                <linearGradient id="appLogoCapBase" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e0e7ff" />
                    <stop offset="100%" stopColor="#c7d2fe" />
                </linearGradient>
                <linearGradient id="appLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="40%" stopColor="#fbbf24" />
                    <stop offset="80%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="appLogoBook" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e0e7ff" />
                </linearGradient>
            </defs>

            {/* Squircle Background */}
            <rect width="512" height="512" rx="116" fill="url(#appLogoBg)" />
            <rect
                x="8"
                y="8"
                width="496"
                height="496"
                rx="108"
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.22"
                strokeWidth="8"
            />

            {/* Emblem Elements */}
            <g>
                {/* Book Pages */}
                <path
                    d="M256 348 C204 338, 144 344, 112 358 C106 360, 102 365, 102 371 L102 414 C102 420, 108 424, 114 421 C144 408, 202 402, 256 414 Z"
                    fill="url(#appLogoBook)"
                />
                <path
                    d="M256 348 C308 338, 368 344, 400 358 C406 360, 410 365, 410 371 L410 414 C410 420, 404 424, 398 421 C368 408, 310 402, 256 414 Z"
                    fill="url(#appLogoBook)"
                />
                <path d="M252 348 L258 348 L258 414 L252 414 Z" fill="#c7d2fe" />
                {/* Golden Bookmark */}
                <path d="M248 413 L256 421 L264 413 L264 442 L256 450 L248 442 Z" fill="url(#appLogoGold)" />

                {/* Skullcap */}
                <path
                    d="M142 216 C142 216, 142 264, 142 272 C142 316, 194 340, 256 340 C318 340, 370 316, 370 272 C370 264, 370 216, 370 216 C336 242, 298 256, 256 256 C214 256, 176 242, 142 216 Z"
                    fill="url(#appLogoCapBase)"
                />

                {/* Mortarboard Diamond */}
                <polygon points="256,92 446,182 256,270 66,182" fill="url(#appLogoCap)" />
                <polygon points="66,182 256,270 256,278 66,190" fill="#c7d2fe" />
                <polygon points="446,182 256,270 256,278 446,190" fill="#a5b4fc" />

                {/* Button & Tassel */}
                <circle cx="256" cy="182" r="14" fill="url(#appLogoGold)" />
                <circle cx="254" cy="180" r="5" fill="#fef9c3" opacity="0.8" />
                <path
                    d="M256 182 C324 186, 414 204, 426 264"
                    fill="none"
                    stroke="url(#appLogoGold)"
                    strokeWidth="11"
                    strokeLinecap="round"
                />
                <rect x="416" y="264" width="20" height="9" rx="3" fill="#d97706" />
                <path
                    d="M417 273 L410 330 C409 336, 412 340, 418 340 C424 340, 428 340, 434 340 C440 340, 443 336, 442 330 L435 273 Z"
                    fill="url(#appLogoGold)"
                />
            </g>
        </svg>
    );
}

export default function AppLogo({
    src,
    name = 'School Management System',
    size = 'md',
    withText = false,
    subtitle,
    className = '',
    textClassName = '',
}: AppLogoProps) {
    const [imgFailed, setImgFailed] = useState(false);
    const sizeCfg = sizeMap[size];

    const mark =
        src && !imgFailed ? (
            <img
                src={src}
                alt={name}
                onError={() => setImgFailed(true)}
                className={`${sizeCfg.icon} ${sizeCfg.rounded} shrink-0 object-cover shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60`}
            />
        ) : (
            <DefaultLogoEmblem
                className={`${sizeCfg.icon} ${sizeCfg.rounded} shrink-0 shadow-md shadow-accent-950/20`}
            />
        );

    if (!withText) {
        return <div className={`inline-flex items-center ${className}`}>{mark}</div>;
    }

    return (
        <div className={`inline-flex items-center gap-3 ${className}`}>
            {mark}
            <div className="min-w-0">
                <span className={`block truncate tracking-tight text-slate-900 dark:text-white ${sizeCfg.text} ${textClassName}`}>
                    {name}
                </span>
                {subtitle && (
                    <span className={`block truncate font-medium text-slate-500 dark:text-slate-400 ${sizeCfg.sub}`}>
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
    );
}
