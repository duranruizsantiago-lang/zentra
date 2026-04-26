"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DiagnosticQuestion, DiagnosticResult } from "@/types/models";

const MOCK_QUESTIONS: DiagnosticQuestion[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  question: [
    "¿Tiene la empresa una política ambiental documentada?",
    "¿Mide y reporta sus emisiones de gases de efecto invernadero?",
    "¿Realiza acciones de eficiencia energética?",
    "¿Gestiona adecuadamente sus residuos?",
    "¿Tiene un plan de igualdad o políticas de diversidad?",
    "¿Ofrece formación continua a sus empleados?",
    "¿Realiza encuestas de clima laboral?",
    "¿Cumple con los plazos legales de pago a proveedores?",
    "¿Tiene un código ético o de conducta?",
    "¿Dispone de un canal de denuncias?",
    "¿Publica información no financiera?",
    "¿Evalúa a sus proveedores con criterios ESG?",
  ][i],
  category: (["environmental", "environmental", "environmental", "environmental", "social", "social", "social", "governance", "governance", "governance", "governance", "governance"] as const)[i],
  options: [
    { text: "No implementado", score: 0 },
    { text: "En fase inicial", score: 1 },
    { text: "Parcialmente implementado", score: 2 },
    { text: "Implementado", score: 3 },
    { text: "Totalmente integrado", score: 4 },
  ],
  weight: 1,
}));

const MOCK_RESULT: DiagnosticResult = {
  id: "diag-001",
  company_id: "c-001",
  environmental_score: 68,
  social_score: 74,
  governance_score: 78,
  total_score: 72,
  maturity_level: "definido",
  recommendations: [
    {
      category: "environmental",
      title: "Implementar medición de huella de carbono",
      description: "Comenzar a medir emisiones Scope 1 y 2 con nuestra herramienta gratuita.",
      priority: "alta",
    },
    {
      category: "social",
      title: "Formalizar el plan de igualdad",
      description: "Documentar y registrar el plan de igualdad aunque no sea obligatorio por tamaño.",
      priority: "media",
    },
    {
      category: "governance",
      title: "Crear un código ético",
      description: "Redactar y publicar un código de conducta para empleados y proveedores.",
      priority: "baja",
    },
  ],
  completed_at: new Date().toISOString(),
};

export function useDiagnosticQuestions() {
  return useQuery({
    queryKey: ["diagnostics", "questions"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/api/v1/diagnostics/questions");
        return data as DiagnosticQuestion[];
      } catch {
        return MOCK_QUESTIONS;
      }
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useDiagnosticResult(companyId?: string) {
  return useQuery({
    queryKey: ["diagnostics", "result", companyId],
    queryFn: async () => {
      try {
        const { data } = await api.get("/api/v1/diagnostics/result");
        return data as DiagnosticResult;
      } catch {
        return MOCK_RESULT;
      }
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitDiagnostic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: Record<number, number>) => {
      try {
        const { data } = await api.post("/api/v1/diagnostics/submit", { answers });
        return data as DiagnosticResult;
      } catch {
        await new Promise((r) => setTimeout(r, 800));
        return MOCK_RESULT;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnostics"] });
    },
  });
}
