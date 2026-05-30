import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAuditReport } from "@/lib/audit.functions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Loader2, Printer, TrendingUp, CheckCircle2 } from "lucide-react";
import type { AuditReport, SpendInputs } from "@/lib/audit.server";

export const Route = createFileRoute("/report/$id")({
  head: () => ({
    meta: [
      { title: "Your Card Audit Report — My Card Audit" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { id } = Route.useParams();
  const fetchReport = useServerFn(getAuditReport);
  const { data, isLoading, error } = useQuery({
    queryKey: ["report", id],
    queryFn: () => fetchReport({ data: { id } }),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your report…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-2xl font-bold mb-2">Report not found</h1>
          <p className="text-muted-foreground mb-4">We couldn't load that audit. Check your link.</p>
          <Link to="/" className="inline-block rounded-md bg-navy px-4 py-2 text-sm font-bold text-primary-foreground">Go home</Link>
        </div>
      </div>
    );
  }

  const report = data.report_output as AuditReport | null;
  const spend = data.spend_inputs as SpendInputs;
  const monthlyTotal = Object.values(spend).reduce((a, b) => a + Number(b || 0), 0);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <p>Report is still generating. Refresh in a moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="print:hidden"><SiteHeader /></div>

      <main className="flex-1 px-6 py-12 print:py-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 print:hidden">
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold">My Card Audit Report</p>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-bold hover:border-gold"
            >
              <Printer className="w-4 h-4" /> Download PDF
            </button>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-black mb-3">
            Your Card Strategy Audit
          </h1>
          <p className="text-muted-foreground mb-8">
            For <span className="font-bold text-foreground">{data.business_type}</span> — ${monthlyTotal.toLocaleString()}/mo (${(monthlyTotal * 12).toLocaleString()}/yr)
          </p>

          {/* HEADLINE NUMBER */}
          <div className="bg-navy text-primary-foreground rounded-md p-8 mb-10">
            <p className="text-gold uppercase tracking-[0.2em] text-xs font-bold mb-2">Annual money on the table</p>
            <div className="font-display text-6xl sm:text-7xl font-black mb-2">
              ${Math.max(0, Math.round(report.annualSavingsDifference)).toLocaleString()}
            </div>
            <p className="text-primary-foreground/70">{report.summary}</p>
          </div>

          {/* COMPARISON */}
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <div className="border border-border rounded-md p-6 bg-card">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Current rewards</p>
              <div className="font-display text-4xl font-black">
                ${Math.round(report.currentEstimatedAnnualRewards).toLocaleString()}<span className="text-base text-muted-foreground font-sans font-normal">/yr</span>
              </div>
            </div>
            <div className="border-2 border-gold rounded-md p-6 bg-card">
              <p className="text-xs uppercase tracking-wider text-gold font-bold mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Projected rewards</p>
              <div className="font-display text-4xl font-black">
                ${Math.round(report.projectedAnnualRewards).toLocaleString()}<span className="text-base text-muted-foreground font-sans font-normal">/yr</span>
              </div>
            </div>
          </div>

          {/* CARD STACK */}
          <h2 className="font-display text-3xl font-black mb-6">Your Recommended Card Stack</h2>
          <div className="space-y-4 mb-10">
            {report.recommendedCards.map((c, i) => (
              <div key={i} className="border border-border rounded-md p-6 bg-card">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold font-bold">Card {i + 1} · {c.issuer}</p>
                    <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Annual fee</p>
                    <p className="font-bold">${c.annualFee}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3"><span className="font-bold text-foreground">Use for:</span> {c.useFor}</p>
                <p className="text-sm"><span className="font-bold">Est. annual rewards:</span> ${Math.round(c.estimatedAnnualRewards).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* ACTION PLAN */}
          <h2 className="font-display text-3xl font-black mb-6">Your 3-Step Action Plan</h2>
          <ol className="space-y-3 mb-10">
            {report.actionPlan.map((step, i) => (
              <li key={i} className="flex gap-4 p-5 border border-border rounded-md bg-card">
                <span className="font-display text-3xl font-black text-gold leading-none">{i + 1}</span>
                <span className="font-medium pt-1">{step}</span>
              </li>
            ))}
          </ol>

          <div className="text-center text-sm text-muted-foreground border-t border-border pt-6 print:block">
            <p className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-gold" /> Report generated by My Card Audit · Diamond Media Publishing LLC</p>
          </div>
        </div>
      </main>

      <div className="print:hidden"><SiteFooter /></div>
    </div>
  );
}