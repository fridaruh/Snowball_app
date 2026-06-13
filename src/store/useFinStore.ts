"use client";
import { useState, useEffect, useCallback } from "react";
import type { Transaction, CreditCard, PersonalCredit } from "@/types";
import { CARD_COLORS } from "@/lib/utils";

const STORAGE_KEY_TX = "finbot_transactions";
const STORAGE_KEY_CARDS = "finbot_cards";
const STORAGE_KEY_CREDITS = "finbot_personal_credits";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function useFinStore() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [personalCredits, setPersonalCredits] = useState<PersonalCredit[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTransactions(loadFromStorage<Transaction[]>(STORAGE_KEY_TX, []));
    setCards(loadFromStorage<CreditCard[]>(STORAGE_KEY_CARDS, []));
    setPersonalCredits(loadFromStorage<PersonalCredit[]>(STORAGE_KEY_CREDITS, []));
    setHydrated(true);
  }, []);

  const addTransactions = useCallback((newTxs: Transaction[]) => {
    setTransactions((prev) => {
      const ids = new Set(prev.map((t) => t.id));
      const toAdd = newTxs.filter((t) => !ids.has(t.id));
      const updated = [...prev, ...toAdd].sort((a, b) => b.fecha.localeCompare(a.fecha));
      saveToStorage(STORAGE_KEY_TX, updated);
      return updated;
    });
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    const newTx: Transaction = { ...tx, id: crypto.randomUUID() };
    setTransactions((prev) => {
      const updated = [newTx, ...prev].sort((a, b) => b.fecha.localeCompare(a.fecha));
      saveToStorage(STORAGE_KEY_TX, updated);
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveToStorage(STORAGE_KEY_TX, updated);
      return updated;
    });
  }, []);

  const addCard = useCallback((card: Omit<CreditCard, "id" | "color">) => {
    setCards((prev) => {
      const color = CARD_COLORS[prev.length % CARD_COLORS.length];
      const newCard: CreditCard = { ...card, id: crypto.randomUUID(), color };
      const updated = [...prev, newCard];
      saveToStorage(STORAGE_KEY_CARDS, updated);
      return updated;
    });
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<CreditCard>) => {
    setCards((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveToStorage(STORAGE_KEY_CARDS, updated);
      return updated;
    });
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToStorage(STORAGE_KEY_CARDS, updated);
      return updated;
    });
  }, []);

  const addPersonalCredit = useCallback((credit: Omit<PersonalCredit, "id" | "color">) => {
    setPersonalCredits((prev) => {
      const colors = [
        "#2563EB", "#7C3AED", "#DB2777", "#D97706", "#059669",
        "#0891B2", "#DC2626", "#65A30D", "#9333EA", "#C2410C",
      ];
      const color = colors[prev.length % colors.length];
      const newCredit: PersonalCredit = { ...credit, id: crypto.randomUUID(), color };
      const updated = [...prev, newCredit];
      saveToStorage(STORAGE_KEY_CREDITS, updated);
      return updated;
    });
  }, []);

  const updatePersonalCredit = useCallback((id: string, updates: Partial<PersonalCredit>) => {
    setPersonalCredits((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveToStorage(STORAGE_KEY_CREDITS, updated);
      return updated;
    });
  }, []);

  const deletePersonalCredit = useCallback((id: string) => {
    setPersonalCredits((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToStorage(STORAGE_KEY_CREDITS, updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setTransactions([]);
    setCards([]);
    setPersonalCredits([]);
    saveToStorage(STORAGE_KEY_TX, []);
    saveToStorage(STORAGE_KEY_CARDS, []);
    saveToStorage(STORAGE_KEY_CREDITS, []);
  }, []);

  return {
    transactions,
    cards,
    personalCredits,
    hydrated,
    addTransactions,
    addTransaction,
    deleteTransaction,
    addCard,
    updateCard,
    deleteCard,
    addPersonalCredit,
    updatePersonalCredit,
    deletePersonalCredit,
    clearAll,
  };
}
