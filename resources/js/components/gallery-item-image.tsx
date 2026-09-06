import { Button } from '@/components/ui/button';
import {
    packageImageStyle,
    type PackageImagePosition,
} from '@/lib/package-image-position';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { GalleryImageEditor } from './gallery-image-editor';

type ImagePosition = PackageImagePosition;

interface GalleryItemImageProps {
    imageUrl: string;
    index: number;
    label: string;
    isDragged?: boolean;
    isDropTarget?: boolean;
    onEdit?: (imageUrl: string, position: ImagePosition) => void;
    onDelete: () => void;
    draggableProps?: {
        draggable: boolean;
        onDragStart: () => void;
        onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
        onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
        onDragEnd: () => void;
    };
    savedPosition?: ImagePosition;
}

export function GalleryItemImage({
    imageUrl,
    index,
    label,
    isDragged,
    isDropTarget,
    onEdit,
    onDelete,
    draggableProps,
    savedPosition,
}: GalleryItemImageProps) {
    const [showEditor, setShowEditor] = useState(false);

    const handleSavePosition = (data: {
        url: string;
        position: ImagePosition;
    }) => {
        onEdit?.(data.url, data.position);
        setShowEditor(false);
    };

    const handleImageClick = () => {
        // Don't open editor if clicking on delete button or if dragging
        if (isDragged) return;
        setShowEditor(true);
    };

    return (
        <>
            <div
                {...draggableProps}
                className={[
                    'group relative aspect-video cursor-pointer overflow-hidden rounded-xl border bg-muted transition-all',
                    isDragged
                        ? 'scale-[0.98] opacity-70 ring-2 ring-primary/30'
                        : '',
                    isDropTarget && !isDragged ? 'ring-2 ring-primary' : '',
                ].join(' ')}
            >
                {/* Image with saved position applied - CLICKABLE */}
                <div
                    className="relative h-full w-full overflow-hidden bg-black"
                    onClick={handleImageClick}
                    title="Click untuk atur posisi foto"
                >
                    <img
                        src={imageUrl}
                        alt="Gallery"
                        className="absolute inset-0 h-full w-full max-w-none cursor-pointer object-cover transition-opacity hover:opacity-90"
                        style={packageImageStyle(savedPosition)}
                    />
                </div>

                {/* Grip indicator */}
                <div className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white shadow-sm">
                    <div className="flex h-3 w-3 items-center justify-center">
                        <span className="text-xs">⋮⋮</span>
                    </div>
                </div>

                {/* Label badge */}
                <div className="absolute top-1 left-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                    {label}
                </div>

                {/* Delete button - appears on hover at right bottom */}
                <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        title="Hapus gambar"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>

                {/* Indicator if position was customized */}
                {savedPosition &&
                    (savedPosition.x !== 0 ||
                        savedPosition.y !== 0 ||
                        savedPosition.scale !== 1) && (
                        <div
                            className="absolute right-1 bottom-1 h-2 w-2 rounded-full bg-blue-400 shadow-sm"
                            title="Posisi telah diatur"
                        />
                    )}

                <button
                    type="button"
                    className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={(event) => {
                        event.stopPropagation();
                        setShowEditor(true);
                    }}
                >
                    Atur posisi
                </button>
            </div>

            {showEditor && (
                <GalleryImageEditor
                    imageUrl={imageUrl}
                    onSave={handleSavePosition}
                    onClose={() => setShowEditor(false)}
                    title={`Atur Posisi Foto ${index + 1}`}
                    open={showEditor}
                    savedPosition={savedPosition}
                />
            )}
        </>
    );
}
