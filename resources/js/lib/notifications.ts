import Swal from 'sweetalert2';

export const showLoading = (message: string = 'Loading...') => {
    Swal.fire({
        title: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

export const hideLoading = () => {
    Swal.close();
};

export const showSuccess = (message: string, title: string = 'Success!') => {
    return Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        confirmButtonColor: '#0f766e',
        confirmButtonText: 'OK',
    });
};

export const showError = (message: string, title: string = 'Error!', details?: string) => {
    return Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        footer: details ? `<small class="text-gray-600">${details}</small>` : undefined,
        confirmButtonColor: '#0f766e',
        confirmButtonText: 'OK',
    });
};

export const showWarning = (message: string, title: string = 'Warning!') => {
    return Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
        confirmButtonColor: '#0f766e',
        confirmButtonText: 'OK',
    });
};

export const showInfo = (message: string, title: string = 'Info') => {
    return Swal.fire({
        icon: 'info',
        title: title,
        text: message,
        confirmButtonColor: '#0f766e',
        confirmButtonText: 'OK',
    });
};

export const showConfirm = (
    message: string,
    title: string = 'Are you sure?',
    confirmButtonText: string = 'Yes',
    cancelButtonText: string = 'Cancel'
) => {
    return Swal.fire({
        icon: 'question',
        title: title,
        text: message,
        showCancelButton: true,
        confirmButtonColor: '#0f766e',
        cancelButtonColor: '#6B7280',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
    });
};

// Handle API errors with proper formatting
export const handleApiError = (error: any) => {
    let errorMessage = 'An unexpected error occurred';
    let errorDetails = '';

    if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;

        errorMessage = data.message || `Error ${status}: ${error.response.statusText}`;

        // Add validation errors if available
        if (data.errors) {
            const validationErrors = Object.entries(data.errors)
                .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                .join('<br>');
            errorDetails = `<div class="text-left mt-2"><strong>Validation Errors:</strong><br>${validationErrors}</div>`;
        }

        // Add file and line info if available (for development)
        if (data.file && data.line) {
            errorDetails += `<div class="text-xs text-gray-500 mt-2">File: ${data.file}:${data.line}</div>`;
        }

        // Add exception message if available
        if (data.exception) {
            errorDetails += `<div class="text-xs text-gray-500 mt-1">Exception: ${data.exception}</div>`;
        }
    } else if (error.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check your connection.';
    } else {
        // Something else happened
        errorMessage = error.message || 'An error occurred';
    }

    return showError(errorMessage, 'Error', errorDetails);
};
