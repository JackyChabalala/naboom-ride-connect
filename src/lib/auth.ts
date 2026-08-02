export type PassengerSession = {
  role: "passenger";
  id: string;
  name: string;
  phone: string;
};

export type DriverSession = {
  role: "driver";
  id: string;
  name: string;
  phone: string;
};

export type Session = PassengerSession | DriverSession;

const PASSENGER_KEY = "lrc_passenger";
const DRIVER_KEY = "lrc_driver";

export function savePassengerSession(session: Omit<PassengerSession, "role">) {
  if (typeof window === "undefined") return;
  const data: PassengerSession = { ...session, role: "passenger" };
  localStorage.setItem(PASSENGER_KEY, JSON.stringify(data));
}

export function getPassengerSession(): PassengerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PASSENGER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PassengerSession;
  } catch {
    return null;
  }
}

export function clearPassengerSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PASSENGER_KEY);
}

export function saveDriverSession(session: Omit<DriverSession, "role">) {
  if (typeof window === "undefined") return;
  const data: DriverSession = { ...session, role: "driver" };
  localStorage.setItem(DRIVER_KEY, JSON.stringify(data));
}

export function getDriverSession(): DriverSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRIVER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DriverSession;
  } catch {
    return null;
  }
}

export function clearDriverSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRIVER_KEY);
}

export const MOCK_OTP = "123456";
