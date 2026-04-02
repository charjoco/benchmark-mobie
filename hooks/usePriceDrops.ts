import { useState, useEffect } from "react";
import { fetchPriceDrops } from "@/lib/api";
import type { ProductRow } from "@/lib/types";

export function usePriceDrops(): { drops: ProductRow[]; isLoading: boolean } {
  const [drops, setDrops] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchPriceDrops()
      .then((data) => { if (!cancelled) setDrops(data); })
      .catch((err) => { console.error("[usePriceDrops] fetch error:", err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { drops, isLoading };
}
