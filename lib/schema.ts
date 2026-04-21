import { z } from "zod";

const SAFE_TEXT = /^[\p{L}\p{N}\s\-',.&()/]+$/u;

export const CurrencySchema = z.enum(["BRL", "USD", "EUR"]);

export const RequestSchema = z.object({
  city: z
    .string()
    .trim()
    .min(2, "Cidade muito curta")
    .max(80, "Cidade muito longa")
    .regex(SAFE_TEXT, "Cidade contém caracteres inválidos"),
  days: z
    .number({ invalid_type_error: "Quantidade de dias inválida" })
    .int()
    .min(1)
    .max(14),
  keywords: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(60)
        .regex(SAFE_TEXT, "Palavra-chave com caracteres inválidos"),
    )
    .min(1, "Informe pelo menos uma palavra-chave")
    .max(20, "Máximo de 20 palavras-chave"),
  currency: CurrencySchema,
});

export type RequestInput = z.infer<typeof RequestSchema>;

export const ActivityTimeSchema = z.enum(["manhã", "tarde", "noite"]);
export const ActivityCategorySchema = z.enum([
  "comida",
  "bebida",
  "atividade",
  "transporte",
  "hospedagem",
  "outro",
]);

export const ActivitySchema = z.object({
  time: ActivityTimeSchema,
  name: z.string().min(1).max(240),
  description: z.string().min(1).max(1200),
  estimatedCost: z.number().nonnegative().finite(),
  category: ActivityCategorySchema,
  imageQuery: z.string().min(2).max(100).optional(),
});

export const ItineraryDaySchema = z.object({
  day: z.number().int().min(1),
  title: z.string().min(1).max(240),
  activities: z.array(ActivitySchema).min(1).max(8),
  dailyTotal: z.number().nonnegative().finite(),
});

export const ItinerarySchema = z.object({
  city: z.string().min(1).max(240),
  days: z.array(ItineraryDaySchema).min(1).max(14),
  totalCost: z.number().nonnegative().finite(),
  averageDailyCost: z.number().nonnegative().finite(),
  currency: z.string().min(3).max(6),
  localCurrency: z.string().min(3).max(6),
  localCurrencyRate: z.number().positive().finite(),
  tips: z.array(z.string().min(1).max(800)).min(1).max(8),
});
