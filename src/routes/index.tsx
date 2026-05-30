import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight, CheckCircle2, Zap, Target, FileText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Card Audit — Stop Leaving Thousands on the Table" },
      { name: "description", content: "AI-powered business credit card strategy. Find out exactly how much you're losing every month — get a custom card stack report in 3 minutes." },
      { property: "og:title", content: "My Card Audit — AI Business Credit Card Strategy" },
      { property: "og:description", content: "Find out exactly how much you're leaving on the table every month. $147, one-time." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-navy text-primary-foreground">
        <div className="max-w-5xl mx-auto px-6 py-24 sm:py-32 text-center">
          <p className="text-gold uppercase tracking-[0.25em] text-xs font-bold mb-6">
            AI-Powered Business Card Audit
          </p>
          <h1 className="font-display text-5xl sm:text-7xl font-black leading-[1.05] mb-6">
            You're Leaving <span className="text-gold">Thousands</span><br />
            on the Table Every Month
          </h1>
          <p className="text-xl sm:text-2xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Find out exactly how much in 3 minutes.
          </p>
          <Link
            to="/audit"
            className="inline-flex items-center gap-2 rounded-md bg-gold px-8 py-4 text-lg font-bold text-gold-foreground hover:opacity-90 transition shadow-xl"
          >
            Get My Free Audit — $147 <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-primary-foreground/60 mt-4">
            One-time payment. Instant report. No refunds.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "01", icon: Target, t: "Enter Your Monthly Spend", d: "Categorize where your business spends each month — takes under 2 minutes." },
              { n: "02", icon: Zap, t: "AI Analyzes Your Card Strategy", d: "Our engine matches your spend profile against the entire US business card market." },
              { n: "03", icon: FileText, t: "Get Your Custom Report Instantly", d: "Real card recommendations, projected rewards, and a 3-step action plan." },
            ].map(({ n, icon: Icon, t, d }) => (
              <div key={n} className="border border-border rounded-md p-8 bg-card hover:border-gold transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-3xl font-bold text-gold">{n}</span>
                  <Icon className="w-6 h-6 text-navy" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{t}</h3>
                <p className="text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="bg-muted py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-6">
            Built for Operators, Not Tourists
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            If you're spending $10K+/month on a business card, you're leaving money on the table. Period.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {["Contractors", "Dentists", "Retailers", "Restaurants", "$10K+/mo"].map((t) => (
              <div key={t} className="border border-border bg-card rounded-md py-6 px-4 font-display font-bold text-lg">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-center mb-16">
            What You Get
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Personalized 2-3 card stack recommendation",
              "Projected annual rewards vs. your current earnings",
              "Side-by-side comparison with real card data",
              "Step-by-step action plan to deploy this week",
            ].map((t) => (
              <div key={t} className="flex items-start gap-4 p-6 border border-border rounded-md bg-card">
                <CheckCircle2 className="w-6 h-6 text-gold shrink-0 mt-0.5" />
                <span className="text-lg font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICE */}
      <section className="bg-navy text-primary-foreground py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gold uppercase tracking-[0.25em] text-xs font-bold mb-4">One-Time Payment</p>
          <div className="font-display text-7xl sm:text-8xl font-black mb-2">
            $147
          </div>
          <p className="text-primary-foreground/70 mb-8">
            Instant delivery. All sales final. No refunds.
          </p>
          <Link
            to="/audit"
            className="inline-flex items-center gap-2 rounded-md bg-gold px-8 py-4 text-lg font-bold text-gold-foreground hover:opacity-90 transition shadow-xl"
          >
            Start My Audit Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
