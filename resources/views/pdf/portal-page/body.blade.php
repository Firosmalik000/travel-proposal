<div class="card">
    @if (trim($bodyHtml) !== '')
        {!! $bodyHtml !!}
    @else
        <p class="muted">
            {{ $locale === 'id' ? 'Konten belum diisi.' : 'Content has not been filled in yet.' }}
        </p>
    @endif

    <div class="footer-note">
        {{ $locale === 'id' ? 'Dokumen ini dihasilkan otomatis dari Portal Content (Policy & Help).' : 'This document is generated automatically from Portal Content (Policy & Help).' }}
    </div>
</div>
