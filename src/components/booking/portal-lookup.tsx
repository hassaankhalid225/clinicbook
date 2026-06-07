"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Appt {
  date: string;
  time: string;
  isTelehealth: boolean;
  doctorName: string;
  clinicName: string | null;
  cancelToken: string;
}

export function PortalLookup() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Appt[] | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/portal/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      setResults(res.ok ? json.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={lookup} className="flex gap-2">
        <Input
          type="tel"
          placeholder="Your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
        </Button>
      </form>

      {results !== null && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No upcoming appointments found for that number.
            </p>
          ) : (
            results.map((a) => (
              <Card key={a.cancelToken}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {a.date} at {a.time}
                      {a.isTelehealth && (
                        <Badge variant="info" className="gap-1">
                          <Video className="h-3 w-3" /> Video
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {a.doctorName}
                      {a.clinicName ? ` · ${a.clinicName}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/reschedule/${a.cancelToken}`}>Reschedule</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/cancel/${a.cancelToken}`}>Cancel</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
