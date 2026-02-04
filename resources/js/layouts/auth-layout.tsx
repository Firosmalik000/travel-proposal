import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';

export default function AuthLayout({
    children,
    title,
    description,
    sideTitle,
    sideHeadline,
    sideDescription,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    sideTitle?: string;
    sideHeadline?: string;
    sideDescription?: string;
}) {
    return (
        <AuthLayoutTemplate
            title={title}
            description={description}
            sideTitle={sideTitle}
            sideHeadline={sideHeadline}
            sideDescription={sideDescription}
            {...props}
        >
            {children}
        </AuthLayoutTemplate>
    );
}
