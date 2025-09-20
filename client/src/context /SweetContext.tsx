// src/context/SweetContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

export type Sweet = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
};

type SweetContextType = {
  sweets: Sweet[];
  fetchSweets: () => Promise<void>;
  purchaseSweet: (id: number, quantity: number) => Promise<Sweet>;
  addSweet: (payload: { name: string; category: string; price: number; quantity: number }) => Promise<Sweet>;
  updateSweet: (id: number, payload: Partial<{ name: string; category: string; price: number; quantity: number }>) => Promise<Sweet>;
  deleteSweet: (id: number) => Promise<void>;
  restockSweet: (id: number, quantity: number) => Promise<Sweet>;
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

  const addSweet = async (payload: { name: string; category: string; price: number; quantity: number }) => {
    const res = await api.post("/api/sweets", payload);
    const created: Sweet = res.data.sweet;
    setSweets(prev => [created, ...prev]);
    return created;
  };

  const updateSweet = async (id: number, payload: Partial<{ name: string; category: string; price: number; quantity: number }>) => {
    const res = await api.put(`/api/sweets/${id}`, payload);
    const updated: Sweet = res.data.sweet ?? res.data; // accept either shape
    setSweets(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    return updated;
  };

  const deleteSweet = async (id: number) => {
    await api.delete(`/api/sweets/${id}`);
    setSweets(prev => prev.filter(s => s.id !== id));
  };

  const restockSweet = async (id: number, quantity: number) => {
    const res = await api.post(`/api/sweets/${id}/restock`, { quantity });
    const updated: Sweet = res.data.sweet;
    setSweets(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    return updated;
  };

  useEffect(() => { fetchSweets().catch(()=>{}); }, []);

  return (
    <SweetContext.Provider value={{ sweets, fetchSweets, purchaseSweet, addSweet, updateSweet, deleteSweet, restockSweet }}>
      {children}
    </SweetContext.Provider>
  );
};

export const useSweets = () => {
  const ctx = useContext(SweetContext);
  if (!ctx) throw new Error("useSweets must be used inside SweetProvider");
  return ctx;
};
