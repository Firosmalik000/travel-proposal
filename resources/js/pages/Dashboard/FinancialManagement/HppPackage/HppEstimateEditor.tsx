import {
    PackageEditorWorkspace,
    type PackageEditorWorkspaceProps,
} from '@/components/package-editor-workspace';

type HppEstimateEditorProps = Omit<
    PackageEditorWorkspaceProps,
    'editorMode' | 'pkg' | 'draft'
> & {
    package: NonNullable<PackageEditorWorkspaceProps['pkg']>;
};

export function HppEstimateEditor({
    package: packageData,
    ...props
}: HppEstimateEditorProps) {
    return (
        <PackageEditorWorkspace
            {...props}
            pkg={packageData}
            draft={null}
            editorMode="hpp"
        />
    );
}
