import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createAuditRow, generateAuditReport } from "./audit.server";

const SpendSchema = z.object({
  materials: z.number().min(0).max(10_000_000),
  payroll: z.number().min(0).max(10_000_000),
  travel: z.number().min(0).max(10_000_000),
  advertising: z.number().min(0).max(10_000_000),
  utilities: z.number().min(0).max(10_000_000),
  other: z.number().min(0).max(10_000_000),
});

export const submitAudit = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email().max(255),
      businessType: z.string().min(1).max(120),
      spend: SpendSchema,
    }),
  )
  .handler(async ({ data }) => {
    const id = await createAuditRow(data);
    // Fire-and-await report generation so the user lands on a populated report
    await generateAuditReport(id);
    return { id };
  });

export const getAuditReport = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("audits")
      .select("id, business_type, spend_inputs, report_output, created_at")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Not found");
    return row;
  });