import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { List, UploadCloud, Loader2, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoiceList from "@/components/InvoiceList";
import InvoiceDetail from "@/components/InvoiceDetail";
import InvoiceUploader from "@/components/InvoiceUploader";

interface Invoice {
  id: number;
  invoice_number: string | null;
  sender_name: string;
  invoice_date: string | null;
  currency: string;
  total_amount: number;
  created_at: string;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const { data: invoices = [], isLoading, isError, refetch } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await axios.get<Invoice[]>("/api/invoices");
      return response.data;
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await axios.delete(`/api/invoices/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      if (selectedInvoiceId === deletedId) {
        setSelectedInvoiceId(null);
      }
    },
  });

  const handleUploadSuccess = (newInvoice: { id: number }) => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    setSelectedInvoiceId(newInvoice.id);
    setActiveTab("dashboard");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <header className="border-b border-border/40 py-5 px-8 flex justify-between items-center bg-card/20 backdrop-blur-md sticky top-0 z-50 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight font-serif flex items-baseline gap-1">
            Invoice <span className="text-primary font-cursive text-2xl font-normal lowercase tracking-wide ml-0.5">copilot</span>
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/80 font-bold text-left -mt-0.5 font-mono">
            Document Repository
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border hover:bg-secondary rounded-lg"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 border border-border/40 hover:bg-secondary/40 text-xs font-semibold rounded-lg flex items-center gap-1.5 px-3"
            onClick={() => setLocation("/")}
          >
            <LogOut className="h-3.5 w-3.5" /> Leave
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6 overflow-hidden z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <TabsList className="grid w-80 grid-cols-2 border border-border bg-secondary/35 p-1 rounded-xl">
              <TabsTrigger
                value="dashboard"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <List className="mr-1.5 h-3.5 w-3.5" /> Ledger Items
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Import Document
              </TabsTrigger>
            </TabsList>
            {selectedInvoiceId !== null && activeTab === "dashboard" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-border hover:bg-secondary text-xs font-semibold rounded-lg px-3"
                onClick={() => setSelectedInvoiceId(null)}
              >
                Return to Ledger
              </Button>
            )}
          </div>

          <TabsContent value="dashboard" className="w-full flex-1 flex flex-col overflow-hidden focus-visible:outline-none m-0">
            {selectedInvoiceId !== null ? (
              <InvoiceDetail
                key={selectedInvoiceId}
                invoiceId={selectedInvoiceId}
                onClose={() => setSelectedInvoiceId(null)}
              />
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center p-24 border border-border bg-card/30 rounded-2xl flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground font-sans">Loading ledger...</p>
              </div>
            ) : isError ? (
              <div className="p-8 text-center border border-destructive/20 bg-destructive/5 text-destructive rounded-2xl flex-1">
                <p className="font-semibold">Failed to load invoice records.</p>
              </div>
            ) : (
              <InvoiceList
                invoices={invoices}
                onSelect={setSelectedInvoiceId}
                onDelete={handleDelete}
              />
            )}
          </TabsContent>

          <TabsContent value="upload" className="w-full flex-1 flex flex-col overflow-hidden focus-visible:outline-none m-0">
            <InvoiceUploader onSuccess={handleUploadSuccess} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/40 py-5 px-8 text-center text-[10px] text-muted-foreground/60 tracking-wider font-mono flex-shrink-0 bg-card/5">
        INVOICE COPILOT &bull; SECURE LOCAL REPOSITORY
      </footer>
    </div>
  );
}
