import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

function comparePhpVersions(left: string, right: string): number {
    const leftParts = left.split('.').map((part) => Number.parseInt(part, 10));
    const rightParts = right
        .split('.')
        .map((part) => Number.parseInt(part, 10));
    const maxLength = Math.max(leftParts.length, rightParts.length);

    for (let index = 0; index < maxLength; index += 1) {
        const leftPart = leftParts[index] ?? 0;
        const rightPart = rightParts[index] ?? 0;

        if (leftPart !== rightPart) {
            return leftPart - rightPart;
        }
    }

    return 0;
}

function resolvePhpBinary(): string {
    if (process.env.PHP_BINARY) {
        return process.env.PHP_BINARY;
    }

    try {
        const phpFromPath = execFileSync('where', ['php'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        })
            .split(/\r?\n/)
            .map((line) => line.trim())
            .find((line) => line.length > 0);

        if (phpFromPath) {
            return phpFromPath;
        }
    } catch {
        // Fall through to Laragon lookup.
    }

    if (process.platform === 'win32') {
        const laragonPhpDirectory = 'C:\\laragon\\bin\\php';

        if (existsSync(laragonPhpDirectory)) {
            const phpExecutable = readdirSync(laragonPhpDirectory, {
                withFileTypes: true,
            })
                .filter((entry) => entry.isDirectory())
                .sort((left, right) => {
                    const leftVersion =
                        left.name.match(/php-(\d+(?:\.\d+)+)/i)?.[1] ?? '0';
                    const rightVersion =
                        right.name.match(/php-(\d+(?:\.\d+)+)/i)?.[1] ?? '0';

                    return comparePhpVersions(rightVersion, leftVersion);
                })
                .map((entry) =>
                    path.join(laragonPhpDirectory, entry.name, 'php.exe'),
                )
                .find((candidate) => existsSync(candidate));

            if (phpExecutable) {
                return phpExecutable;
            }
        }
    }

    return 'php';
}

const phpBinary = resolvePhpBinary();

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
            command: `${phpBinary} artisan wayfinder:generate`,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
