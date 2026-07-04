import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, CheckCircle, Table as TableIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const mockInvoices = [
    { date: "Jul 4, 2026", number: "INV-8821", vendor: "Vercel Inc.", amount: "USD 150.00" },
    { date: "Jul 2, 2026", number: "INV-0043", vendor: "GitHub, Inc.", amount: "USD 49.00" },
    { date: "Jun 28, 2026", number: "INV-9901", vendor: "Amazon Web Services", amount: "USD 1,240.50" },
  ];

  const faqs = [
    {
      q: "Where is my invoice data stored?",
      a: "Everything is stored in a local SQLite database on your machine. Your private billing records never leave your environment."
    },
    {
      q: "Does the parser require internet access?",
      a: "Yes, it calls the Groq completion API to map raw text into structured JSON fields. However, the OCR parsing phase is handled locally."
    },
    {
      q: "Can I edit details after they are extracted?",
      a: "Absolutely. The dashboard provides a fully interactive editor where you can verify general fields, currencies, tax details, and modify line items."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground font-sans">
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex justify-between items-center border-b border-border/40">
        <div className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
          Invoice <span className="font-cursive text-primary text-2xl font-normal lowercase tracking-wide ml-0.5">copilot</span>
        </div>
        <div className="hidden md:flex gap-6 text-xs text-muted-foreground uppercase font-mono tracking-wider">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </div>
        <Button
          variant="outline"
          className="border-border hover:bg-secondary text-xs font-semibold rounded-lg font-mono uppercase tracking-wider px-4"
          onClick={() => setLocation("/dashboard")}
        >
          Dashboard
        </Button>
      </header>

      <main className="flex-grow flex flex-col items-center">
        <section className="max-w-4xl w-full mx-auto px-6 py-16 md:py-20 text-center flex flex-col items-center gap-8">
          <Badge variant="outline" className="rounded-full border-primary/30 text-primary font-mono text-[10px] tracking-wider uppercase px-3 py-1 bg-primary/5">
            Local Ledger Repository
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-serif tracking-tight max-w-3xl leading-tight">
            Organize your invoices in one place.
          </h1>
          
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Upload PDF invoices or receipt images. Automatically extract vendor details, dates, and amounts, and save them straight to a local database. No cloud accounts needed.
          </p>

          <div className="flex gap-4 mt-2">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold rounded-lg px-6 py-5 uppercase font-mono tracking-wider shadow-lg shadow-primary/20"
              onClick={() => setLocation("/dashboard")}
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        <section id="preview" className="max-w-3xl w-full mx-auto px-6 pb-16">
          <div className="border border-border bg-card/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-sm">
            <div className="border-b border-border/80 px-4 py-3 flex items-center justify-between bg-secondary/30">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/60 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-primary/60 block"></span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground bg-background border border-border/60 px-6 py-0.5 rounded-full max-w-[280px] truncate">
                localhost:3000/dashboard
              </div>
              <div className="w-12"></div>
            </div>
            
            <div className="p-4 md:p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Ledger Records</div>
                <div className="h-2 w-20 bg-secondary rounded-full"></div>
              </div>
              
              <div className="space-y-2">
                {mockInvoices.map((inv, idx) => (
                  <div key={idx} className="border border-border/40 p-3.5 bg-secondary/15 hover:bg-secondary/25 transition-all flex items-center justify-between text-xs rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-serif font-semibold text-foreground text-left">{inv.vendor}</div>
                        <div className="text-[10px] font-mono text-muted-foreground text-left mt-0.5">{inv.date} &bull; {inv.number}</div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-primary">{inv.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl w-full mx-auto px-6 py-16 border-t border-border/40 text-center flex flex-col items-center gap-4">
          <Badge variant="outline" className="rounded-full border-primary/20 text-muted-foreground font-mono text-[9px] uppercase tracking-wider px-2.5 py-0.5 bg-secondary/20">
            Target Audience
          </Badge>
          <h2 className="text-2xl md:text-3xl font-serif tracking-tight">Built for builders, hackers, and teams.</h2>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            Designed for those who want a structured database ledger without signing up for expensive, bloated cloud platforms. Keep your finances simple and lightweight.
          </p>
        </section>

        <section id="features" className="max-w-4xl w-full mx-auto px-6 py-16 border-t border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 text-left bg-card/20 p-5 rounded-2xl border border-border/30 backdrop-blur-sm">
              <div className="p-2.5 bg-secondary text-primary h-fit w-fit border border-border mb-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-base font-semibold">Easy Upload</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Drag and drop receipt photos, scans, or digital PDF invoices straight into your browser.
              </p>
            </div>

            <div className="space-y-2 text-left bg-card/20 p-5 rounded-2xl border border-border/30 backdrop-blur-sm">
              <div className="p-2.5 bg-secondary text-primary h-fit w-fit border border-border mb-3 rounded-lg">
                <TableIcon className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-base font-semibold">Automatic Extraction</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Instantly map billing dates, invoice numbers, currency lines, tax codes, and nested line items.
              </p>
            </div>

            <div className="space-y-2 text-left bg-card/20 p-5 rounded-2xl border border-border/30 backdrop-blur-sm">
              <div className="p-2.5 bg-secondary text-primary h-fit w-fit border border-border mb-3 rounded-lg">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-base font-semibold">100% Local Ledger</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All records save directly to your own local SQLite database. You own and control your data.
              </p>
            </div>
          </div>
        </section>

        <section id="workflow" className="max-w-4xl w-full mx-auto px-6 py-16 border-t border-border/40 text-left">
          <div className="text-center md:text-left mb-10">
            <h2 className="text-2xl md:text-3xl font-serif tracking-tight">The Ledger Workflow</h2>
            <p className="text-xs text-muted-foreground mt-1">Convert raw billing files into database entries in three simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-border/40 p-5 bg-card/30 flex flex-col justify-between min-h-[140px] rounded-2xl shadow-sm">
              <div>
                <span className="font-mono text-xs text-primary font-bold block mb-2">01 / UPLOAD</span>
                <h4 className="font-serif font-semibold text-sm mb-1">Select Document</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Drop files directly. The extractor runs OCR instantly.
                </p>
              </div>
            </div>

            <div className="border border-border/40 p-5 bg-card/30 flex flex-col justify-between min-h-[140px] rounded-2xl shadow-sm">
              <div>
                <span className="font-mono text-xs text-primary font-bold block mb-2">02 / VERIFY</span>
                <h4 className="font-serif font-semibold text-sm mb-1">Verify Fields</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review extracted fields and nested item rows directly inside the dashboard.
                </p>
              </div>
            </div>

            <div className="border border-border/40 p-5 bg-card/30 flex flex-col justify-between min-h-[140px] rounded-2xl shadow-sm">
              <div>
                <span className="font-mono text-xs text-primary font-bold block mb-2">03 / RECORD</span>
                <h4 className="font-serif font-semibold text-sm mb-1">Commit to Database</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save verified items into local tables, ready for audits and tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="max-w-4xl w-full mx-auto px-6 py-16 border-t border-border/40 text-left">
          <div className="text-center md:text-left mb-10">
            <h2 className="text-2xl md:text-3xl font-serif tracking-tight flex items-center justify-center md:justify-start gap-2">
              Common Questions
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Frequently asked questions about storage, extraction, and privacy.</p>
          </div>
          
          <div className="space-y-3 max-w-2xl">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-border/40 rounded-xl bg-card/25 overflow-hidden transition-all duration-300">
                <button
                  className="w-full p-4 flex justify-between items-center text-left font-serif font-semibold text-sm hover:bg-secondary/30 transition-all focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  {faq.q}
                  <span className="text-primary font-mono text-xs font-bold ml-4">
                    {openFaq === idx ? "—" : "+"}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1.5 text-xs text-muted-foreground leading-relaxed border-t border-border/10 bg-secondary/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl w-full mx-auto px-6 py-16 border-t border-border/40 text-center flex flex-col items-center gap-6">
          <h2 className="text-2xl md:text-3xl font-serif tracking-tight">Ready to structure your records?</h2>
          <p className="text-xs text-muted-foreground max-w-md">
            Import billing documents locally today. Clean, light, and secure.
          </p>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/95 text-sm font-semibold rounded-lg px-6 py-5 uppercase font-mono tracking-wider"
            onClick={() => setLocation("/dashboard")}
          >
            Open Dashboard
          </Button>
        </section>
      </main>

      <footer className="max-w-6xl w-full mx-auto px-6 py-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left z-10">
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-1 font-serif text-sm font-bold tracking-tight">
            Invoice <span className="font-cursive text-primary text-base font-normal lowercase tracking-wide">copilot</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60 max-w-xs leading-relaxed">
            Local invoice extraction and relational storage tool for finance organization.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <a
            href="https://github.com/kom/invoice-copilot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub Repository
          </a>
        </div>
      </footer>
    </div>
  );
}
