import { type SVGProps } from 'react';

export default function KaabaIllustration({
    className,
    ...props
}: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 320 240"
            fill="none"
            aria-hidden="true"
            className={className}
            {...props}
        >
            <path
                d="M0 213.5h320"
                stroke="currentColor"
                strokeOpacity=".18"
                strokeWidth="1.5"
            />
            <path
                d="M47 213v-76h9v76M264 213v-91h9v91M39 137h25l-12-10-13 10ZM256 122h25l-12-11-13 11Z"
                fill="currentColor"
                fillOpacity=".22"
            />
            <path
                d="M64 213v-54c0-16 13-29 29-29s29 13 29 29v54M198 213v-54c0-16 13-29 29-29s29 13 29 29v54"
                fill="currentColor"
                fillOpacity=".17"
            />
            <path
                d="M133 213v-63c0-15 12-27 27-27s27 12 27 27v63"
                fill="currentColor"
                fillOpacity=".34"
            />
            <path
                d="M136 150c0-18 11-30 24-30s24 12 24 30"
                stroke="currentColor"
                strokeOpacity=".58"
                strokeWidth="3"
            />
            <path
                d="m105 213 9-88 47-23 47 23 9 88H105Z"
                fill="#111827"
                fillOpacity=".96"
            />
            <path d="m114 125 47-23 47 23-47 24-47-24Z" fill="#242c38" />
            <path d="m114 127 47 24v62l-47-3v-83Z" fill="#0b1017" />
            <path d="m161 151 47-24v83l-47 3v-62Z" fill="#151c25" />
            <path
                d="m114 142 47 24 47-24v10l-47 25-47-25v-10Z"
                fill="#C79A47"
                fillOpacity=".95"
            />
            <path d="M151 174h20v39h-20z" fill="#070a0e" />
            <path d="M155 174h12v5h-12z" fill="#C79A47" fillOpacity=".8" />
            <circle cx="161" cy="116" r="3" fill="#E8C978" />
            <path
                d="M161 82V63M156 68h10M155 76h12"
                stroke="#E8C978"
                strokeLinecap="round"
                strokeWidth="2"
            />
            <path
                d="M36 214h248"
                stroke="#E8C978"
                strokeOpacity=".35"
                strokeWidth="2"
            />
        </svg>
    );
}
