// src/types/roles.ts
export type Role = "admin" | "bayi" | "restaurant" | "corporate" | "marketing";

export type NavItem = { label: string; href: string };
export type NavGroup = { title: string; items: NavItem[] };
