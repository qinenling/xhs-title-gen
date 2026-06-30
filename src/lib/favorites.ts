import type { GeneratedTitle } from "./types";

export interface FavoriteTitle extends GeneratedTitle {
  id: string;
  topic: string;
  savedAt: string;
}

const STORAGE_KEY = "xhs-title-gen-favorites";
const MAX_FAVORITES = 50;

export function getFavorites(): FavoriteTitle[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as FavoriteTitle[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function isFavorite(title: string): boolean {
  return getFavorites().some((f) => f.title === title);
}

export function toggleFavorite(
  item: GeneratedTitle,
  topic: string
): FavoriteTitle[] {
  const list = getFavorites();
  const exists = list.find((f) => f.title === item.title);

  let next: FavoriteTitle[];
  if (exists) {
    next = list.filter((f) => f.title !== item.title);
  } else {
    const record: FavoriteTitle = {
      ...item,
      id: crypto.randomUUID(),
      topic,
      savedAt: new Date().toISOString(),
    };
    next = [record, ...list].slice(0, MAX_FAVORITES);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function removeFavorite(id: string): FavoriteTitle[] {
  const next = getFavorites().filter((f) => f.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearFavorites(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
