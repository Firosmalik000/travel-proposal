import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

type Props = {
    bookingType: string;
    packageId: string;
    packages: Array<{ label: string; value: string }>;
    search: string;
    status: string;
    onBookingTypeChange: (value: string) => void;
    onPackageChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
};

export function BookingListingFilters({
    bookingType,
    packageId,
    packages,
    search,
    status,
    onBookingTypeChange,
    onPackageChange,
    onSearchChange,
    onStatusChange,
}: Props) {
    return (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="relative min-w-0">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Cari kode, nama, paket, kota..."
                    className="pl-9"
                />
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-[140px_180px_140px]">
                <div className="min-w-0">
                    <Select
                        value={bookingType}
                        onValueChange={onBookingTypeChange}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="regular">Paket</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                            <SelectItem value="all">Semua</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="min-w-0">
                    <Select
                        value={packageId}
                        disabled={bookingType === 'custom'}
                        onValueChange={onPackageChange}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Paket" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua paket</SelectItem>
                            {packages.map((travelPackage) => (
                                <SelectItem
                                    key={travelPackage.value}
                                    value={travelPackage.value}
                                >
                                    {travelPackage.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="min-w-0">
                    <Select value={status} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="registered">
                                Registered
                            </SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
