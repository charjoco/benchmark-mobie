import { useState, useEffect, useRef, useCallback } from "react";
import { fetchProducts } from "@/lib/api";
import type { FilterState, ProductRow } from "@/lib/types";

interface UseProductsResult {
  products: ProductRow[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useProducts(filters: FilterState): UseProductsResult {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Stale-fetch protection: each call gets a monotonically increasing id;
  // only the response matching the latest id is committed to state.
  const fetchIdRef = useRef(0);

  const load = useCallback(
    async (pageToLoad: number, isRefresh: boolean) => {
      const myId = ++fetchIdRef.current;

      if (isRefresh) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const data = await fetchProducts(filters, pageToLoad);

        // Discard stale response
        if (myId !== fetchIdRef.current) return;

        setTotalPages(data.totalPages);

        // Client-side size availability guard: the backend may return products
        // that list a size but have it marked unavailable. Filter those out.
        const filtered =
          filters.sizes.length === 0
            ? data.products
            : data.products.filter((p) => {
                const allColorways =
                  Array.isArray(p.colorways) && p.colorways.length > 0
                    ? p.colorways
                    : [{ sizes: p.sizes }];
                return allColorways.some((cw) =>
                  filters.sizes.some((sel) =>
                    cw.sizes?.some((sv) => sv.size === sel && sv.available)
                  )
                );
              });

        if (isRefresh) {
          setProducts(filtered);
        } else {
          setProducts((prev) => [...prev, ...filtered]);
        }
        setPage(pageToLoad);
      } catch (err) {
        if (myId !== fetchIdRef.current) return;
        console.error("[useProducts] fetch error:", err);
      } finally {
        if (myId === fetchIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [filters]
  );

  // Re-fetch from page 1 whenever filters change
  useEffect(() => {
    load(1, true);
  }, [load]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || isLoading) return;
    if (page >= totalPages) return;
    load(page + 1, false);
  }, [isLoadingMore, isLoading, page, totalPages, load]);

  const refresh = useCallback(() => {
    load(1, true);
  }, [load]);

  return {
    products,
    isLoading,
    isLoadingMore,
    hasMore: page < totalPages,
    loadMore,
    refresh,
  };
}
