import { createHash } from "crypto";
import type { Campaign, Fund, Gift, Settings, Store, UserRecord } from "./types";

export function hashPassword(password: string): string {
  return createHash("sha256").update(`phoebe:${password}`).digest("hex");
}

const DEMO_PASSWORD = hashPassword("GiveWithCare24");

const FUNDS: Fund[] = [
  {
    id: "tithe",
    name: "Tithe",
    description: "A tenth set aside for the ministry, teaching, and care of Phoebe Community Church.",
  },
  {
    id: "offering",
    name: "Offering",
    description: "A free gift toward weekly worship, hospitality, and the work of the congregation.",
  },
  {
    id: "building",
    name: "Building Fund",
    description: "Gifts for the sanctuary roof, classrooms, and a safer place to gather.",
  },
  {
    id: "missions",
    name: "Missions Fund",
    description: "Support for outreach in Nairobi and partner congregations across East Africa.",
  },
  {
    id: "benevolence",
    name: "Benevolence Fund",
    description: "Quiet help for members and neighbours facing medical, food, or rent needs.",
  },
];

const PEOPLE: { name: string; email: string; phone: string; role: "member" | "admin" }[] = [
  { name: "Daniel Otieno", email: "admin@phoebecommunity.church", phone: "254712100001", role: "admin" },
  { name: "Grace Wanjiku", email: "grace.wanjiku@phoebecommunity.church", phone: "254712100002", role: "member" },
  { name: "Amina Hassan", email: "amina.hassan@phoebecommunity.church", phone: "254712100003", role: "member" },
  { name: "Peter Kamau", email: "peter.kamau@phoebecommunity.church", phone: "254712100004", role: "member" },
  { name: "Faith Chebet", email: "faith.chebet@phoebecommunity.church", phone: "254712100005", role: "member" },
  { name: "Joseph Mwangi", email: "joseph.mwangi@phoebecommunity.church", phone: "254712100006", role: "member" },
  { name: "Mary Atieno", email: "mary.atieno@phoebecommunity.church", phone: "254712100007", role: "member" },
  { name: "Samuel Kiprop", email: "samuel.kiprop@phoebecommunity.church", phone: "254712100008", role: "member" },
  { name: "Lucy Njeri", email: "lucy.njeri@phoebecommunity.church", phone: "254712100009", role: "member" },
  { name: "Brian Omondi", email: "brian.omondi@phoebecommunity.church", phone: "254712100010", role: "member" },
  { name: "Esther Nafula", email: "esther.nafula@phoebecommunity.church", phone: "254712100011", role: "member" },
  { name: "David Mutua", email: "david.mutua@phoebecommunity.church", phone: "254712100012", role: "member" },
];

function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function iso(year: number, month: number, day: number, hour = 10): string {
  return new Date(Date.UTC(year, month - 1, day, hour, 15, 0)).toISOString();
}

export function createSeed(): Store {
  const rand = mulberry32(20261020);
  const users: UserRecord[] = PEOPLE.map((person, index) => ({
    id: `usr_${index + 1}`,
    name: person.name,
    email: person.email,
    phone: person.phone,
    role: person.role,
    passwordHash: DEMO_PASSWORD,
    createdAt: iso(2025, 1, 8 + index),
  }));

  const funds = ["tithe", "offering", "building", "missions", "benevolence"] as const;
  const amounts = [500, 1000, 1500, 2000, 2500, 5000, 7500, 10000, 15000];
  const gifts: Gift[] = [];
  let seq = 1400;

  for (let month = 1; month <= 10; month++) {
    const count = 10 + Math.floor(rand() * 8);
    for (let i = 0; i < count; i += 1) {
      const person = PEOPLE[Math.floor(rand() * PEOPLE.length)];
      const user = users.find((item) => item.email === person.email);
      const fund = funds[Math.floor(rand() * (month % 3 === 0 ? 5 : 4))];
      const frequencyRoll = rand();
      const frequency = frequencyRoll > 0.72 ? "monthly" : frequencyRoll > 0.55 ? "weekly" : "one-time";
      const day = 1 + Math.floor(rand() * 27);
      const amount = amounts[Math.floor(rand() * amounts.length)];
      const recurring = frequency !== "one-time";
      seq += 1;
      gifts.push({
        ref: `PG26${String(seq).padStart(5, "0")}`,
        fund,
        amount,
        frequency,
        name: person.name,
        phone: person.phone,
        email: person.email,
        payment: rand() > 0.28 ? "mpesa" : "card",
        status: "confirmed",
        createdAt: iso(2026, month, Math.min(day, month === 10 ? 19 : 27), 8 + (i % 8)),
        userId: user?.id,
        recurringId: recurring ? `rec_${user?.id}_${fund}` : undefined,
        recurringStatus: recurring ? (rand() > 0.9 ? "paused" : "active") : undefined,
      });
    }
  }

  const campaigns: Campaign[] = [
    {
      id: "cmp_roof",
      title: "Sanctuary roof repair",
      fund: "building",
      target: 2500000,
      raised: 1684000,
      startDate: "2026-06-01",
      endDate: "2026-11-30",
      description: "Replace the leaking sanctuary roof before the short rains so worship and Sunday school can continue without interruption.",
      status: "active",
    },
    {
      id: "cmp_turkana",
      title: "Missions to Turkana",
      fund: "missions",
      target: 800000,
      raised: 426500,
      startDate: "2026-07-15",
      endDate: "2026-12-15",
      description: "Travel, water filters, and teaching materials for the partner congregation in Turkana County.",
      status: "active",
    },
    {
      id: "cmp_pantry",
      title: "Benevolence pantry",
      fund: "benevolence",
      target: 300000,
      raised: 214000,
      startDate: "2026-08-01",
      endDate: "2026-10-31",
      description: "Dry goods, school fees, and emergency rent support for households named by the care team.",
      status: "active",
    },
  ];

  const settings: Settings = {
    churchName: process.env.CHURCH_NAME || "Phoebe Community Church",
    logoUrl: "",
    funds: FUNDS,
    mpesaPaybill: process.env.MPESA_PAYBILL || "522522",
    accountPrefix: process.env.MPESA_ACCOUNT_PREFIX || "PHOEBE",
    emailNotifications: true,
  };

  return { users, gifts, campaigns, settings, messages: [] };
}
