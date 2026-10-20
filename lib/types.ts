export const FUND_IDS = ["tithe", "offering", "building", "missions", "benevolence"] as const;
export type FundId = (typeof FUND_IDS)[number];
export type Frequency = "one-time" | "weekly" | "monthly";
export type PaymentMethod = "mpesa" | "card";
export type Role = "member" | "admin";
export type RecurringStatus = "active" | "paused" | "cancelled";

export type Fund = {
  id: FundId;
  name: string;
  description: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
};

export type Gift = {
  ref: string;
  fund: FundId;
  amount: number;
  frequency: Frequency;
  name: string;
  phone: string;
  email: string;
  payment: PaymentMethod;
  status: "confirmed";
  createdAt: string;
  userId?: string;
  recurringId?: string;
  recurringStatus?: RecurringStatus;
};

export type Campaign = {
  id: string;
  title: string;
  fund: FundId;
  target: number;
  raised: number;
  startDate: string;
  endDate: string;
  description: string;
  status: "active" | "closed";
};

export type Settings = {
  churchName: string;
  logoUrl: string;
  funds: Fund[];
  mpesaPaybill: string;
  accountPrefix: string;
  emailNotifications: boolean;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
};

export type Store = {
  users: UserRecord[];
  gifts: Gift[];
  campaigns: Campaign[];
  settings: Settings;
  messages: ContactMessage[];
};

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
};
