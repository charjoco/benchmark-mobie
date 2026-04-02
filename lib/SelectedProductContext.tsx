import { createContext, useContext, useState } from "react";
import type { ProductRow } from "./types";

interface SelectedProductContextValue {
  product: ProductRow | null;
  setProduct: (p: ProductRow) => void;
}

const SelectedProductContext = createContext<SelectedProductContextValue>({
  product: null,
  setProduct: () => {},
});

export function SelectedProductProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<ProductRow | null>(null);
  return (
    <SelectedProductContext.Provider value={{ product, setProduct }}>
      {children}
    </SelectedProductContext.Provider>
  );
}

export function useSelectedProduct() {
  return useContext(SelectedProductContext);
}
