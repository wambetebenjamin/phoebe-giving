import type { FundId, Gift, Store } from "./types";
import { initials } from "./format";

const FUNDS: FundId[] = ["tithe", "offering", "building", "missions", "benevolence"];

function inMonth(iso: string, year: number, month: number) {
  const date = new Date(iso);
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month;
}

function inYear(iso: string, year: number) {
  return new Date(iso).getUTCFullYear() === year;
}

export function dashboardStats(store: Store, now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const monthGifts = store.gifts.filter((gift) => inMonth(gift.createdAt, year, month));
  const yearGifts = store.gifts.filter((gift) => inYear(gift.createdAt, year));
  const unique = new Set(monthGifts.map((gift) => gift.email || gift.phone));
  const monthTotal = monthGifts.reduce((sum, gift) => sum + gift.amount, 0);
  const yearTotal = yearGifts.reduce((sum, gift) => sum + gift.amount, 0);

  const monthly = Array.from({ length: 12 }, (_, index) => {
    const m = index + 1;
    const total = store.gifts
      .filter((gift) => inMonth(gift.createdAt, year, m))
      .reduce((sum, gift) => sum + gift.amount, 0);
    const label = new Date(Date.UTC(year, index, 1)).toLocaleString("en-KE", { month: "short" });
    return { month: label, total };
  });

  const byFund = FUNDS.map((fund) => ({
    fund: store.settings.funds.find((item) => item.id === fund)?.name || fund,
    id: fund,
    total: yearGifts.filter((gift) => gift.fund === fund).reduce((sum, gift) => sum + gift.amount, 0),
  }));

  const recurringEmails = new Set(
    store.gifts.filter((gift) => gift.frequency !== "one-time" && gift.recurringStatus !== "cancelled").map((gift) => gift.email),
  );
  const oneTimeEmails = new Set(
    store.gifts.filter((gift) => gift.frequency === "one-time").map((gift) => gift.email),
  );
  const pie = [
    { name: "One time", value: [...oneTimeEmails].filter((email) => !recurringEmails.has(email)).length },
    { name: "Recurring", value: recurringEmails.size },
  ];

  const quarterStart = new Date(Date.UTC(year, Math.floor((month - 1) / 3) * 3, 1));
  const weekly: { week: string; total: number }[] = [];
  for (let cursor = new Date(quarterStart); cursor <= now; cursor = new Date(cursor.getTime() + 7 * 86400000)) {
    const start = cursor.getTime();
    const end = start + 7 * 86400000;
    const total = store.gifts
      .filter((gift) => {
        const time = new Date(gift.createdAt).getTime();
        return time >= start && time < end;
      })
      .reduce((sum, gift) => sum + gift.amount, 0);
    weekly.push({
      week: cursor.toLocaleDateString("en-KE", { day: "numeric", month: "short" }),
      total,
    });
  }
  if (weekly.length === 0) weekly.push({ week: "This week", total: 0 });

  const giverTotals = new Map<string, { name: string; total: number }>();
  monthGifts.forEach((gift) => {
    const key = gift.email || gift.phone;
    const current = giverTotals.get(key) || { name: gift.name, total: 0 };
    current.total += gift.amount;
    giverTotals.set(key, current);
  });
  const topGivers = [...giverTotals.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((item) => ({ initials: initials(item.name), total: item.total }));

  return {
    kpis: {
      monthTotal,
      yearTotal,
      uniqueGivers: unique.size,
      averageGift: monthGifts.length ? Math.round(monthTotal / monthGifts.length) : 0,
    },
    monthly,
    byFund,
    pie,
    weekly,
    topGivers,
    campaigns: store.campaigns,
  };
}

export function memberSummary(gifts: Gift[], now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const yearGifts = gifts.filter((gift) => inYear(gift.createdAt, year));
  const monthGifts = gifts.filter((gift) => inMonth(gift.createdAt, year, month));
  const byFund = FUNDS.map((fund) => ({
    fund,
    total: yearGifts.filter((gift) => gift.fund === fund).reduce((sum, gift) => sum + gift.amount, 0),
  }));
  return {
    yearTotal: yearGifts.reduce((sum, gift) => sum + gift.amount, 0),
    monthTotal: monthGifts.reduce((sum, gift) => sum + gift.amount, 0),
    byFund,
  };
}

export function filterGifts(
  gifts: Gift[],
  query: { from?: string; to?: string; fund?: string; giver?: string },
) {
  return gifts.filter((gift) => {
    if (query.fund && query.fund !== "all" && gift.fund !== query.fund) return false;
    if (query.giver) {
      const haystack = `${gift.name} ${gift.email}`.toLowerCase();
      if (!haystack.includes(query.giver.toLowerCase())) return false;
    }
    if (query.from && new Date(gift.createdAt) < new Date(query.from)) return false;
    if (query.to && new Date(gift.createdAt) > new Date(`${query.to}T23:59:59`)) return false;
    return true;
  });
}
