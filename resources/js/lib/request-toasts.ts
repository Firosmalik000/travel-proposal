import { router } from '@inertiajs/react';
import { toast } from 'sonner';

type FlashMessages = {
    success?: unknown;
    error?: unknown;
};

let initialized = false;
let mutationRequestPending = false;

export const requestMessageFrom = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim() !== '') {
        const message = value.trim();

        if (message.startsWith('<') || message.length > 300) {
            return null;
        }

        return message;
    }

    if (Array.isArray(value)) {
        return value.map(requestMessageFrom).find(Boolean) ?? null;
    }

    if (value && typeof value === 'object') {
        return (
            Object.values(value).map(requestMessageFrom).find(Boolean) ?? null
        );
    }

    return null;
};

const activeToastIds = (): Set<string | number> =>
    new Set(toast.getToasts().map((item) => item.id));

const showUnlessHandledLocally = (showToast: () => void): void => {
    const existingToastIds = activeToastIds();

    window.setTimeout(() => {
        const localToastWasAdded = toast
            .getToasts()
            .some((item) => !existingToastIds.has(item.id));

        if (!localToastWasAdded) {
            showToast();
        }
    }, 75);
};

const showSuccess = (message: string): void => {
    showUnlessHandledLocally(() =>
        toast.success(message, {
            id: 'global-request-success',
            duration: 4500,
        }),
    );
};

const showError = (message: string): void => {
    showUnlessHandledLocally(() =>
        toast.error(message, {
            id: 'global-request-error',
            duration: 7000,
        }),
    );
};

const flashFrom = (props: Record<string, unknown>): FlashMessages => {
    const flash = props.flash;

    return flash && typeof flash === 'object' ? (flash as FlashMessages) : {};
};

export const initializeRequestToasts = (
    initialProps: Record<string, unknown>,
): void => {
    if (initialized || typeof window === 'undefined') {
        return;
    }

    initialized = true;

    const initialFlash = flashFrom(initialProps);
    const initialError = requestMessageFrom(initialFlash.error);
    const initialSuccess = requestMessageFrom(initialFlash.success);

    if (initialError) {
        showError(initialError);
    } else if (initialSuccess) {
        showSuccess(initialSuccess);
    }

    router.on('start', (event) => {
        if (event.detail.visit.method !== 'get') {
            mutationRequestPending = true;
        }
    });

    router.on('success', (event) => {
        if (!mutationRequestPending) {
            return;
        }

        const flash = flashFrom(event.detail.page.props);
        const errorMessage = requestMessageFrom(flash.error);

        if (errorMessage) {
            showError(errorMessage);
        } else {
            showSuccess(
                requestMessageFrom(flash.success) ??
                    'Permintaan berhasil diproses.',
            );
        }

        mutationRequestPending = false;
    });

    router.on('error', (event) => {
        showError(
            requestMessageFrom(event.detail.errors) ??
                'Data belum dapat diproses. Periksa kembali input yang diisi.',
        );
        mutationRequestPending = false;
    });

    router.on('invalid', (event) => {
        const responseData = event.detail.response.data;
        const responseMessage =
            responseData && typeof responseData === 'object'
                ? requestMessageFrom(
                      (responseData as Record<string, unknown>).message,
                  )
                : null;

        showError(
            responseMessage ??
                'Server mengembalikan respons yang tidak dapat diproses.',
        );
        mutationRequestPending = false;
    });

    router.on('exception', () => {
        showError('Terjadi kesalahan saat memproses permintaan. Coba lagi.');
        mutationRequestPending = false;
    });

    router.on('finish', (event) => {
        if (event.detail.visit.cancelled || event.detail.visit.interrupted) {
            mutationRequestPending = false;
        }
    });
};
