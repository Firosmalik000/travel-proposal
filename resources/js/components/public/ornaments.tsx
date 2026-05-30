type OrnamentProps = {
    className: string;
};

function buildStarPoints(
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    spikes: number,
): string {
    const points: string[] = [];
    const step = Math.PI / spikes;

    for (let i = 0; i < spikes * 2; i += 1) {
        const radius = i % 2 === 0 ? outerR : innerR;
        const angle = -Math.PI / 2 + i * step;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }

    return points.join(' ');
}

export function IslamicOrnamentKhatam({ className }: OrnamentProps) {
    const outerStar = buildStarPoints(50, 50, 45, 31.5, 8);
    const middleStar = buildStarPoints(50, 50, 33, 23, 8);
    const innerStar = buildStarPoints(50, 50, 22.5, 15.5, 8);
    const accentDiamonds = [
        { x: 50, y: 16.5 },
        { x: 83.5, y: 50 },
        { x: 50, y: 83.5 },
        { x: 16.5, y: 50 },
    ];

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            <g
                stroke="currentColor"
                strokeLinejoin="round"
                strokeLinecap="round"
            >
                <polygon points={outerStar} strokeWidth="2" />

                <g opacity="0.92" strokeWidth="1.7">
                    <rect x="23" y="23" width="54" height="54" />
                    <rect
                        x="23"
                        y="23"
                        width="54"
                        height="54"
                        transform="rotate(45 50 50)"
                    />
                </g>

                <polygon
                    points={middleStar}
                    strokeWidth="1.85"
                    opacity="0.96"
                />

                <g opacity="0.9" strokeWidth="1.55">
                    {accentDiamonds.map((d, idx) => (
                        <rect
                            key={idx}
                            x={d.x - 3.6}
                            y={d.y - 3.6}
                            width={7.2}
                            height={7.2}
                            transform={`rotate(45 ${d.x} ${d.y})`}
                        />
                    ))}
                </g>

                <polygon points={innerStar} strokeWidth="1.75" opacity="0.95" />

                <g opacity="0.9" strokeWidth="1.6">
                    <circle cx="50" cy="50" r="8.6" />
                    <circle cx="50" cy="50" r="3.9" />
                </g>
            </g>
        </svg>
    );
}

export function IslamicOrnamentRosette({ className }: OrnamentProps) {
    // Simpler, more controlled rosette so it doesn't look "ngawur".
    const outerStar = buildStarPoints(50, 50, 45.5, 33.5, 8);
    const innerStar = buildStarPoints(50, 50, 26, 18.5, 8);
    const cornerDots = [
        { x: 50, y: 11.5 },
        { x: 88.5, y: 50 },
        { x: 50, y: 88.5 },
        { x: 11.5, y: 50 },
    ];

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            <g
                stroke="currentColor"
                strokeLinejoin="round"
                strokeLinecap="round"
            >
                <polygon points={outerStar} strokeWidth="2" />

                <g opacity="0.92" strokeWidth="1.65">
                    <rect x="21" y="21" width="58" height="58" />
                    <rect
                        x="21"
                        y="21"
                        width="58"
                        height="58"
                        transform="rotate(45 50 50)"
                    />
                </g>

                <g opacity="0.9" strokeWidth="1.65">
                    {cornerDots.map((p, idx) => (
                        <circle key={idx} cx={p.x} cy={p.y} r="3.6" />
                    ))}
                </g>

                <polygon points={innerStar} strokeWidth="1.85" opacity="0.95" />

                <g opacity="0.9" strokeWidth="1.65">
                    <circle cx="50" cy="50" r="10.2" />
                    <circle cx="50" cy="50" r="5.0" />
                </g>
            </g>
        </svg>
    );
}

export function IslamicOrnamentRow1Col1({ className }: OrnamentProps) {
    // Inspired by reference image row 1 column 1: an 8-point khatam with clean
    // interlaced squares and small diamond accents (kept lightweight).
    const outerStar = buildStarPoints(50, 50, 46, 33, 8);
    const innerStar = buildStarPoints(50, 50, 30.5, 22, 8);
    const coreStar = buildStarPoints(50, 50, 17.5, 12.5, 8);
    const accentDiamonds = [
        { x: 50, y: 13.5 },
        { x: 86.5, y: 50 },
        { x: 50, y: 86.5 },
        { x: 13.5, y: 50 },
    ];

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            <g
                stroke="currentColor"
                strokeLinejoin="round"
                strokeLinecap="round"
            >
                <polygon points={outerStar} strokeWidth="2" />

                <g opacity="0.92" strokeWidth="1.75">
                    <rect x="23" y="23" width="54" height="54" />
                    <rect
                        x="23"
                        y="23"
                        width="54"
                        height="54"
                        transform="rotate(45 50 50)"
                    />
                </g>

                <polygon points={innerStar} strokeWidth="1.85" opacity="0.96" />

                <g opacity="0.9" strokeWidth="1.6">
                    {accentDiamonds.map((d, idx) => (
                        <rect
                            key={idx}
                            x={d.x - 3.9}
                            y={d.y - 3.9}
                            width={7.8}
                            height={7.8}
                            transform={`rotate(45 ${d.x} ${d.y})`}
                        />
                    ))}
                </g>

                <polygon points={coreStar} strokeWidth="1.75" opacity="0.95" />

                <g opacity="0.9" strokeWidth="1.6">
                    <circle cx="50" cy="50" r="7.2" />
                    <circle cx="50" cy="50" r="3.6" />
                </g>
            </g>
        </svg>
    );
}

export function IslamicOrnamentAbbasid({ className }: OrnamentProps) {
    // Abbasid-inspired: rectilinear, architectural, "brickwork" accents.
    const star = buildStarPoints(50, 50, 32.5, 22.5, 8);
    const innerStar = buildStarPoints(50, 50, 20.5, 14.5, 8);

    const cornerBricks = [
        // top-left
        { x: 16, y: 16, w: 12, h: 4 },
        { x: 16, y: 16, w: 4, h: 12 },
        // top-right
        { x: 72, y: 16, w: 12, h: 4 },
        { x: 80, y: 16, w: 4, h: 12 },
        // bottom-left
        { x: 16, y: 80, w: 12, h: 4 },
        { x: 16, y: 72, w: 4, h: 12 },
        // bottom-right
        { x: 72, y: 80, w: 12, h: 4 },
        { x: 80, y: 72, w: 4, h: 12 },
    ];

    const midBricks = [
        { x: 44, y: 14, w: 12, h: 4 },
        { x: 44, y: 82, w: 12, h: 4 },
        { x: 14, y: 44, w: 4, h: 12 },
        { x: 82, y: 44, w: 4, h: 12 },
    ];

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            <g
                stroke="currentColor"
                strokeLinejoin="round"
                strokeLinecap="round"
            >
                <rect x="14" y="14" width="72" height="72" strokeWidth="2" />
                <rect
                    x="22"
                    y="22"
                    width="56"
                    height="56"
                    strokeWidth="1.65"
                    opacity="0.92"
                />

                <g opacity="0.92" strokeWidth="1.7">
                    <polygon points={star} />
                    <polygon points={innerStar} opacity="0.95" />
                </g>

                <g opacity="0.9" strokeWidth="1.6">
                    {cornerBricks.map((b, idx) => (
                        <rect
                            key={idx}
                            x={b.x}
                            y={b.y}
                            width={b.w}
                            height={b.h}
                        />
                    ))}
                    {midBricks.map((b, idx) => (
                        <rect
                            key={`m_${idx}`}
                            x={b.x}
                            y={b.y}
                            width={b.w}
                            height={b.h}
                        />
                    ))}
                </g>

                <g opacity="0.9" strokeWidth="1.6">
                    <rect
                        x="46.5"
                        y="46.5"
                        width="7"
                        height="7"
                        transform="rotate(45 50 50)"
                    />
                </g>
            </g>
        </svg>
    );
}

export function IslamicOrnamentOttoman({ className }: OrnamentProps) {
    // Ottoman-inspired: floral medallion feel (petals + ring), still geometric and clean.
    const outerStar = buildStarPoints(50, 50, 44, 31.5, 8);
    const innerStar = buildStarPoints(50, 50, 25, 18, 8);
    const petals = Array.from({ length: 8 }, (_, i) => ({
        rot: i * 45,
    }));
    const ringDots = Array.from({ length: 16 }, (_, i) => {
        const angle = -Math.PI / 2 + i * (Math.PI / 8);
        const x = 50 + Math.cos(angle) * 39.5;
        const y = 50 + Math.sin(angle) * 39.5;

        return { x, y };
    });

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            <g
                stroke="currentColor"
                strokeLinejoin="round"
                strokeLinecap="round"
            >
                <circle cx="50" cy="50" r="46" strokeWidth="2" opacity="0.95" />
                <polygon points={outerStar} strokeWidth="1.8" opacity="0.92" />

                <g opacity="0.9" strokeWidth="1.55">
                    {ringDots.map((p, idx) => (
                        <circle key={idx} cx={p.x} cy={p.y} r="2.2" />
                    ))}
                </g>

                <g opacity="0.92" strokeWidth="1.65">
                    {petals.map((p, idx) => (
                        <path
                            key={idx}
                            d="M50 17 C58 29 58 41 50 44 C42 41 42 29 50 17 Z"
                            transform={`rotate(${p.rot} 50 50)`}
                        />
                    ))}
                </g>

                <polygon points={innerStar} strokeWidth="1.75" opacity="0.95" />

                <g opacity="0.9" strokeWidth="1.6">
                    <circle cx="50" cy="50" r="9.5" />
                    <circle cx="50" cy="50" r="4.4" />
                    <rect
                        x="46.4"
                        y="46.4"
                        width="7.2"
                        height="7.2"
                        transform="rotate(45 50 50)"
                    />
                </g>
            </g>
        </svg>
    );
}

export function IslamicOrnamentOttomanAccent({ className }: OrnamentProps) {
    // Subtle Ottoman accent for layering: fewer repeated strokes (4 petals only).
    const innerStar = buildStarPoints(50, 50, 22.5, 16, 8);
    const petals = [0, 90, 180, 270];

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            <g
                stroke="currentColor"
                strokeLinejoin="round"
                strokeLinecap="round"
            >
                <circle cx="50" cy="50" r="46" strokeWidth="2" opacity="0.95" />

                <g opacity="0.9" strokeWidth="1.55">
                    {petals.map((rot) => (
                        <path
                            key={rot}
                            d="M50 19 C58 30 58 41 50 44 C42 41 42 30 50 19 Z"
                            transform={`rotate(${rot} 50 50)`}
                        />
                    ))}
                </g>

                <polygon points={innerStar} strokeWidth="1.6" opacity="0.92" />

                <g opacity="0.9" strokeWidth="1.6">
                    <circle cx="50" cy="50" r="7.8" />
                    <rect
                        x="46.6"
                        y="46.6"
                        width="6.8"
                        height="6.8"
                        transform="rotate(45 50 50)"
                    />
                </g>
            </g>
        </svg>
    );
}

export function IslamicOrnamentZellige({ className }: OrnamentProps) {
    // Creative variant: Maghrebi/Andalusian zellige tile vibe (10-point star + clean framing).
    const outerStar = buildStarPoints(50, 50, 45, 33, 10);
    const innerStar = buildStarPoints(50, 50, 26.5, 19.2, 10);
    const coreStar = buildStarPoints(50, 50, 13.5, 9.8, 10);

    const kite = (rot: number) => (
        <path
            key={rot}
            d="M50 10 L58 24 L50 28 L42 24 Z"
            transform={`rotate(${rot} 50 50)`}
        />
    );

    const kites = Array.from({ length: 10 }, (_, i) => i * 36);

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            <g
                stroke="currentColor"
                strokeLinejoin="round"
                strokeLinecap="round"
            >
                <rect x="12" y="12" width="76" height="76" strokeWidth="2" />
                <rect
                    x="18"
                    y="18"
                    width="64"
                    height="64"
                    strokeWidth="1.6"
                    opacity="0.92"
                />

                <polygon points={outerStar} strokeWidth="1.8" opacity="0.92" />

                <g opacity="0.9" strokeWidth="1.5">
                    {kites.map((rot) => kite(rot))}
                </g>

                <polygon points={innerStar} strokeWidth="1.7" opacity="0.95" />
                <polygon points={coreStar} strokeWidth="1.6" opacity="0.95" />

                <g opacity="0.9" strokeWidth="1.55">
                    <circle cx="50" cy="50" r="7.4" />
                    <rect
                        x="46.3"
                        y="46.3"
                        width="7.4"
                        height="7.4"
                        transform="rotate(45 50 50)"
                    />
                </g>
            </g>
        </svg>
    );
}

export function IslamicLantern({ className }: OrnamentProps) {
    // Ramadan lantern (fanous) icon: clean, symmetric, minimal strokes.
    return (
        <svg
            viewBox="0 0 100 160"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            <g
                stroke="currentColor"
                strokeLinejoin="round"
                strokeLinecap="round"
            >
                {/* Ring + chain */}
                <path
                    d="M50 6 C56 6 60 10 60 15 C60 20 56 24 50 24 C44 24 40 20 40 15 C40 10 44 6 50 6 Z"
                    strokeWidth="2"
                />
                <path d="M50 24 L50 36" strokeWidth="2" opacity="0.92" />

                {/* Crown (dome + shoulders) */}
                <path
                    d="M38 36 C41 30 46 28 50 28 C54 28 59 30 62 36"
                    strokeWidth="2"
                />
                <path d="M34 40 H66" strokeWidth="2" />
                <path d="M30 40 L50 54 L70 40" strokeWidth="2" />
                <path
                    d="M30 40 L30 56 L50 66 L70 56 L70 40"
                    strokeWidth="1.8"
                    opacity="0.92"
                />

                {/* Main body (slightly rounded) */}
                <path
                    d="M26 56 L50 70 L74 56 C78 68 82 76 82 86 L76 124 L50 140 L24 124 L18 86 C18 76 22 68 26 56 Z"
                    strokeWidth="2"
                />

                {/* Outer frame lines */}
                <g opacity="0.88" strokeWidth="1.6">
                    <path d="M26 56 L26 124" />
                    <path d="M74 56 L74 124" />
                    <path d="M18 86 H82" />
                </g>

                {/* Windows (two pointed arches) */}
                <g opacity="0.92" strokeWidth="1.65">
                    <path d="M39 84 C35.8 88.8 34.6 94.4 34.6 105.5 C34.6 112 36.9 116.8 39 118.5 C41.1 116.8 43.4 112 43.4 105.5 C43.4 94.4 42.2 88.8 39 84 Z" />
                    <path d="M61 84 C57.8 88.8 56.6 94.4 56.6 105.5 C56.6 112 58.9 116.8 61 118.5 C63.1 116.8 65.4 112 65.4 105.5 C65.4 94.4 64.2 88.8 61 84 Z" />
                </g>

                {/* Center medallion + star */}
                <g opacity="0.9" strokeWidth="1.55">
                    <circle cx="50" cy="104" r="9.5" />
                    <path d="M50 96.5 L52.8 102.2 L59.2 103 L54.4 107.2 L55.7 113.4 L50 110.4 L44.3 113.4 L45.6 107.2 L40.8 103 L47.2 102.2 Z" />
                </g>

                {/* Base + finial */}
                <path d="M36 140 H64" strokeWidth="2" />
                <path
                    d="M40 140 H60 L56 150 L50 156 L44 150 Z"
                    strokeWidth="2"
                />
                <path d="M50 140 V156" strokeWidth="1.6" opacity="0.9" />
            </g>
        </svg>
    );
}
