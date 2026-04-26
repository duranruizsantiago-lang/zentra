"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Invoice } from "@/types/models";

const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    company_id: "c-001",
    filename: "factura_endesa_marzo.pdf",
    status: "completed",
    supplier: "Endesa",
    amount: 1245.60,
    date: "2026-03-05",
    co2e_extracted: 2.8,
    ocr_confidence: 0.94,
    uploaded_at: "2026-03-06T08:15:00Z",
  },
  {
    id: "inv-002",
    company_id: "c-001",
    filename: "factura_repsol_febrero.pdf",
    status: "completed",
    supplier: "Repsol",
    amount: 892.30,
    date: "2026-02-18",
    co2e_extracted: 1.9,
    ocr_confidence: 0.91,
    uploaded_at: "2026-02-20T14:30:00Z",
  },
  {
    id: "inv-003",
    company_id: "c-001",
    filename: "factura_iberdrola_enero.pdf",
    status: "completed",
    supplier: "Iberdrola",
    amount: 1560.00,
    date: "2026-01-10",
    co2e_extracted: 3.1,
    ocr_confidence: 0.96,
    uploaded_at: "2026-01-11T10:00:00Z",
  },
  {
    id: "inv-004",
    company_id: "c-001",
    filename: "factura_aguas_abril.pdf",
    status: "processing",
    supplier: "Canal de Isabel II",
    amount: 340.75,
    date: "2026-04-01",
    uploaded_at: "2026-04-02T09:45:00Z",
  },
  {
    id: "inv-005",
    company_id: "c-001",
    filename: "factura_gas_natural_feb.pdf",
    status: "error",
    supplier: "Naturgy",
    amount: 520.00,
    date: "2026-02-05",
    uploaded_at: "2026-02-06T16:20:00Z",
  },
];

export function useInvoices(companyId?: string) {
  return useQuery({
    queryKey: ["invoices", companyId],
    queryFn: async () => {
      try {
        const { data } = await api.get("/api/v1/invoices");
        return data as Invoice[];
      } catch {
        return MOCK_INVOICES;
      }
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: ["invoices", "detail", id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/v1/invoices/${id}`);
        return data as Invoice;
      } catch {
        return MOCK_INVOICES.find((i) => i.id === id) ?? null;
      }
    },
    enabled: !!id,
  });
}

export function useUploadInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post("/api/v1/invoices/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return data as Invoice;
      } catch {
        await new Promise((r) => setTimeout(r, 1500));
        return {
          id: `inv-${Date.now()}`,
          company_id: "c-001",
          filename: file.name,
          status: "processing" as const,
          supplier: "Procesando…",
          amount: 0,
          uploaded_at: new Date().toISOString(),
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
