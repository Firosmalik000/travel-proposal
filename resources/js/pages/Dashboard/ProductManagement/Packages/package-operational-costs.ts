import type { PackageOperationalCosts } from './types';

export const emptyPackageOperationalCosts: PackageOperationalCosts = {
    overhead: { amount: 0, mode: 'total' },
    photographer: { count: 0, daily_salary: 0, days: 0 },
    human_resources: [],
    tour_leader: {
        count: 0,
        salary_per_trip: 0,
        include_hotel: true,
        include_ticket_and_visa: true,
    },
    muthawwif: {
        count: 0,
        daily_salary: 0,
        days: 0,
        currency: 'SAR',
        include_hotel: true,
    },
    marketing: { amount_per_pax: 0 },
    guide_tips: [],
    driver_tips: [],
};

const nonNegativeNumber = (value: unknown): number =>
    Math.max(0, Number(value) || 0);

export function normalizePackageOperationalCosts(
    value?: Partial<PackageOperationalCosts> | null,
): PackageOperationalCosts {
    return {
        overhead: {
            amount: nonNegativeNumber(value?.overhead?.amount),
            mode: value?.overhead?.mode === 'per_pax' ? 'per_pax' : 'total',
        },
        photographer: {
            count: nonNegativeNumber(value?.photographer?.count),
            daily_salary: nonNegativeNumber(value?.photographer?.daily_salary),
            days: nonNegativeNumber(value?.photographer?.days),
        },
        human_resources: Array.isArray(value?.human_resources)
            ? value.human_resources.map((item, index) => ({
                  id: String(item.id || `sdm-${index + 1}`),
                  name: String(item.name ?? ''),
                  salary: nonNegativeNumber(item.salary),
              }))
            : [],
        tour_leader: {
            count: nonNegativeNumber(value?.tour_leader?.count),
            salary_per_trip: nonNegativeNumber(
                value?.tour_leader?.salary_per_trip,
            ),
            include_hotel: value?.tour_leader?.include_hotel !== false,
            include_ticket_and_visa:
                value?.tour_leader?.include_ticket_and_visa !== false,
        },
        muthawwif: {
            count: nonNegativeNumber(value?.muthawwif?.count),
            daily_salary: nonNegativeNumber(value?.muthawwif?.daily_salary),
            days: nonNegativeNumber(value?.muthawwif?.days),
            currency: String(value?.muthawwif?.currency || 'SAR').toUpperCase(),
            include_hotel: value?.muthawwif?.include_hotel !== false,
        },
        marketing: {
            amount_per_pax: nonNegativeNumber(value?.marketing?.amount_per_pax),
        },
        guide_tips: Array.isArray(value?.guide_tips)
            ? value.guide_tips.map((item, index) => ({
                  id: String(item.id || `guide-${index + 1}`),
                  country: String(item.country ?? ''),
                  amount_per_day: nonNegativeNumber(item.amount_per_day),
                  days: nonNegativeNumber(item.days),
                  currency: String(item.currency || 'USD').toUpperCase(),
                  mode: item.mode === 'per_group' ? 'per_group' : 'per_pax',
              }))
            : [],
        driver_tips: Array.isArray(value?.driver_tips)
            ? value.driver_tips.map((item, index) => ({
                  id: String(item.id || `driver-${index + 1}`),
                  country: String(item.country ?? ''),
                  amount: nonNegativeNumber(item.amount),
                  currency: String(item.currency || 'IDR').toUpperCase(),
              }))
            : [],
    };
}

export type OperationalCostTotals = {
    humanResources: number;
    overhead: number;
    photographer: number;
    tourLeader: number;
    muthawwif: number;
    marketing: number;
    guideTips: number;
    driverTips: number;
    total: number;
};

export function calculateOperationalCostTotals(
    costs: PackageOperationalCosts,
    customerCount: number,
    hotelTotal: number,
    ticketAndVisaTotal: number,
    convertToIdr: (amount: number, currency: string) => number,
): OperationalCostTotals {
    const pax = Math.max(0, customerCount);
    const hotelPerPax = pax > 0 ? hotelTotal / pax : 0;
    const ticketAndVisaPerPax = pax > 0 ? ticketAndVisaTotal / pax : 0;
    const humanResources = costs.human_resources.reduce(
        (total, item) => total + nonNegativeNumber(item.salary),
        0,
    );
    const overhead =
        costs.overhead.mode === 'per_pax'
            ? nonNegativeNumber(costs.overhead.amount) * pax
            : nonNegativeNumber(costs.overhead.amount);
    const photographer =
        nonNegativeNumber(costs.photographer.count) *
        nonNegativeNumber(costs.photographer.daily_salary) *
        nonNegativeNumber(costs.photographer.days);
    const tourLeaderSupport =
        (costs.tour_leader.include_hotel ? hotelPerPax : 0) +
        (costs.tour_leader.include_ticket_and_visa ? ticketAndVisaPerPax : 0);
    const tourLeader = Math.round(
        nonNegativeNumber(costs.tour_leader.count) *
            (nonNegativeNumber(costs.tour_leader.salary_per_trip) +
                tourLeaderSupport),
    );
    const muthawwifSalary = convertToIdr(
        nonNegativeNumber(costs.muthawwif.daily_salary),
        costs.muthawwif.currency,
    );
    const muthawwif = Math.round(
        nonNegativeNumber(costs.muthawwif.count) *
            (muthawwifSalary * nonNegativeNumber(costs.muthawwif.days) +
                (costs.muthawwif.include_hotel ? hotelPerPax : 0)),
    );
    const marketing = nonNegativeNumber(costs.marketing.amount_per_pax);
    const guideTips = costs.guide_tips.reduce((total, item) => {
        const multiplier = item.mode === 'per_pax' ? pax : 1;

        return (
            total +
            convertToIdr(item.amount_per_day, item.currency) *
                nonNegativeNumber(item.days) *
                multiplier
        );
    }, 0);
    const driverTips = costs.driver_tips.reduce(
        (total, item) => total + convertToIdr(item.amount, item.currency),
        0,
    );

    return {
        humanResources,
        overhead,
        photographer,
        tourLeader,
        muthawwif,
        marketing,
        guideTips,
        driverTips,
        total:
            humanResources +
            overhead +
            photographer +
            tourLeader +
            muthawwif +
            marketing +
            guideTips +
            driverTips,
    };
}
