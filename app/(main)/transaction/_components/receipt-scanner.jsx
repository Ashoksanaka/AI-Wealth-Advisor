"use client";

import { useRef, useEffect } from "react";
import { Camera, Loader2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
    }
  }, [scanReceiptLoading, scannedData]);

  return (
    <div
      className="relative rounded-lg border border-dashed border-primary/40 p-6 text-center hover:border-primary/60 transition-colors cursor-pointer bg-secondary/30"
      onClick={() => !scanReceiptLoading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="icon-ring h-11 w-11">
          {scanReceiptLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ScanLine className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="font-medium text-sm">
            {scanReceiptLoading ? "Scanning receipt..." : "Scan receipt with AI"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload or capture a receipt to auto-fill details
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={scanReceiptLoading}
        >
          <Camera className="mr-2 h-4 w-4" />
          Choose image
        </Button>
      </div>
    </div>
  );
}
