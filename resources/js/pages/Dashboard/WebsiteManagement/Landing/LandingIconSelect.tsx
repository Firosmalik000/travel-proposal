const iconOptions = [
    { value: '', label: 'Tanpa ikon', preview: '○' },
    { value: 'hotel', label: 'Hotel', preview: '🏨' },
    { value: 'plane', label: 'Pesawat', preview: '✈️' },
    { value: 'images', label: 'Dokumentasi', preview: '🖼️' },
    { value: 'shield-check', label: 'Legal & Amanah', preview: '🛡️' },
    { value: 'users', label: 'Jamaah / Tim', preview: '👥' },
    { value: 'heart-handshake', label: 'Pendampingan', preview: '🤝' },
    { value: 'check-circle-2', label: 'Checklist', preview: '✅' },
    { value: 'credit-card', label: 'Pembayaran', preview: '💳' },
    { value: 'landmark', label: 'Kemenag / Legalitas', preview: '🏛️' },
    { value: 'calendar-days', label: 'Jadwal', preview: '📅' },
    { value: 'map-pin', label: 'Lokasi', preview: '📍' },
    { value: 'briefcase', label: 'Layanan', preview: '💼' },
    { value: 'building-2', label: 'Fasilitas', preview: '🏢' },
    { value: 'circle-dollar-sign', label: 'Biaya', preview: '💰' },
    { value: 'clipboard-list', label: 'List Dokumen', preview: '📝' },
    { value: 'file-check-2', label: 'Verifikasi', preview: '🧾' },
    { value: 'globe', label: 'Perjalanan', preview: '🌍' },
    { value: 'headset', label: 'Support', preview: '🎧' },
    { value: 'id-card', label: 'Identitas', preview: '🪪' },
    { value: 'luggage', label: 'Perlengkapan', preview: '🧳' },
    { value: 'message-circle', label: 'Konsultasi', preview: '💬' },
    { value: 'notebook-pen', label: 'Catatan Ibadah', preview: '📝' },
    { value: 'star', label: 'Unggulan', preview: '⭐' },
    { value: 'ticket', label: 'Tiket', preview: '🎫' },
] as const;

export function LandingIconSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.preview} {option.label}
                </option>
            ))}
        </select>
    );
}
