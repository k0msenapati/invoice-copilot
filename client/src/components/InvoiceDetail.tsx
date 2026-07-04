/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { X, Save, Plus, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface LineItem {
  description: string;
  quantity: number | null;
  unit_price: number | null;
  amount: number | null;
}

interface InvoiceDetailData {
  id: number;
  invoice_number: string | null;
  sender_name: string;
  sender_address: string | null;
  recipient_name: string | null;
  recipient_address: string | null;
  invoice_date: string | null;
  due_date: string | null;
  currency: string;
  total_amount: number;
  tax_amount: number | null;
  raw_text: string;
  created_at: string;
  items: LineItem[];
}

interface InvoiceDetailProps {
  invoiceId: number;
  onClose: () => void;
}

export default function InvoiceDetail({ invoiceId, onClose }: InvoiceDetailProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Omit<InvoiceDetailData, "items" | "id" | "raw_text" | "created_at">>({
    invoice_number: "",
    sender_name: "",
    sender_address: "",
    recipient_name: "",
    recipient_address: "",
    invoice_date: "",
    due_date: "",
    currency: "USD",
    total_amount: 0,
    tax_amount: 0,
  });
  const [items, setItems] = useState<LineItem[]>([]);
  const [copied, setCopied] = useState(false);

  const { data: invoice, isLoading, isError } = useQuery<InvoiceDetailData>({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const response = await axios.get<InvoiceDetailData>(`/api/invoices/${invoiceId}`);
      return response.data;
    },
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice_number: invoice.invoice_number || "",
        sender_name: invoice.sender_name || "",
        sender_address: invoice.sender_address || "",
        recipient_name: invoice.recipient_name || "",
        recipient_address: invoice.recipient_address || "",
        invoice_date: invoice.invoice_date || "",
        due_date: invoice.due_date || "",
        currency: invoice.currency || "USD",
        total_amount: invoice.total_amount || 0,
        tax_amount: invoice.tax_amount || 0,
      });
      setItems(invoice.items || []);
    }
  }, [invoice]);

  const updateMutation = useMutation<InvoiceDetailData, Error, InvoiceDetailData>({
    mutationFn: async (updatedData) => {
      const response = await axios.put<InvoiceDetailData>(`/api/invoices/${invoiceId}`, updatedData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      onClose();
    },
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number | null) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unit_price") {
          const qty = field === "quantity" ? (value as number | null) : item.quantity;
          const price = field === "unit_price" ? (value as number | null) : item.unit_price;
          if (qty != null && price != null) {
            updatedItem.amount = Number((qty * price).toFixed(2));
          }
        }
        return updatedItem;
      })
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    if (!formData.sender_name) return;
    const payload = {
      ...formData,
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity === null ? null : Number(item.quantity),
        unit_price: item.unit_price === null ? null : Number(item.unit_price),
        amount: item.amount === null ? null : Number(item.amount),
      })),
      id: invoiceId,
      raw_text: invoice?.raw_text || "",
      created_at: invoice?.created_at || "",
    };
    updateMutation.mutate(payload);
  };

  const copyRawText = () => {
    if (invoice?.raw_text) {
      navigator.clipboard.writeText(invoice.raw_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 border border-border/40 bg-card/30 rounded-3xl flex-grow">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground font-sans">Loading details...</p>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="p-8 text-center border border-destructive/20 bg-destructive/5 text-destructive rounded-3xl flex-grow">
        <p className="font-semibold">Failed to load invoice details.</p>
        <Button variant="outline" className="mt-4 rounded-xl px-5" onClick={onClose}>
          Close Panel
        </Button>
      </div>
    );
  }

  return (
    <Card className="border border-border/40 bg-card/45 w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-left rounded-3xl flex-1 flex flex-col overflow-hidden backdrop-blur-md">
      <CardHeader className="border-b border-border/40 pb-5 flex flex-row items-center justify-between flex-shrink-0 px-8 bg-secondary/10">
        <div>
          <CardTitle className="text-xl font-serif font-semibold">
            Invoice Details
          </CardTitle>
          <CardDescription className="font-sans">
            Review and correct the parsed ledger fields.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:bg-secondary rounded-xl transition-all"
          onClick={onClose}
        >
          <X className="h-4.5 w-4.5" />
        </Button>
      </CardHeader>

      <CardContent className="pt-6 flex-1 overflow-y-auto px-8">
        <Tabs defaultValue="fields" className="w-full">
          <TabsList className="grid w-full grid-cols-3 border border-border/40 bg-secondary/35 p-1 rounded-2xl mb-6">
            <TabsTrigger value="fields" className="rounded-xl text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              General Fields
            </TabsTrigger>
            <TabsTrigger value="items" className="rounded-xl text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Line Items ({items.length})
            </TabsTrigger>
            <TabsTrigger value="raw" className="rounded-xl text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Extracted Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 pl-1">Invoice Number</label>
                <Input
                  value={formData.invoice_number || ""}
                  onChange={(e) => handleInputChange("invoice_number", e.target.value)}
                  className="rounded-xl border-border/60 font-mono text-sm bg-background/40 hover:bg-background/60 focus-visible:ring-primary/45 transition-colors focus-visible:ring-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 pl-1">Sender Name *</label>
                <Input
                  value={formData.sender_name}
                  onChange={(e) => handleInputChange("sender_name", e.target.value)}
                  className="rounded-xl border-border/60 text-sm bg-background/40 hover:bg-background/60 focus-visible:ring-primary/45 transition-colors focus-visible:ring-1"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 pl-1">Sender Address</label>
                <Input
                  value={formData.sender_address || ""}
                  onChange={(e) => handleInputChange("sender_address", e.target.value)}
                  className="rounded-xl border-border/60 text-sm bg-background/40 hover:bg-background/60 focus-visible:ring-primary/45 transition-colors focus-visible:ring-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 pl-1">Recipient Name</label>
                <Input
                  value={formData.recipient_name || ""}
                  onChange={(e) => handleInputChange("recipient_name", e.target.value)}
                  className="rounded-xl border-border/60 text-sm bg-background/40 hover:bg-background/60 focus-visible:ring-primary/45 transition-colors focus-visible:ring-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 pl-1">Recipient Address</label>
                <Input
                  value={formData.recipient_address || ""}
                  onChange={(e) => handleInputChange("recipient_address", e.target.value)}
                  className="rounded-xl border-border/60 text-sm bg-background/40 hover:bg-background/60 focus-visible:ring-primary/45 transition-colors focus-visible:ring-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 pl-1">Invoice Date</label>
                <Input
                  value={formData.invoice_date || ""}
                  onChange={(e) => handleInputChange("invoice_date", e.target.value)}
                  className="rounded-xl border-border/60 font-mono text-sm bg-background/40 hover:bg-background/60 focus-visible:ring-primary/45 transition-colors focus-visible:ring-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 pl-1">Due Date</label>
                <Input
                  value={formData.due_date || ""}
                  onChange={(e) => handleInputChange("due_date", e.target.value)}
                  className="rounded-xl border-border/60 font-mono text-sm bg-background/40 hover:bg-background/60 focus-visible:ring-primary/45 transition-colors focus-visible:ring-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 pl-1">Currency</label>
                <Input
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  className="rounded-xl border-border/60 font-mono text-sm uppercase bg-background/40 hover:bg-background/60 focus-visible:ring-primary/45 transition-colors focus-visible:ring-1"
                  maxLength={3}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 pl-1">Tax Amount</label>
                <Input
                  type="number"
                  value={formData.tax_amount || ""}
                  onChange={(e) => handleInputChange("tax_amount", e.target.value === "" ? 0 : Number(e.target.value))}
                  className="rounded-xl border-border/60 font-mono text-sm bg-background/40 hover:bg-background/60 focus-visible:ring-primary/45 transition-colors focus-visible:ring-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 pl-1">Total Amount</label>
                <Input
                  type="number"
                  value={formData.total_amount || ""}
                  onChange={(e) => handleInputChange("total_amount", e.target.value === "" ? 0 : Number(e.target.value))}
                  className="rounded-xl border-border/60 font-mono text-sm font-bold text-primary bg-background/40 hover:bg-background/60 focus-visible:ring-primary/45 transition-colors focus-visible:ring-1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="border border-border/40 bg-background/25 overflow-hidden rounded-2xl shadow-sm">
              <Table>
                <TableHeader className="bg-secondary/20">
                  <TableRow className="border-b border-border/40">
                    <TableHead className="font-bold text-foreground pl-4 py-3.5">Description *</TableHead>
                    <TableHead className="font-bold w-20 text-right text-foreground py-3.5">Qty</TableHead>
                    <TableHead className="font-bold w-28 text-right text-foreground py-3.5">Unit Price</TableHead>
                    <TableHead className="font-bold w-32 text-right text-foreground py-3.5">Amount</TableHead>
                    <TableHead className="w-12 text-center text-foreground pr-4 py-3.5"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx} className="border-b border-border/40 hover:bg-secondary/10 transition-colors">
                      <TableCell className="p-2 pl-4">
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          className="h-8 rounded-lg border-none focus-visible:ring-1 text-sm bg-transparent"
                          required
                        />
                      </TableCell>
                      <TableCell className="p-2 text-right">
                        <Input
                          type="number"
                          value={item.quantity === null ? "" : item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value === "" ? null : Number(e.target.value))}
                          className="h-8 text-right rounded-lg border-none font-mono text-sm focus-visible:ring-1 bg-transparent"
                        />
                      </TableCell>
                      <TableCell className="p-2 text-right">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price === null ? "" : item.unit_price}
                          onChange={(e) => handleItemChange(idx, "unit_price", e.target.value === "" ? null : Number(e.target.value))}
                          className="h-8 text-right rounded-lg border-none font-mono text-sm focus-visible:ring-1 bg-transparent"
                        />
                      </TableCell>
                      <TableCell className="p-2 text-right">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.amount === null ? "" : item.amount}
                          onChange={(e) => handleItemChange(idx, "amount", e.target.value === "" ? null : Number(e.target.value))}
                          className="h-8 text-right rounded-lg border-none font-mono text-sm font-bold text-primary focus-visible:ring-1 bg-transparent"
                        />
                      </TableCell>
                      <TableCell className="p-2 text-center pr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button variant="outline" size="sm" className="border-border hover:bg-secondary text-xs flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all" onClick={handleAddItem}>
              <Plus className="h-3.5 w-3.5" /> Add Line
            </Button>
          </TabsContent>

          <TabsContent value="raw" className="space-y-3">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Original document body text</span>
              <Button variant="outline" size="sm" className="h-7 border-border flex items-center gap-1.5 rounded-lg text-xs px-3 transition-all" onClick={copyRawText}>
                {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy Text"}
              </Button>
            </div>
            <Textarea
              className="font-mono text-[10px] p-4 bg-secondary/15 border border-border/40 rounded-2xl resize-none overflow-y-auto leading-relaxed focus-visible:ring-primary/45 transition-all text-left min-h-[350px]"
              value={invoice.raw_text || ""}
              readOnly
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="border-t border-border/40 pt-4 pb-6 px-8 flex gap-4 flex-shrink-0 bg-secondary/15">
        <Button
          variant="outline"
          className="flex-1 border-border hover:bg-secondary text-sm font-semibold rounded-xl py-5.5 transition-all"
          onClick={onClose}
          disabled={updateMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95 font-bold transition-all text-sm rounded-xl py-5.5 shadow-lg shadow-primary/10"
          onClick={handleSave}
          disabled={updateMutation.isPending || !formData.sender_name}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Ledger Details
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
