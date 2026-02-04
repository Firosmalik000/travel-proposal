<table width="100%" style="border-bottom: 3px solid #ED1C24; padding: 10px 0; margin: 0 0 15px 0;">
    <tr>
        <td width="15%" style="vertical-align: middle;">
            <img src="{{ public_path('Logo5.png') }}" style="width: 60px; height: auto;" alt="Logo">
        </td>
        <td width="55%" style="vertical-align: top; padding-left: 10px;">
            <div style="color: #ED1C24; font-size: 15pt; font-weight: bold; margin: 0;">
                PT XBOSS ASIA GROUP
            </div>
            <div style="color: #666; font-size: 7pt; margin: 4px 0 0 0; line-height: 1.4;">
                Human Resources Department - Employee Management<br>
                Jl. Synthesis RB 29 RT 004 RW 019 Purnawarman Pisangan,<br>
                Ciputat Timur, Tangerang Selatan, Banten 15419 | Telp: 08563505050
            </div>
        </td>
        <td width="30%" style="text-align: right; vertical-align: top;">
            <div style="background-color: #ED1C24; color: white; padding: 8px 12px; display: inline-block; border-radius: 4px; font-size: 8pt; font-weight: bold; margin-bottom: 5px;">
                HRD EMPLOYEE
            </div>
            <div style="color: #666; font-size: 7pt; line-height: 1.5;">
                <strong>Data Tamu</strong><br>
                Dicetak: {{ now()->format('d/m/Y H:i') }}<br>
                Hal: {PAGENO} / {nbpg}
            </div>
        </td>
    </tr>
</table>
