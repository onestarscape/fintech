import { Home, Wallet, Briefcase, Car, ShieldCheck, GraduationCap, Coins, Landmark, type LucideIcon } from "lucide-react";
import { createElement, type ReactNode } from "react";

// Maps the `icon` string stored on a product row (Dynamic Product Engine)
// to an actual component. Adding a new product with a new icon just needs
// its name added here — never a new code path.
export const PRODUCT_ICONS: Record<string, LucideIcon> = {
  Home,
  Wallet,
  Briefcase,
  Car,
  ShieldCheck,
  GraduationCap,
  Coins,
  Landmark,
};

export function getProductIcon(name: string | null): LucideIcon {
  return (name && PRODUCT_ICONS[name]) || Coins;
}

/** Renders a product's icon as an element — avoids assigning a dynamically
 *  resolved component to a PascalCase variable used directly as JSX. */
export function renderProductIcon(name: string | null, props: Record<string, unknown> = {}): ReactNode {
  return createElement(getProductIcon(name), props);
}
