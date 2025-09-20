import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import type { Sweet } from "../validation/sweetSchemas";

type SweetContextType = {
  sweets: Sweet[];
  fetchSweets: () => Promise<void>;
  purchaseSweet: (id: number, quantity: number) => Promise<Sweet>;
};

const SweetContext = createContext<SweetContextType | undefined>(undefined);

export const SweetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sweets, setSweets] = useState<Sweet[]>([]);

  const fetchSweets = async () => {
    const res = await api.get("/api/sweets");
    if (res?.data?.sweets) setSweets(res.data.sweets);
  };

  const purchaseSweet = async (id: number, quantity: number) => {
    const res = await api.post(`/api/sweets/${id}/purchase`, { quantity });
    const updated: Sweet = res.data.sweet;
    setSweets(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    return updated;
  };

  useEffect(() => { fetchSweets().catch(()=>{}); }, []);

  return (
    <SweetContext.Provider value={{ sweets, fetchSweets, purchaseSweet }}>
      {children}
    </SweetContext.Provider>
  );
};

export const useSweets = () => {
  const ctx = useContext(SweetContext);
  if (!ctx) throw new Error("useSweets must be used inside SweetProvider");
  return ctx;
};