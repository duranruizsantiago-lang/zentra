import Link from "next/link";
import {
  Leaf, ClipboardCheck, TreePine, FileText, MessageSquare,
  ArrowRight, TrendingDown, AlertTriangle, FileWarning,
  CheckCircle, BarChart3, Shield,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 lg:px-6 h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg">Zentra ESG</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Características</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">Cómo funciona</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Precios</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Iniciar sesión
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              Empieza gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 lg:px-6 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-6 gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Cumple con la normativa VSME 2027
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl mx-auto">
          Gestiona tu sostenibilidad{" "}
          <span className="text-primary">sin complejidad</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          La plataforma ESG diseñada para PYMEs españolas. Autodiagnóstico ASG, huella de carbono automatizada,
          informes VSME y asistente IA — todo en un solo lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
            Empieza gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Ver demo
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Sin tarjeta de crédito · Gratis 30 días · Open source (AGPL-3.0)</p>
      </section>

      {/* Problem */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="text-2xl font-bold text-center mb-10">¿Por qué actuar ahora?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle,
                stat: "83%",
                label: "de PYMEs no están preparadas para la normativa ESG 2027",
                color: "text-destructive",
              },
              {
                icon: FileWarning,
                stat: "5.000€",
                label: "coste medio de un informe ESG externo por consultoría",
                color: "text-accent",
              },
              {
                icon: TrendingDown,
                stat: "2027",
                label: "entrada en vigor de VSME para empresas con +250 empleados",
                color: "text-secondary",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.stat} className="p-6 text-center">
                  <CardContent className="p-0">
                    <Icon className={`h-8 w-8 mx-auto mb-3 ${item.color}`} />
                    <p className={`text-3xl font-extrabold font-tabular mb-2 ${item.color}`}>{item.stat}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 mx-auto max-w-6xl px-4 lg:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Todo lo que necesita tu empresa</h2>
          <p className="text-muted-foreground">Una plataforma completa, sin consultoras, sin complejidad.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: ClipboardCheck,
              title: "Autodiagnóstico ASG",
              desc: "Evalúa tu madurez en ambiental, social y gobernanza en menos de 10 minutos.",
              color: "bg-primary/10 text-primary",
            },
            {
              icon: TreePine,
              title: "Huella de Carbono",
              desc: "Calcula Scope 1, 2 y 3 automáticamente desde tus facturas con OCR inteligente.",
              color: "bg-secondary/10 text-secondary",
            },
            {
              icon: FileText,
              title: "Informes VSME",
              desc: "Genera informes conformes con el estándar VSME con un clic.",
              color: "bg-accent/10 text-accent",
            },
            {
              icon: MessageSquare,
              title: "Asistente IA",
              desc: "Consultas sobre normativa ESG, VSME, CSRD y planes de acción personalizados.",
              color: "bg-primary/10 text-primary",
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-6 hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${f.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">En 3 pasos</h2>
          <p className="text-muted-foreground mb-12">De cero a informe ESG en menos de una semana.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sube tus facturas",
                desc: "Arrastra y suelta tus facturas de energía, gas, agua y transporte. Nuestro OCR lo extrae todo.",
                icon: FileText,
              },
              {
                step: "2",
                title: "Calcula automáticamente",
                desc: "Calculamos tu huella de carbono Scope 1, 2 y 3 y tu score ASG en tiempo real.",
                icon: BarChart3,
              },
              {
                step: "3",
                title: "Genera tu informe",
                desc: "Descarga un informe VSME completo listo para enviar a tu banco, inversor o cliente.",
                icon: Shield,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="flex flex-col items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {s.step}
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 mx-auto max-w-6xl px-4 lg:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Precios transparentes</h2>
          <p className="text-muted-foreground">Sin sorpresas. Sin permanencia.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "Free",
              price: "0€",
              period: "/mes",
              desc: "Para empezar",
              features: ["1 diagnóstico ASG", "Huella carbono básica", "1 informe/mes", "Asistente IA (5 consultas)"],
              cta: "Empezar gratis",
              href: "/register",
              highlight: false,
            },
            {
              name: "Pro",
              price: "49€",
              period: "/mes",
              desc: "Para PYMEs en crecimiento",
              features: ["Diagnósticos ilimitados", "OCR automático facturas", "Informes VSME ilimitados", "Asistente IA ilimitado", "Benchmarking sectorial"],
              cta: "Empezar prueba gratis",
              href: "/register",
              highlight: true,
            },
            {
              name: "Business",
              price: "99€",
              period: "/mes",
              desc: "Para empresas medianas",
              features: ["Todo en Pro", "Multi-usuario (5 seats)", "API acceso", "Soporte prioritario", "Auditoría anual incluida"],
              cta: "Contactar ventas",
              href: "/register",
              highlight: false,
            },
          ].map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlight ? "border-primary shadow-lg relative" : ""}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Más popular</Badge>
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold font-tabular">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={cn(
                    buttonVariants({ variant: plan.highlight ? "default" : "outline" }),
                    "w-full justify-center"
                  )}
                >
                  {plan.cta}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Prepárate para la normativa ESG antes que tu competencia
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Únete a más de 500 PYMEs que ya gestionan su sostenibilidad con Zentra.
          </p>
          <Link href="/register" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "gap-2")}>
            Empezar gratis ahora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-semibold">Zentra ESG</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Zentra ESG — Open source bajo{" "}
              <span className="font-medium">AGPL-3.0</span>
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
