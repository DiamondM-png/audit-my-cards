import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { generateText, Output } from "ai";
import { z } from "zod";

export type SpendInputs = {
  materials: number;
  payroll: number;
  travel: number;
  advertising: number;
  utilities: number;
  other: number;
};

const ReportSchema = z.object({
  currentEstimatedAnnualRewards: z.number(),
  recommendedCards: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        annualFee: z.number(),
        useFor: z.string(),
        estimatedAnnualRewards: z.number(),
      }),
    )
    .min(2)
    .max(3),
  projectedAnnualRewards: z.number(),
  annualSavingsDifference: z.number(),
  actionPlan: z.array(z.string()).length(3),
  summary: z.string(),
});

export type AuditReport = z.infer<typeof ReportSchema>;

export async function createAuditRow(input: {
  email: string;
  businessType: string;
  spend: SpendInputs;
}) {
  const { data, error } = await supabaseAdmin
    .from("audits")
    .insert({
      email: input.email,
      business_type: input.businessType,
      spend_inputs: input.spend as unknown as Record<string, number>,
      payment_status: "paid", // payment integration is pending — see admin notes
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function generateAuditReport(auditId: string): Promise<AuditReport> {
  const { data: audit, error } = await supabaseAdmin
    .from("audits")
    .select("business_type, spend_inputs")
    .eq("id", auditId)
    .single();
  if (error || !audit) throw new Error(error?.message ?? "Audit not found");

  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const spend = audit.spend_inputs as SpendInputs;
  const monthlyTotal = Object.values(spend).reduce((a, b) => a + Number(b || 0), 0);
  const annualTotal = monthlyTotal * 12;

  const gateway = createLovableAiGatewayProvider(key);
  const model = gateway("google/gemini-2.5-pro");

  const prompt = `You are an expert business credit card strategist. Analyze this business's spending and produce a sharp, no-fluff card stack recommendation.

Business type: ${audit.business_type}
Monthly spend (USD): ${JSON.stringify(spend)}
Annual spend: $${annualTotal.toLocaleString()}

Tasks:
1. Estimate their CURRENT annual rewards assuming they use one generic 1.5% cashback business card.
2. Recommend a 2-3 card stack (real US business credit cards — Amex Business Gold, Chase Ink Preferred/Cash/Unlimited, Capital One Spark, Bank of America Business Advantage, US Bank Business Triple Cash, etc.) optimized for THEIR spending categories. Match cards to the highest-spend categories.
3. Compute projected annual rewards under the new stack (use real bonus multipliers).
4. annualSavingsDifference = projected − current (after subtracting annual fees).
5. Give a 3-step action plan (each step a single bold imperative sentence, no fluff).
6. summary: 2-3 sentence brutal-honest assessment.

All dollar amounts as plain numbers (no $ or commas).`;

  const { experimental_output } = await generateText({
    model,
    prompt,
    experimental_output: Output.object({ schema: ReportSchema }),
  });

  const report = experimental_output as AuditReport;

  const { error: updateError } = await supabaseAdmin
    .from("audits")
    .update({ report_output: report as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
    .eq("id", auditId);
  if (updateError) throw new Error(updateError.message);

  return report;
}