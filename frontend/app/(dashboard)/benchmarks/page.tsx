import type { Metadata } from "next";
import { BenchmarkContent } from "./benchmark-content";

export const metadata: Metadata = { title: "Benchmarking Sectorial" };

export default function Page() {
  return <BenchmarkContent />;
}
