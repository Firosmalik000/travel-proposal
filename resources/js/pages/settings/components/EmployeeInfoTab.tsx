import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface Department {
    id: number;
    name: string;
}

interface Jabatan {
    id: number;
    name: string;
}

interface Karyawan {
    id: number;
    nik: string;
    nama_lengkap: string;
    nama_panggilan: string;
    gender: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    alamat: string;
    agama: string;
    status_pernikahan: string;
    email: string;
    no_telp: string;
    foto?: string;
    department?: Department;
    jabatan?: Jabatan;
    tanggal_mulai_bekerja: string;
    status_karyawan: string;
}

interface Props {
    karyawan?: Karyawan;
}

export default function EmployeeInfoTab({ karyawan }: Props) {
    if (!karyawan) {
        return (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Data karyawan tidak ditemukan
                </AlertDescription>
            </Alert>
        );
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'tetap':
                return 'default';
            case 'kontrak':
                return 'secondary';
            case 'probation':
                return 'outline';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'tetap':
                return 'Karyawan Tetap';
            case 'kontrak':
                return 'Karyawan Kontrak';
            case 'probation':
                return 'Probation';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Informasi pekerjaan hanya dapat diubah oleh HRD. Jika ada perubahan yang diperlukan, silakan hubungi departemen HRD.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NIK */}
                <div className="space-y-2">
                    <Label htmlFor="employee_nik">NIK</Label>
                    <Input
                        id="employee_nik"
                        value={karyawan.nik}
                        disabled
                        className="bg-muted"
                    />
                </div>

                {/* Status Karyawan */}
                <div className="space-y-2">
                    <Label htmlFor="status_karyawan">Status Karyawan</Label>
                    <div className="flex h-10 items-center">
                        <Badge variant={getStatusBadgeVariant(karyawan.status_karyawan)} className="text-sm">
                            {getStatusLabel(karyawan.status_karyawan)}
                        </Badge>
                    </div>
                </div>

                {/* Department */}
                <div className="space-y-2">
                    <Label htmlFor="department">Departemen</Label>
                    <Input
                        id="department"
                        value={karyawan.department?.name || '-'}
                        disabled
                        className="bg-muted"
                    />
                </div>

                {/* Jabatan */}
                <div className="space-y-2">
                    <Label htmlFor="jabatan">Jabatan</Label>
                    <Input
                        id="jabatan"
                        value={karyawan.jabatan?.name || '-'}
                        disabled
                        className="bg-muted"
                    />
                </div>

                {/* Tanggal Mulai Bekerja */}
                <div className="space-y-2">
                    <Label htmlFor="tanggal_mulai_bekerja">Tanggal Mulai Bekerja</Label>
                    <Input
                        id="tanggal_mulai_bekerja"
                        value={formatDate(karyawan.tanggal_mulai_bekerja)}
                        disabled
                        className="bg-muted"
                    />
                </div>

                {/* Email Karyawan */}
                <div className="space-y-2">
                    <Label htmlFor="employee_email">Email Karyawan</Label>
                    <Input
                        id="employee_email"
                        value={karyawan.email}
                        disabled
                        className="bg-muted"
                    />
                </div>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                        Untuk perubahan informasi pekerjaan seperti departemen, jabatan, atau status karyawan,
                        silakan ajukan permintaan ke departemen HRD melalui sistem ticketing atau hubungi langsung.
                    </p>
                </div>
            </div>
        </div>
    );
}
