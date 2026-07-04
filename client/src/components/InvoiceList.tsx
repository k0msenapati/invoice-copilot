import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Invoice {
  id: number;
  invoice_number: string | null;
  sender_name: string;
  invoice_date: string | null;
  currency: string;
  total_amount: number;
  created_at: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function InvoiceList({ invoices, onSelect, onDelete }: InvoiceListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = invoices.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full border border-border bg-card/25 rounded-2xl overflow-hidden text-left shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/20">
            <TableRow className="border-b border-border/80">
              <TableHead className="font-bold py-3.5 text-foreground font-sans pl-6">Date Added</TableHead>
              <TableHead className="font-bold text-foreground font-sans">Invoice #</TableHead>
              <TableHead className="font-bold text-foreground font-sans">Vendor / Sender</TableHead>
              <TableHead className="font-bold text-right text-foreground font-sans">Amount</TableHead>
              <TableHead className="font-bold text-right text-foreground font-sans pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-sans">
                  No ledger records found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="border-b border-border/40 hover:bg-secondary/15 transition-colors">
                  <TableCell className="py-4 font-medium font-mono text-xs pl-6">{formatDate(invoice.created_at)}</TableCell>
                  <TableCell className="font-mono text-xs">{invoice.invoice_number || "—"}</TableCell>
                  <TableCell className="font-serif font-semibold text-sm">{invoice.sender_name}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-primary text-sm">
                    <Badge variant="outline" className="mr-2 font-mono text-[9px] tracking-wider rounded-md uppercase px-1.5 bg-primary/5 border-primary/20">{invoice.currency}</Badge>
                    {invoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right py-4 flex justify-end gap-2 pr-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-border text-xs font-semibold hover:bg-secondary rounded-lg px-3"
                      onClick={() => onSelect(invoice.id)}
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      onClick={() => onDelete(invoice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border border-border bg-card/25 p-3 rounded-2xl shadow-sm">
          <div className="text-xs text-muted-foreground font-mono pl-3">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, invoices.length)} of {invoices.length} entries
          </div>
          <div className="flex items-center gap-2 pr-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border hover:bg-secondary rounded-lg disabled:opacity-50"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border hover:bg-secondary rounded-lg disabled:opacity-50"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
