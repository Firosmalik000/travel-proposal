<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boss Approval Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="700" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                                👔 Final Approval Request
                            </h1>
                            <p style="margin: 10px 0 0; color: #f3f4f6; font-size: 16px;">
                                Persetujuan Kandidat dari Boss
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                                Kepada Yth. <strong>Boss</strong>,
                            </p>

                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                                Kandidat berikut telah melalui proses interview dan mendapat persetujuan dari HRD dan User.
                                Kami memerlukan persetujuan akhir dari Anda untuk melanjutkan kandidat ini ke tahap <strong>Offering Salary</strong>.
                            </p>

                            <!-- Kandidat Profile Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 12px; padding: 25px; border: 2px solid #e5e7eb;">
                                <tr>
                                    <td>
                                        <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827; border-bottom: 3px solid #7c3aed; padding-bottom: 10px; display: inline-block;">
                                            📋 DATA KANDIDAT
                                        </h2>

                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td width="35%" style="font-size: 14px; color: #6b7280; font-weight: 600; vertical-align: top;">Nama Lengkap</td>
                                                <td style="font-size: 16px; color: #111827; font-weight: 700;">{{ $kandidat->nama_lengkap }}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 14px; color: #6b7280; font-weight: 600; vertical-align: top;">Email</td>
                                                <td style="font-size: 15px; color: #111827;">{{ $kandidat->email }}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 14px; color: #6b7280; font-weight: 600; vertical-align: top;">Posisi yang Dilamar</td>
                                                <td style="font-size: 16px; color: #7c3aed; font-weight: 700;">{{ $kandidat->posisi_dilamar ?? 'Staff' }}</td>
                                            </tr>
                                            @if($kandidat->tempat_lahir || $kandidat->tanggal_lahir)
                                            <tr>
                                                <td style="font-size: 14px; color: #6b7280; font-weight: 600; vertical-align: top;">Tempat, Tanggal Lahir</td>
                                                <td style="font-size: 15px; color: #111827;">
                                                    {{ $kandidat->tempat_lahir ?? '-' }},
                                                    {{ $kandidat->tanggal_lahir ? \Carbon\Carbon::parse($kandidat->tanggal_lahir)->locale('id')->isoFormat('D MMMM YYYY') : '-' }}
                                                </td>
                                            </tr>
                                            @endif
                                            @if($kandidat->alamat)
                                            <tr>
                                                <td style="font-size: 14px; color: #6b7280; font-weight: 600; vertical-align: top;">Alamat</td>
                                                <td style="font-size: 15px; color: #111827;">{{ $kandidat->alamat }}</td>
                                            </tr>
                                            @endif
                                            @if($kandidat->ekspektasi_gaji)
                                            <tr>
                                                <td style="font-size: 14px; color: #6b7280; font-weight: 600; vertical-align: top;">Ekspektasi Gaji</td>
                                                <td style="font-size: 16px; color: #059669; font-weight: 700;">
                                                    Rp {{ number_format($kandidat->ekspektasi_gaji, 0, ',', '.') }}
                                                </td>
                                            </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Pendidikan -->
                            @if($kandidat->sekolah && count($kandidat->sekolah) > 0)
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #fef3c7; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 15px; font-size: 18px; color: #92400e; font-weight: 700;">🎓 PENDIDIKAN</h3>
                                        @foreach($kandidat->sekolah as $index => $edu)
                                        <div style="margin-bottom: {{ $loop->last ? '0' : '15px' }}; padding-bottom: {{ $loop->last ? '0' : '15px' }}; border-bottom: {{ $loop->last ? 'none' : '1px solid #fde68a' }};">
                                            <p style="margin: 0 0 5px; font-size: 16px; color: #78350f; font-weight: 700;">{{ $edu['nama_sekolah'] ?? '-' }}</p>
                                            <p style="margin: 0; font-size: 14px; color: #92400e;">
                                                {{ $edu['jurusan'] ?? '-' }} • {{ $edu['masuk'] ?? '-' }} - {{ $edu['lulus'] ?? '-' }}
                                            </p>
                                        </div>
                                        @endforeach
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Pengalaman Kerja -->
                            @if($kandidat->pengalaman_kerja && count($kandidat->pengalaman_kerja) > 0)
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #dbeafe; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 15px; font-size: 18px; color: #1e3a8a; font-weight: 700;">💼 PENGALAMAN KERJA</h3>
                                        @foreach($kandidat->pengalaman_kerja as $index => $exp)
                                        <div style="margin-bottom: {{ $loop->last ? '0' : '15px' }}; padding-bottom: {{ $loop->last ? '0' : '15px' }}; border-bottom: {{ $loop->last ? 'none' : '1px solid #bfdbfe' }};">
                                            <p style="margin: 0 0 5px; font-size: 16px; color: #1e3a8a; font-weight: 700;">{{ $exp['posisi'] ?? '-' }}</p>
                                            <p style="margin: 0 0 3px; font-size: 14px; color: #1e40af;">{{ $exp['nama_perusahaan'] ?? '-' }}</p>
                                            <p style="margin: 0; font-size: 13px; color: #3b82f6;">{{ $exp['mulai'] ?? '-' }} - {{ $exp['sampai'] ?? '-' }}</p>
                                            @if(isset($exp['deskripsi']) && $exp['deskripsi'])
                                            <p style="margin: 8px 0 0; font-size: 14px; color: #1e40af;">{{ $exp['deskripsi'] }}</p>
                                            @endif
                                        </div>
                                        @endforeach
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Skills -->
                            @if($kandidat->skill && count($kandidat->skill) > 0)
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #f3e8ff; border-radius: 8px; padding: 20px; border-left: 4px solid #a855f7;">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 15px; font-size: 18px; color: #581c87; font-weight: 700;">⚡ SKILLS</h3>
                                        <table width="100%" cellpadding="5" cellspacing="0">
                                            @foreach($kandidat->skill as $sk)
                                            <tr>
                                                <td width="40%" style="font-size: 14px; color: #6b21a8; font-weight: 600;">{{ $sk['skill'] ?? '-' }}</td>
                                                <td>
                                                    <div style="background-color: #ddd6fe; height: 12px; border-radius: 6px; overflow: hidden;">
                                                        <div style="background: linear-gradient(90deg, #a855f7 0%, #c084fc 100%); height: 100%; width: {{ ($sk['point'] ?? 0) * 10 }}%;"></div>
                                                    </div>
                                                </td>
                                                <td width="15%" align="right" style="font-size: 14px; color: #581c87; font-weight: 700;">{{ $sk['point'] ?? 0 }}/10</td>
                                            </tr>
                                            @endforeach
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- HRD Review -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; background-color: #dcfce7; border-radius: 8px; padding: 20px; border-left: 4px solid #22c55e;">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 12px; font-size: 18px; color: #166534; font-weight: 700;">✅ REVIEW HRD</h3>
                                        <p style="margin: 0; font-size: 15px; color: #14532d; line-height: 1.8; white-space: pre-wrap;">{{ $reviewHrdText }}</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- User Review -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; background-color: #dbeafe; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 12px; font-size: 18px; color: #1e3a8a; font-weight: 700;">✅ REVIEW USER</h3>
                                        <p style="margin: 0; font-size: 15px; color: #1e40af; line-height: 1.8; white-space: pre-wrap;">{{ $reviewUserText }}</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Action Buttons -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-right: 15px;">
                                                    <a href="{{ $approveUrl }}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 10px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.4);">
                                                        ✅ APPROVE
                                                    </a>
                                                </td>
                                                <td style="padding-left: 15px;">
                                                    <a href="{{ $rejectUrl }}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 10px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.4);">
                                                        ❌ REJECT
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 10px; font-size: 15px; line-height: 1.6; color: #6b7280; text-align: center;">
                                Silakan klik salah satu tombol di atas untuk memberikan keputusan Anda.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
