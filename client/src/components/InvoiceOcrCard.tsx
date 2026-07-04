import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Upload,
  FileText,
  Copy,
  Check,
  RefreshCw,
  X,
  Play,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
} from "@/components/ui/attachment";
import { formatBytes } from "@/lib/format";

interface OCRResponse {
  filename: string;
  text: string;
  size_bytes: number;
}

export default function InvoiceOcrCard() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ocrMutation = useMutation<OCRResponse, Error, File>({
    mutationFn: async (uploadFile: File) => {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const response = await axios.post<OCRResponse>("/api/ocr", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
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
        ocrMutation.reset();
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      ocrMutation.reset();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (file) {
      ocrMutation.mutate(file);
    }
  };

  const handleReset = () => {
    setFile(null);
    ocrMutation.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = () => {
    if (ocrMutation.data?.text) {
      navigator.clipboard.writeText(ocrMutation.data.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  const getAttachmentState = () => {
    if (ocrMutation.isPending) return "processing";
    if (ocrMutation.isError) return "error";
    if (ocrMutation.isSuccess) return "done";
    return "idle";
  };

  return (
    <Card className="border border-border bg-card/30 w-full max-w-2xl mx-auto shadow-none">
      <CardHeader className="border-b border-border/50 pb-4 text-left">
        <CardTitle className="text-xl font-heading flex justify-between items-center">
          <span>Invoice OCR Processor</span>
          {ocrMutation.isSuccess && ocrMutation.data && (
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-secondary flex items-center gap-1.5 text-xs font-bold"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-3 w-3 text-primary" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "Copied" : "Copy Text"}
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Upload an invoice (PDF/Image) to extract raw text content.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 flex flex-col gap-6">
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
            className={`border border-dashed border-border/85 p-10 flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-all ${dragActive
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50 hover:bg-muted/10"
              }`}
          >
            <div className="p-3 bg-secondary text-primary border border-border mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm text-center">
              Drag & drop invoice here, or{" "}
              <span className="text-primary hover:underline font-bold">
                browse files
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Supports PDF, PNG, JPG, JPEG, WEBP (Max 10MB)
            </p>
          </div>
        )}

        {file && (
          <div className="flex flex-col gap-4">
            <Attachment
              state={getAttachmentState()}
              className="w-full border-border bg-card/50 p-3"
            >
              <AttachmentMedia
                variant={file.type.startsWith("image/") ? "image" : "icon"}
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </AttachmentMedia>
              <AttachmentContent className="text-left">
                <AttachmentTitle>{file.name}</AttachmentTitle>
                <AttachmentDescription>
                  {ocrMutation.isPending
                    ? "Running OCR process..."
                    : ocrMutation.isError
                      ? "Failed to extract text"
                      : ocrMutation.isSuccess
                        ? "OCR processing successful"
                        : formatBytes(file.size)}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleReset}
                  disabled={ocrMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AttachmentActions>
            </Attachment>

            {ocrMutation.isIdle && (
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-bold transition-all text-sm shadow-[0_0_15px_rgba(120,240,140,0.15)]"
                onClick={handleSubmit}
              >
                <Play className="mr-2 h-4 w-4 fill-current" /> Process Invoice
              </Button>
            )}
          </div>
        )}

        {ocrMutation.isError && (
          <div className="border border-destructive/20 p-6 flex flex-col items-center justify-center bg-destructive/5 text-destructive text-center">
            <AlertCircle className="h-10 w-10 mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold">OCR Failed</p>
            <p className="text-xs text-destructive/80 mt-1 max-w-md">
              {ocrMutation.error.message || "An error occurred."}
            </p>
          </div>
        )}

        {ocrMutation.isSuccess && ocrMutation.data && (
          <div className="flex flex-col gap-3">
            <Textarea
              className="font-mono text-xs p-4 bg-secondary/30 border border-border rounded-none resize-none overflow-y-auto leading-relaxed focus-visible:ring-primary/50 text-left min-h-[250px]"
              value={ocrMutation.data.text || "No text could be extracted."}
              readOnly
            />
            <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest border border-border/50 px-3 py-1.5 bg-muted/20">
              <span>File: {ocrMutation.data.filename}</span>
              <span>Length: {ocrMutation.data.text.length} chars</span>
            </div>
            <Button
              variant="outline"
              className="w-full border-border hover:bg-secondary text-sm font-bold mt-2"
              onClick={handleReset}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Process Another Invoice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
