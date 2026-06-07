"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Booking link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy — copy it manually");
    }
  }

  return (
    <div className="flex gap-2">
      <Input readOnly value={url} className="font-mono text-sm" />
      <Button variant="outline" onClick={copy} className="shrink-0">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
