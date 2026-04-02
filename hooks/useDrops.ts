import { useState, useEffect } from "react";
import { fetchDrops } from "@/lib/api";
import type { ProductRow } from "@/lib/types";

interface UseDropsResult {
  drops: ProductRow[];
  isLoading: boolean;
}

export function useDrops(): UseDropsResult {
  const [drops, setDrops] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchDrops()
      .then((data) => {
        if (!cancelled) setDrops(data);
      })
      .catch((err) => {
        console.error("[useDrops] fetch error:", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { drops, isLoading };
}
