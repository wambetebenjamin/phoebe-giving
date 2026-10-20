import { z } from "zod";
import { FUND_IDS } from "./types";

export const givingSchema = z.object({
  fund: z.enum(FUND_IDS),
  amount: z.number().min(50, "Minimum gift is KES 50").max(10000000),
  frequency: z.enum(["one-time", "weekly", "monthly"]),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().trim().min(9, "Enter a phone number").max(20),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  payment: z.enum(["mpesa", "card"]),
  recaptchaToken: z.string().min(1),
  recaptchaVersion: z.enum(["v3", "v2"]).optional(),
  member: z.boolean().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(8).max(2000),
  recaptchaToken: z.string().min(1),
  recaptchaVersion: z.enum(["v3", "v2"]).optional(),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().min(9).max(20),
  password: z.string().min(8, "Use at least 8 characters"),
  recaptchaToken: z.string().min(1),
  recaptchaVersion: z.enum(["v3", "v2"]).optional(),
});

export const campaignSchema = z.object({
  title: z.string().trim().min(3).max(120),
  fund: z.enum(FUND_IDS),
  target: z.number().min(1000),
  startDate: z.string().min(8),
  endDate: z.string().min(8),
  description: z.string().trim().min(8).max(800),
});

export const settingsSchema = z.object({
  churchName: z.string().trim().min(2).max(120),
  mpesaPaybill: z.string().trim().max(20),
  accountPrefix: z.string().trim().max(12),
  emailNotifications: z.boolean(),
  funds: z.array(
    z.object({
      id: z.enum(FUND_IDS),
      name: z.string().trim().min(2).max(60),
      description: z.string().trim().min(4).max(280),
    }),
  ),
});

export type GivingInput = z.infer<typeof givingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
