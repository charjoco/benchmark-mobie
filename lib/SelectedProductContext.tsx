import { createContext, useContext, useState } from "react";
import type { ProductRow } from "./types";
import type { EventSource } from "./analytics";

export interface ProductMeta {
  article_id?: string;
  collection_id?: string;
}

interface SelectedProductContextValue {
  product: ProductRow | null;
  source: EventSource;
  meta: ProductMeta;
  setProduct: (p: ProductRow, source?: EventSource, meta?: ProductMeta) => void;
}

const SelectedProductContext = createContext<SelectedProductContextValue>({
  product: null,
  source: "feed",
  meta: {},
  setProduct: () => {},
});

export function SelectedProductProvider({ children }: { children: React.ReactNode }) {
  const [product, setProductState] = useState<ProductRow | null>(null);
  const [source, setSource] = useState<EventSource>("feed");
  const [meta, setMeta] = useState<ProductMeta>({});

  function setProduct(p: ProductRow, src: EventSource = "feed", m: ProductMeta = {}) {
    setProductState(p);
    setSource(src);
    setMeta(m);
  }

  return (
    <SelectedProductContext.Provider value={{ product, source, meta, setProduct }}>
      {children}
    </SelectedProductContext.Provider>
  );
}

export function useSelectedProduct() {
  return useContext(SelectedProductContext);
}
