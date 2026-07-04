import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Upload, FileText, Loader2, X, Play, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions } from "@/components/ui/attachment";
import { formatBytes } from "@/lib/format";

interface InvoiceResponse {
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
  items: Array<{
    id: number;
    invoice_id: number;
    description: string;
    quantity: number | null;
    unit_price: number | null;
    amount: number | null;
  }>;
}

interface InvoiceUploaderProps {
  onSuccess: (invoice: InvoiceResponse) => void;
}

export default function InvoiceUploader({ onSuccess }: InvoiceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processMutation = useMutation<InvoiceResponse, Error, File>({
    mutationFn: async (uploadFile: File) => {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const response = await axios.post<InvoiceResponse>("/api/invoices/process", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      onSuccess(data);
      handleReset();
    },
  });

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];
      if (validTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
        processMutation.reset();
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      processMutation.reset();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (file) {
      processMutation.mutate(file);
    }
  };

  const handleReset = () => {
    setFile(null);
    processMutation.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getAttachmentState = () => {
    if (processMutation.isPending) return "processing";
    if (processMutation.isError) return "error";
    if (processMutation.isSuccess) return "done";
    return "idle";
  };

  return (
    <Card className="border border-border bg-card/35 w-full max-w-2xl mx-auto shadow-md rounded-2xl backdrop-blur-sm">
      <CardHeader className="border-b border-border/40 pb-4 text-left px-6">
        <CardTitle className="text-xl font-serif">
          Import Invoice
        </CardTitle>
        <CardDescription>
          Upload an invoice file to parse details and save to ledger.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 flex flex-col gap-6 px-6 pb-6">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
        />

        {!file && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border border-dashed border-border/80 p-10 flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-all rounded-2xl ${
              dragActive
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50 hover:bg-muted/15"
            }`}
          >
            <div className="p-3 bg-secondary text-primary border border-border mb-3 rounded-xl">
              <Upload className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm text-center">
              Drag & drop invoice here, or{" "}
              <span className="text-primary hover:underline font-bold">
                browse files
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
              PDF, PNG, JPG, JPEG, WEBP
            </p>
          </div>
        )}

        {file && (
          <div className="flex flex-col gap-4">
            <Attachment
              state={getAttachmentState()}
              className="w-full border-border bg-card/50 p-3 rounded-xl"
            >
              <AttachmentMedia
                variant={file.type.startsWith("image/") ? "image" : "icon"}
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="object-cover w-full h-full rounded-md"
                  />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </AttachmentMedia>
              <AttachmentContent className="text-left">
                <AttachmentTitle>{file.name}</AttachmentTitle>
                <AttachmentDescription className="font-mono">
                  {processMutation.isPending
                    ? "Extracting document data..."
                    : processMutation.isError
                    ? "Failed to process invoice"
                    : processMutation.isSuccess
                    ? "Extraction completed successfully"
                    : formatBytes(file.size)}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  onClick={handleReset}
                  disabled={processMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AttachmentActions>
            </Attachment>

            {processMutation.isIdle && (
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-bold transition-all text-sm rounded-lg"
                onClick={handleSubmit}
              >
                <Play className="mr-2 h-4 w-4 fill-current" /> Import &amp; Save
              </Button>
            )}
          </div>
        )}

        {processMutation.isPending && (
          <div className="border border-border/40 p-12 flex flex-col items-center justify-center min-h-[150px] bg-secondary/5 rounded-2xl">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">
              Parsing invoice...
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-sans">
              Parsing fields and mapping ledger details. This may take a few seconds.
            </p>
          </div>
        )}

        {processMutation.isError && (
          <div className="border border-destructive/20 p-6 flex flex-col items-center justify-center bg-destructive/5 text-destructive text-center rounded-2xl">
            <AlertCircle className="h-10 w-10 mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold">Processing Failed</p>
            <p className="text-xs text-destructive/80 mt-1 max-w-md">
              {processMutation.error.message || "An error occurred."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
