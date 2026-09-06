import { Button } from '@/components/ui/button';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface RateData {
    rate_to_idr: number;
    source: string;
    fetched_at: string;
    is_live: boolean;
}

interface RatesResponse {
    rates: {
        USD: RateData;
        SAR: RateData;
        EGP: RateData;
        EUR: RateData;
    };
    last_update: string;
}

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function CurrencyRatesPanel() {
    const [rates, setRates] = useState<RatesResponse['rates'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);
    const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState<
        string | null
    >(null);
    const [fetchError, setFetchError] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const formatRate = (rate: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        }).format(Math.round(rate));
    };

    const formatTime = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        } catch {
            return '';
        }
    };

    const fetchRates = async () => {
        // Prevent duplicate requests
        if (loading) return;

        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/currency-rates', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch rates: ${response.status}`);
            }

            const data: RatesResponse = await response.json();
            setRates(data.rates);
            setLastUpdate(data.last_update);
            setLastSuccessfulUpdate(data.last_update);
            setFetchError(false);
        } catch (err) {
            // If request was aborted, don't update error state
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }

            // On error, keep the last successful rates displayed
            setFetchError(true);
            console.error('Currency rates fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and setup auto-refresh
    useEffect(() => {
        // Fetch immediately on mount
        fetchRates();

        // Setup interval for auto-refresh
        const setupInterval = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            intervalRef.current = setInterval(fetchRates, REFRESH_INTERVAL);
        };

        setupInterval();

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Handle manual refresh with timer reset
    const handleManualRefresh = async () => {
        await fetchRates();

        // Reset the auto-refresh timer after successful manual refresh
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(fetchRates, REFRESH_INTERVAL);
    };

    const currencies = ['USD', 'SAR', 'EGP', 'EUR'] as const;

    // Show skeleton while initial loading
    if (!rates && !fetchError) {
        return <CurrencySkeleton />;
    }

    // Show empty state if no rates and error
    if (!rates && fetchError) {
        return (
            <SidebarGroup className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between px-2">
                    <SidebarGroupLabel className="text-xs text-white/70">
                        Exchange Rates
                    </SidebarGroupLabel>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleManualRefresh}
                        disabled={loading}
                        className="h-5 w-5 text-white/70 hover:bg-white/10 hover:text-white"
                        title="Retry"
                    >
                        <RefreshCw
                            className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`}
                        />
                    </Button>
                </div>
                <SidebarGroupContent className="mt-2">
                    <div className="text-xs text-red-400/80">
                        Failed to load rates
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    return (
        <SidebarGroup className="border-t border-white/10 pt-3 pb-0">
            <div className="mb-2 flex items-center justify-between px-2">
                <SidebarGroupLabel className="text-xs text-white/70">
                    Exchange Rates
                </SidebarGroupLabel>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="h-5 w-5 p-0 text-white/70 hover:bg-white/10 hover:text-white"
                    title="Refresh rates"
                >
                    <RefreshCw
                        className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`}
                    />
                </Button>
            </div>

            <SidebarGroupContent className="space-y-0">
                {/* Currency rows */}
                {currencies.map((currency) => {
                    const rateData = rates?.[currency];
                    if (!rateData) return null;

                    return (
                        <div
                            key={currency}
                            className="flex items-center justify-between rounded px-2 py-1.5 text-xs transition hover:bg-white/5"
                        >
                            <span className="min-w-12 font-medium text-white/80">
                                {currency}
                            </span>
                            <span className="font-semibold text-white/90">
                                Rp{formatRate(rateData.rate_to_idr)}
                            </span>
                        </div>
                    );
                })}

                {/* Separator */}
                <div className="my-1.5 h-px bg-white/10" />

                {/* Status row */}
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs">
                    <span
                        className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                            rates?.[currencies[0]]?.is_live
                                ? 'bg-green-400'
                                : 'bg-gray-500'
                        }`}
                    />
                    <span className="text-white/60">
                        {rates?.[currencies[0]]?.is_live ? 'Live' : 'Cached'}
                    </span>
                    {lastSuccessfulUpdate && (
                        <span className="ml-auto text-white/50">
                            {formatTime(lastSuccessfulUpdate)}
                        </span>
                    )}
                </div>

                {/* Error indicator */}
                {fetchError && (
                    <div className="px-2 py-1 text-xs text-yellow-400/80">
                        Last update failed
                    </div>
                )}
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

function CurrencySkeleton() {
    return (
        <SidebarGroup className="border-t border-white/10 pt-3">
            <div className="mb-2 flex items-center justify-between px-2">
                <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-4 animate-pulse rounded bg-white/10" />
            </div>
            <SidebarGroupContent className="space-y-2">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-5 animate-pulse rounded bg-white/8"
                    />
                ))}
                <div className="my-1.5 h-px bg-white/10" />
                <div className="h-4 animate-pulse rounded bg-white/8" />
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
