import type { CSSProperties } from 'react';

export type PackageImagePosition = {
    x: number;
    y: number;
    scale: number;
    version?: 2 | 3;
    frameScale?: number;
};

export function normalizePackageImagePositions(
    value: unknown,
): Record<string, PackageImagePosition> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    return Object.entries(value).reduce(
        (positions, [path, rawPosition]) => {
            if (!rawPosition || typeof rawPosition !== 'object') {
                return positions;
            }

            const record = rawPosition as Record<string, unknown>;
            const x = Number(record.x);
            const y = Number(record.y);
            const scale = Number(record.scale);
            const rawVersion = Number(record.version);
            const version =
                rawVersion === 3 ? 3 : rawVersion === 2 ? 2 : undefined;
            const frameScale =
                version === 2
                    ? Math.max(0.4, Math.min(1, Number(record.frameScale) || 1))
                    : 1;

            if (
                Number.isFinite(x) &&
                Number.isFinite(y) &&
                Number.isFinite(scale)
            ) {
                positions[path] = {
                    x:
                        version === 2
                            ? Math.max(0, Math.min(100, x))
                            : version === 3
                              ? Math.max(-200, Math.min(200, x))
                              : Math.max(-1000, Math.min(1000, x)),
                    y:
                        version === 2
                            ? Math.max(0, Math.min(100, y))
                            : version === 3
                              ? Math.max(-200, Math.min(200, y))
                              : Math.max(-1000, Math.min(1000, y)),
                    scale: Math.max(
                        version === 3 ? 0.25 : 1,
                        Math.min(version === 2 ? 3 * frameScale : 3, scale),
                    ),
                    ...(version === 2
                        ? { version, frameScale }
                        : version === 3
                          ? { version }
                          : {}),
                };
            }

            return positions;
        },
        {} as Record<string, PackageImagePosition>,
    );
}

export function packageImageStyle(
    position?: PackageImagePosition,
): CSSProperties {
    if (!position) {
        return {
            backgroundColor: '#0b1017',
            objectFit: 'contain',
            objectPosition: 'center',
        };
    }

    const resolved = {
        x: position.x,
        y: position.y,
        scale: Math.max(
            position.version === 3 ? 0.25 : 1,
            Math.min(3, position.scale),
        ),
    };

    if (position?.version === 2) {
        const frameScale = Math.max(0.4, Math.min(1, position.frameScale ?? 1));

        return {
            objectPosition: `${resolved.x}% ${resolved.y}%`,
            transform: `scale(${Math.min(3, resolved.scale / frameScale)})`,
            transformOrigin: 'center',
        };
    }

    if (position?.version === 3) {
        return {
            backgroundColor: '#0b1017',
            objectFit: 'contain',
            objectPosition: 'center',
            translate: `${resolved.x}% ${resolved.y}%`,
            scale: `${resolved.scale}`,
            transformOrigin: 'center',
        };
    }

    return {
        transform: `translate(${resolved.x}px, ${resolved.y}px) scale(${resolved.scale})`,
        transformOrigin: 'center',
    };
}
