import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-navy text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          My<span className="text-gold">Card</span>Audit
        </Link>
        <Link
          to="/audit"
          className="hidden sm:inline-flex items-center rounded-md bg-gold px-4 py-2 text-sm font-bold text-gold-foreground hover:opacity-90 transition"
        >
          Get My Audit
        </Link>
      </div>
    </header>
  );
}