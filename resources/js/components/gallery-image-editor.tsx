import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import type { PackageImagePosition } from '@/lib/package-image-position';
import { RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface GalleryImageEditorProps {
    imageUrl: string;
    onSave: (imageData: {
        url: string;
        position: PackageImagePosition;
    }) => void;
    onClose: () => void;
    title?: string;
    open?: boolean;
    savedPosition?: PackageImagePosition;
}

type EditorLayout = {
    imageWidth: number;
    imageHeight: number;
    cropWidth: number;
    cropHeight: number;
};

function calculateEditorLayout(
    stage: HTMLDivElement,
    naturalSize: { width: number; height: number },
): EditorLayout {
    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    const imageRatio = naturalSize.width / naturalSize.height;
    const imageWidth =
        imageRatio >= stageWidth / stageHeight
            ? stageWidth
            : stageHeight * imageRatio;
    const imageHeight =
        imageRatio >= stageWidth / stageHeight
            ? stageWidth / imageRatio
            : stageHeight;
    return {
        imageWidth,
        imageHeight,
        cropWidth: stageWidth,
        cropHeight: stageHeight,
    };
}

function initialPosition(
    savedPosition?: PackageImagePosition,
): PackageImagePosition {
    return {
        x: 50,
        y: 50,
        scale:
            savedPosition?.version === 2 || savedPosition?.version === 3
                ? savedPosition.scale
                : 1,
        version: 3,
    };
}

function objectPositionToFocus(
    objectPosition: number,
    cropSize: number,
    imageSize: number,
): number {
    const visibleRatio = cropSize / imageSize;

    if (Math.abs(visibleRatio - 1) < 0.0001) {
        return 50;
    }

    return (
        (visibleRatio / 2 - (objectPosition / 100) * (visibleRatio - 1)) * 100
    );
}

export function GalleryImageEditor({
    imageUrl,
    onSave,
    onClose,
    title = 'Atur Posisi Foto',
    open = true,
    savedPosition,
}: GalleryImageEditorProps) {
    const [position, setPosition] = useState<PackageImagePosition>(() =>
        initialPosition(savedPosition),
    );
    const [layout, setLayout] = useState<EditorLayout | null>(null);
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [frameScale, setFrameScale] = useState(
        savedPosition?.version === 2
            ? Math.max(0.4, Math.min(1, savedPosition.frameScale ?? 1))
            : 1,
    );
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ clientX: 0, clientY: 0, x: 50, y: 50 });
    const didRestoreSavedPositionRef = useRef(false);
    const stageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stage = stageRef.current;

        if (!stage || naturalSize.width <= 0 || naturalSize.height <= 0) {
            return;
        }

        const updateLayout = () => {
            setLayout(calculateEditorLayout(stage, naturalSize));
        };

        updateLayout();
        const observer = new ResizeObserver(updateLayout);
        observer.observe(stage);

        return () => observer.disconnect();
    }, [naturalSize]);

    const clampPosition = (
        next: PackageImagePosition,
        nextFrameScale = frameScale,
    ): PackageImagePosition => {
        if (!layout) {
            return next;
        }

        const scale = Math.max(
            0.25 * nextFrameScale,
            Math.min(3 * nextFrameScale, next.scale),
        );

        return {
            x: Math.max(0, Math.min(100, next.x)),
            y: Math.max(0, Math.min(100, next.y)),
            scale,
            version: 3,
        };
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!layout) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        dragStartRef.current = {
            clientX: event.clientX,
            clientY: event.clientY,
            x: position.x,
            y: position.y,
        };
        setIsDragging(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || !layout) {
            return;
        }

        const scaledWidth = layout.imageWidth * position.scale;
        const scaledHeight = layout.imageHeight * position.scale;
        const start = dragStartRef.current;

        setPosition(
            clampPosition({
                ...position,
                x:
                    start.x -
                    ((event.clientX - start.clientX) / scaledWidth) * 100,
                y:
                    start.y -
                    ((event.clientY - start.clientY) / scaledHeight) * 100,
                version: 3,
            }),
        );
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setIsDragging(false);
    };

    const handleScaleChange = (value: number[]) => {
        setPosition((current) =>
            clampPosition({ ...current, scale: value[0], version: 3 }),
        );
    };

    const handleFrameScaleChange = (value: number[]) => {
        const nextFrameScale = Math.max(0.4, value[0] / 100);

        setFrameScale(nextFrameScale);
        setPosition((current) => clampPosition(current, nextFrameScale));
    };

    const resetPosition = () => {
        setPosition({ x: 50, y: 50, scale: 1, version: 3 });
        setFrameScale(1);
    };

    const serializedPosition = (): PackageImagePosition => {
        if (!layout) {
            return { x: 0, y: 0, scale: 1, version: 3 };
        }

        const current = clampPosition(position);

        return {
            x:
                (((50 - current.x) / 100) *
                    layout.imageWidth *
                    current.scale *
                    100) /
                (frameScale * layout.cropWidth),
            y:
                (((50 - current.y) / 100) *
                    layout.imageHeight *
                    current.scale *
                    100) /
                (frameScale * layout.cropHeight),
            scale: current.scale / frameScale,
            version: 3,
        };
    };

    const imageOffsetX = layout
        ? ((50 - position.x) / 100) * layout.imageWidth * position.scale
        : 0;
    const imageOffsetY = layout
        ? ((50 - position.y) / 100) * layout.imageHeight * position.scale
        : 0;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Geser foto sampai bagian yang ingin ditampilkan berada
                        di dalam bingkai.
                    </p>
                </DialogHeader>

                <div className="space-y-4">
                    <div
                        ref={stageRef}
                        className="relative aspect-video w-full cursor-move touch-none overflow-hidden rounded-xl bg-[#0b1017] select-none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        {layout ? (
                            <img
                                src={imageUrl}
                                alt="Foto asli yang sedang diatur"
                                draggable={false}
                                className="pointer-events-none absolute max-w-none select-none"
                                style={{
                                    width: layout.imageWidth,
                                    height: layout.imageHeight,
                                    left: `calc(50% + ${imageOffsetX}px)`,
                                    top: `calc(50% + ${imageOffsetY}px)`,
                                    transform: `translate(-50%, -50%) scale(${position.scale})`,
                                    transformOrigin: 'center',
                                    transition: isDragging
                                        ? 'none'
                                        : 'transform 160ms ease-out',
                                }}
                            />
                        ) : null}

                        <img
                            src={imageUrl}
                            alt=""
                            draggable={false}
                            aria-hidden="true"
                            className="pointer-events-none invisible absolute h-px w-px"
                            onLoad={(event) => {
                                const nextNaturalSize = {
                                    width: event.currentTarget.naturalWidth,
                                    height: event.currentTarget.naturalHeight,
                                };
                                const stage = stageRef.current;

                                setNaturalSize(nextNaturalSize);

                                if (!stage) {
                                    return;
                                }

                                const nextLayout = calculateEditorLayout(
                                    stage,
                                    nextNaturalSize,
                                );
                                setLayout(nextLayout);

                                if (!didRestoreSavedPositionRef.current) {
                                    didRestoreSavedPositionRef.current = true;

                                    if (savedPosition?.version === 3) {
                                        const savedScale = Math.max(
                                            0.25,
                                            savedPosition.scale,
                                        );

                                        setPosition({
                                            x:
                                                50 -
                                                ((savedPosition.x / 100) *
                                                    nextLayout.cropWidth *
                                                    100) /
                                                    (nextLayout.imageWidth *
                                                        savedScale),
                                            y:
                                                50 -
                                                ((savedPosition.y / 100) *
                                                    nextLayout.cropHeight *
                                                    100) /
                                                    (nextLayout.imageHeight *
                                                        savedScale),
                                            scale: savedScale,
                                            version: 3,
                                        });
                                    } else if (savedPosition?.version === 2) {
                                        setPosition({
                                            x: objectPositionToFocus(
                                                savedPosition.x,
                                                nextLayout.cropWidth,
                                                nextLayout.imageWidth,
                                            ),
                                            y: objectPositionToFocus(
                                                savedPosition.y,
                                                nextLayout.cropHeight,
                                                nextLayout.imageHeight,
                                            ),
                                            scale: savedPosition.scale,
                                            version: 3,
                                        });
                                    }
                                }
                            }}
                        />

                        {layout ? (
                            <div
                                className="pointer-events-none absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-3 grid-rows-3 overflow-hidden border-2 border-white shadow-[0_0_0_9999px_rgba(5,9,15,0.58)]"
                                style={{
                                    width: layout.cropWidth * frameScale,
                                    height: layout.cropHeight * frameScale,
                                }}
                            >
                                {Array.from({ length: 9 }, (_, index) => (
                                    <span
                                        key={index}
                                        className="border border-white/25"
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-3 rounded-xl bg-muted/45 p-4">
                        <div className="flex items-center justify-between gap-4 text-sm font-medium">
                            <span>Ukuran bingkai</span>
                            <span className="tabular-nums">
                                {Math.round(frameScale * 100)}%
                            </span>
                        </div>
                        <Slider
                            aria-label="Ukuran bingkai crop"
                            min={40}
                            max={100}
                            step={1}
                            value={[frameScale * 100]}
                            onValueChange={handleFrameScaleChange}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Lebih kecil</span>
                            <span>Maksimal</span>
                        </div>

                        <div className="h-px bg-border" />

                        <div className="flex items-center justify-between gap-4 text-sm font-medium">
                            <span>Zoom</span>
                            <span className="tabular-nums">
                                {Math.round(
                                    (position.scale / frameScale) * 100,
                                )}
                            </span>
                        </div>
                        <Slider
                            aria-label="Zoom foto"
                            min={0.25 * frameScale}
                            max={3 * frameScale}
                            step={0.05}
                            value={[position.scale]}
                            onValueChange={handleScaleChange}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>25%</span>
                            <span>300%</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetPosition}
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={() =>
                            onSave({
                                url: imageUrl,
                                position: serializedPosition(),
                            })
                        }
                        disabled={!layout}
                    >
                        Simpan posisi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
