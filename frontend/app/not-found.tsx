import Link from "next/link";
import { MapPinOff, Leaf, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg">SENDA</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
          <MapPinOff className="h-10 w-10 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Esta senda no existe
        </h1>
        <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
          La página que buscas no está disponible. Vuelve al dashboard para
          continuar tu camino hacia la sostenibilidad.
        </p>

        <Link
          href="/"
          className={cn(buttonVariants({ size: "lg" }), "gap-2")}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Link>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        © 2026 SENDA — AGPL-3.0
      </footer>
    </div>
  );
}
