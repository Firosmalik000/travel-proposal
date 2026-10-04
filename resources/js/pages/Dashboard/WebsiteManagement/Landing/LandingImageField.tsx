import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

type Props = {
    label: string;
    value: string;
    file: File | null;
    onChange: (file: File | null) => void;
};

export function LandingImageField({ label, value, file, onChange }: Props) {
    const [preview, setPreview] = useState<{
        file: File;
        url: string;
    } | null>(null);

    useEffect(() => {
        if (!file) {
            return;
        }

        const reader = new FileReader();
        const handleLoad = () => {
            if (typeof reader.result === 'string') {
                setPreview({ file, url: reader.result });
            }
        };

        reader.addEventListener('load', handleLoad);
        reader.readAsDataURL(file);

        return () => {
            reader.removeEventListener('load', handleLoad);

            if (reader.readyState === FileReader.LOADING) {
                reader.abort();
            }
        };
    }, [file]);

    const previewUrl = preview?.file === file ? preview.url : null;

    return (
        <div className="space-y-3">
            <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-xl border border-border bg-muted/30 shadow-inner">
                    <img
                        src={previewUrl || value || '/images/dummy.jpg'}
                        alt={label}
                        className="h-28 w-full object-cover"
                    />
                </div>
                <div className="space-y-2">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                            onChange(event.target.files?.[0] ?? null)
                        }
                    />
                    <div className="rounded-lg border border-dashed border-border bg-background px-3 py-1.5 text-[0.65rem] text-muted-foreground">
                        {file ? (
                            <>
                                File:{' '}
                                <span className="font-mono text-primary">
                                    {file.name}
                                </span>
                            </>
                        ) : (
                            <>
                                Path:{' '}
                                <span className="font-mono">
                                    {value || '-'}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
