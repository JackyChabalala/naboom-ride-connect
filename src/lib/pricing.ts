export const ROUTES = {
  TOWN_TOWNSHIP: {
    id: "TOWN_TOWNSHIP" as const,
    label: "Town → Township",
    shortLabel: "Town ↔ Township",
    price: 60,
    description: "Fixed fare between town centre and the township",
  },
  WITHIN_TOWNSHIP: {
    id: "WITHIN_TOWNSHIP" as const,
    label: "Within Township",
    shortLabel: "Within Township",
    price: 30,
    description: "Fixed fare for trips inside the township",
  },
} as const;

export type RouteId = keyof typeof ROUTES;

export function getRoutePrice(route: string): number {
  if (route === "TOWN_TOWNSHIP") return ROUTES.TOWN_TOWNSHIP.price;
  if (route === "WITHIN_TOWNSHIP") return ROUTES.WITHIN_TOWNSHIP.price;
  throw new Error(`Unknown route: ${route}`);
}

export function getRouteLabel(route: string): string {
  if (route === "TOWN_TOWNSHIP") return ROUTES.TOWN_TOWNSHIP.label;
  if (route === "WITHIN_TOWNSHIP") return ROUTES.WITHIN_TOWNSHIP.label;
  return route;
}

export function formatPrice(price: number): string {
  return `R${price}`;
}
