interface RateRecord {
    rate: number;
    source: string;
    timestamp: string;
}

interface CurrencyHistory {
    [currency: string]: RateRecord[];
}

const STORAGE_KEY = 'currency_rates_history';
const MAX_RECORDS_PER_CURRENCY = 10;

export function storeCurrencyRate(
    currency: string,
    rate: number,
    source: string,
    timestamp: string,
): void {
    const history = getCurrencyHistoryObject();

    if (!history[currency]) {
        history[currency] = [];
    }

    history[currency].unshift({ rate, source, timestamp });
    history[currency] = history[currency].slice(0, MAX_RECORDS_PER_CURRENCY);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getCurrencyHistory(currency: string): RateRecord[] {
    const history = getCurrencyHistoryObject();
    return history[currency] || [];
}

function getCurrencyHistoryObject(): CurrencyHistory {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

export function clearCurrencyHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
}
