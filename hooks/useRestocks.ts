import { useState, useEffect } from "react";
import { fetchRestocks } from "@/lib/api";
import type { ProductRow } from "@/lib/types";

export function useRestocks(): { drops: ProductRow[]; isLoading: boolean } {
  const [drops, setDrops] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchRestocks()
      .then((data) => { if (!cancelled) setDrops(data); })
      .catch((err) => { console.error("[useRestocks] fetch error:", err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { drops, isLoading };
}
