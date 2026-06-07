"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({
  defaultQuery = "",
  defaultCity = "",
}: {
  defaultQuery?: string;
  defaultCity?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [city, setCity] = useState(defaultCity);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    router.push(`/doctors?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full flex-col gap-2 rounded-xl border bg-background p-2 shadow-sm sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Specialty, doctor, or condition"
          className="border-0 pl-9 shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="relative flex-1 sm:max-w-[220px]">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="border-0 pl-9 shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" size="lg" className="gap-2">
        <Search className="h-4 w-4" /> Find doctors
      </Button>
    </form>
  );
}
