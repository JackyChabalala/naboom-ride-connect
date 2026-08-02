"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBadge } from "@/components/icon-badge";
import { Card } from "@/components/card";
import { saveDriverSession, MOCK_OTP } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

type Step = "phone" | "otp";

export default function DriverLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePhone(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      toast({ title: "Enter your phone number", variant: "destructive" });
      return;
    }
    setStep("otp");
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp !== MOCK_OTP) {
      toast({
        title: "Invalid code",
        description: `Use the demo code ${MOCK_OTP}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/driver/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      saveDriverSession({ id: data.id, name: data.name, phone: data.phone });
      toast({ title: `Welcome back, ${data.name}!` });
      router.push("/driver/dashboard");
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-teal px-6 pt-10 pb-16 rounded-b-[2rem]">
        <Link
          href="/"
          className="inline-flex text-sm text-cream/80 hover:text-white mb-6 font-medium"
        >
          ← Home
        </Link>
        <div className="flex items-center gap-4">
          <IconBadge icon={Car} color="orange" size="lg" />
          <div>
            <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white">
              Driver login
            </h1>
            <p className="text-cream/80 text-sm mt-1 font-inter">
              Sign in with your registered phone
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 -mt-8">
        <Card className="p-6 md:p-8">
          {step === "phone" ? (
            <form onSubmit={handlePhone} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 0832220001"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Continue
              </Button>
              <p className="text-center text-sm text-grey font-inter">
                New driver?{" "}
                <Link
                  href="/driver/register"
                  className="text-teal font-semibold hover:text-teal-dark"
                >
                  Register here
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-5">
              <div className="flex justify-center mb-2">
                <IconBadge icon={Smartphone} color="orange" size="md" />
              </div>
              <p className="text-center text-sm text-grey font-inter leading-relaxed">
                Enter the code for{" "}
                <span className="font-semibold text-ink">{phone}</span>
                <br />
                <span className="text-xs mt-1 block">
                  Demo code: <strong className="text-teal">{MOCK_OTP}</strong>
                </span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-center text-xl tracking-widest font-semibold"
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in…" : "Verify & continue"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-sm text-teal hover:text-teal-dark font-medium"
              >
                Change number
              </button>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
