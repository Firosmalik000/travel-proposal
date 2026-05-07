import { cn } from '@/lib/utils';
import { Bold, Italic, Link2, List, ListOrdered, Pilcrow, RemoveFormatting } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from './button';

type RichTextEditorProps = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
};

function hasContent(value: string): boolean {
    return value.replace(/<[^>]+>/g, '').trim() !== '';
}

function normalizeParagraphBlocks(html: string): string {
    const container = document.createElement('div');
    container.innerHTML = html;

    container.querySelectorAll('p, div').forEach((element) => {
        const inlineStyle = element.getAttribute('style');
        if (!inlineStyle) {
            return;
        }

        const normalizedStyle = inlineStyle
            .replace(/(^|;)\s*text-indent\s*:[^;]+;?/gi, '$1')
            .replace(/(^|;)\s*margin-left\s*:[^;]+;?/gi, '$1')
            .replace(/(^|;)\s*padding-left\s*:[^;]+;?/gi, '$1')
            .replace(/^;+|;+$/g, '')
            .trim();

        if (normalizedStyle) {
            element.setAttribute('style', normalizedStyle);
        } else {
            element.removeAttribute('style');
        }
    });

    return container.innerHTML;
}

export function RichTextEditor({
    value,
    onChange,
    className,
    placeholder = 'Tulis isi artikel di sini...',
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!editorRef.current) {
            return;
        }

        if (editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const applyCommand = (command: string, commandValue?: string) => {
        editorRef.current?.focus();

        if (command === 'createLink') {
            const url = window.prompt('Masukkan URL link', 'https://');

            if (!url) {
                return;
            }

            document.execCommand(command, false, url);
            onChange(editorRef.current?.innerHTML ?? '');

            return;
        }

        document.execCommand(command, false, commandValue);

        const nextHtml = normalizeParagraphBlocks(
            editorRef.current?.innerHTML ?? '',
        );
        if (editorRef.current) {
            editorRef.current.innerHTML = nextHtml;
        }
        onChange(nextHtml);
    };

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-background p-2">
                <Button type="button" size="sm" variant="outline" onClick={() => applyCommand('bold')}>
                    <Bold className="mr-2 h-4 w-4" />
                    Bold
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => applyCommand('italic')}>
                    <Italic className="mr-2 h-4 w-4" />
                    Italic
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => applyCommand('formatBlock', 'p')}>
                    <Pilcrow className="mr-2 h-4 w-4" />
                    Paragraf
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => applyCommand('insertUnorderedList')}>
                    <List className="mr-2 h-4 w-4" />
                    Bullet
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => applyCommand('insertOrderedList')}>
                    <ListOrdered className="mr-2 h-4 w-4" />
                    Number
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => applyCommand('createLink')}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Link
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => applyCommand('removeFormat')}>
                    <RemoveFormatting className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>

            <div className="rounded-2xl border border-input bg-background shadow-sm">
                {!hasContent(value) ? (
                    <div className="pointer-events-none px-4 pt-4 text-sm text-muted-foreground">
                        {placeholder}
                    </div>
                ) : null}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="min-h-72 px-4 py-4 text-sm leading-7 text-foreground outline-none [text-indent:0] [&_p]:my-3 [&_p]:indent-0 [&_p]:ml-0 [&_p]:pl-0 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:my-1"
                    onInput={(event) => {
                        const nextHtml = normalizeParagraphBlocks(
                            event.currentTarget.innerHTML,
                        );
                        if (event.currentTarget.innerHTML !== nextHtml) {
                            event.currentTarget.innerHTML = nextHtml;
                        }
                        onChange(nextHtml);
                    }}
                />
            </div>
        </div>
    );
}
