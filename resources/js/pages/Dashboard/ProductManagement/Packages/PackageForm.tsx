import {
    PackageEditorWorkspace,
    type PackageEditorWorkspaceProps,
} from '@/components/package-editor-workspace';

type PackageFormProps = Omit<PackageEditorWorkspaceProps, 'editorMode'>;

export function PackageForm(props: PackageFormProps) {
    return <PackageEditorWorkspace {...props} editorMode="package" />;
}
