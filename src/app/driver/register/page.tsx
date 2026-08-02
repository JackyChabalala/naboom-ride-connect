"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, FileText, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBadge } from "@/components/icon-badge";
import { Card } from "@/components/card";
import { saveDriverSession } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function DriverRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleDesc, setVehicleDesc] = useState("");
  const [idDocName, setIdDocName] = useState("");
  const [licenceDocName, setLicenceDocName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !vehicleDesc.trim()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/driver/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          vehicleDesc: vehicleDesc.trim(),
          idDocName: idDocName || null,
          licenceDocName: licenceDocName || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      saveDriverSession({ id: data.id, name: data.name, phone: data.phone });
      toast({
        title: "Application submitted!",
        description: "An admin will review your documents shortly.",
      });
      router.push("/driver/dashboard");
    } catch (err) {
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-teal px-6 pt-10 pb-16 rounded-b-[2rem]">
        <Link
          href="/driver/login"
          className="inline-flex text-sm text-cream/80 hover:text-white mb-6 font-medium"
        >
          ← Back to login
        </Link>
        <div className="flex items-center gap-4">
          <IconBadge icon={Car} color="orange" size="lg" />
          <div>
            <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white">
              Become a driver
            </h1>
            <p className="text-cream/80 text-sm mt-1 font-inter">
              Submit your details for verification
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 -mt-8">
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="e.g. Sipho Nkosi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle description</Label>
              <Input
                id="vehicle"
                placeholder="Make / model / colour · plate"
                value={vehicleDesc}
                onChange={(e) => setVehicleDesc(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idDoc" className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-purple" />
                Upload ID document
              </Label>
              <Input
                id="idDoc"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setIdDocName(e.target.files?.[0]?.name || "")
                }
                className="file:mr-3 file:rounded-full file:border-0 file:bg-teal/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-teal"
              />
              {idDocName && (
                <p className="text-xs text-grey font-inter flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {idDocName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenceDoc" className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-purple" />
                Upload driver&apos;s licence
              </Label>
              <Input
                id="licenceDoc"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setLicenceDocName(e.target.files?.[0]?.name || "")
                }
                className="file:mr-3 file:rounded-full file:border-0 file:bg-teal/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-teal"
              />
              {licenceDocName && (
                <p className="text-xs text-grey font-inter flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {licenceDocName}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Submitting…" : "Submit application"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
