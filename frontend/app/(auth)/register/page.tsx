"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const steps = ["Datos personales", "Datos empresa"] as const;

const step1Schema = z.object({
  full_name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

const step2Schema = z.object({
  company_name: z.string().min(2, "Nombre de empresa requerido"),
  nif: z.string().min(9, "NIF inválido").max(9),
  company_sector: z.string().min(1, "Selecciona un sector"),
  company_size: z.enum(["micro", "small", "medium"]),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form1 = useForm<Step1Form>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: { company_size: "small" },
  });

  const handleStep1 = (data: Step1Form) => {
    setStep1Data(data);
    setStep(1);
  };

  const handleStep2 = async (data: Step2Form) => {
    if (!step1Data) return;
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      console.log("Register:", { ...step1Data, ...data });
      toast.success("Cuenta creada correctamente. ¡Bienvenido!");
      router.push("/");
    } catch {
      toast.error("Error al crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription>Gratis, sin tarjeta de crédito</CardDescription>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn("text-xs", i === step ? "font-medium" : "text-muted-foreground")}>
                {label}
              </span>
              {i < steps.length - 1 && <div className="h-px w-6 bg-border" />}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {step === 0 && (
          <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input id="full_name" placeholder="María García" aria-describedby={form1.formState.errors.full_name ? "full_name-error" : undefined} className={form1.formState.errors.full_name ? "border-destructive" : ""} {...form1.register("full_name")} />
              {form1.formState.errors.full_name && (
                <p id="full_name-error" className="text-xs text-destructive">{form1.formState.errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@empresa.es" autoComplete="email" aria-describedby={form1.formState.errors.email ? "reg-email-error" : undefined} className={form1.formState.errors.email ? "border-destructive" : ""} {...form1.register("email")} />
              {form1.formState.errors.email && (
                <p id="reg-email-error" className="text-xs text-destructive">{form1.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" aria-describedby={form1.formState.errors.password ? "reg-password-error" : undefined} className={form1.formState.errors.password ? "border-destructive" : ""} {...form1.register("password")} />
              {form1.formState.errors.password && (
                <p id="reg-password-error" className="text-xs text-destructive">{form1.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">Continuar</Button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de empresa</Label>
              <Input id="company_name" placeholder="Mi Empresa S.L." {...form2.register("company_name")} />
              {form2.formState.errors.company_name && (
                <p className="text-xs text-destructive">{form2.formState.errors.company_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif">NIF / CIF</Label>
              <Input id="nif" placeholder="B12345678" {...form2.register("nif")} />
              {form2.formState.errors.nif && (
                <p className="text-xs text-destructive">{form2.formState.errors.nif.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Sector</Label>
              <Select onValueChange={(v) => form2.setValue("company_sector", String(v))}>
                <SelectTrigger aria-label="Selecciona un sector">
                  <SelectValue placeholder="Selecciona un sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Comercio y Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufactura</SelectItem>
                  <SelectItem value="services">Servicios profesionales</SelectItem>
                  <SelectItem value="construction">Construcción</SelectItem>
                  <SelectItem value="hospitality">Hostelería y Turismo</SelectItem>
                  <SelectItem value="transport">Transporte y Logística</SelectItem>
                  <SelectItem value="technology">Tecnología</SelectItem>
                  <SelectItem value="agriculture">Agricultura</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tamaño de empresa</Label>
              <Select
                defaultValue="small"
                onValueChange={(v) => form2.setValue("company_size", String(v) as "micro" | "small" | "medium")}
              >
                <SelectTrigger aria-label="Selecciona tamaño de empresa">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="micro">Microempresa ({"<"}10 empleados)</SelectItem>
                  <SelectItem value="small">Pequeña (10–49 empleados)</SelectItem>
                  <SelectItem value="medium">Mediana (50–249 empleados)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>
                Atrás
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
