"use client";

import * as React from "react";
import { AlertCircle, Plane } from "lucide-react";
import { ItineraryForm } from "@/components/itinerary-form";
import { ItineraryResult } from "@/components/itinerary-result";
import { ItinerarySkeleton } from "@/components/itinerary-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Itinerary, ItineraryRequestInput } from "@/lib/types";

export default function HomePage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [itinerary, setItinerary] = React.useState<Itinerary | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const handleGenerate = async (input: ItineraryRequestInput) => {
    setLoading(true);
    setError(null);
    setItinerary(null);
    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          (data && typeof data === "object" && "error" in data && (data as { error?: { message?: string } }).error?.message) ||
          "Não foi possível gerar o roteiro.";
        throw new Error(message);
      }
      const withIds = {
        ...(data as Itinerary),
        days: (data as Itinerary).days.map((d, i) => ({
          ...d,
          _uid:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${i}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        })),
      };
      setItinerary(withIds);
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMoveDay = React.useCallback((from: number, to: number) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      if (from === to || from < 0 || to < 0 || from >= prev.days.length || to >= prev.days.length) {
        return prev;
      }
      const days = [...prev.days];
      const [moved] = days.splice(from, 1);
      days.splice(to, 0, moved);
      return { ...prev, days: days.map((d, i) => ({ ...d, day: i + 1 })) };
    });
  }, []);

  return (
    <main className="min-h-dvh px-4 pb-20 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plane className="size-4" />
            </span>
            <span>Travel Brainstorm</span>
          </div>
          <ThemeToggle />
        </header>

        <section className="mb-8 space-y-3 animate-fade-in-up">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Planeje sua viagem em segundos.
          </h1>
          <p className="max-w-2xl text-muted-foreground md:text-lg">
            Conte o destino, quantos dias e o que você quer fazer. A IA devolve um roteiro dia a
            dia com custos estimados.
          </p>
        </section>

        <ItineraryForm loading={loading} onSubmit={handleGenerate} />

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Algo deu errado</p>
              <p className="text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        <div ref={resultRef} className="mt-8">
          {loading && <ItinerarySkeleton />}
          {!loading && itinerary && (
            <ItineraryResult
              itinerary={itinerary}
              onReset={handleReset}
              onMoveDay={handleMoveDay}
            />
          )}
        </div>

        <footer className="mt-16 space-y-1 text-center text-xs text-muted-foreground">
          <p>Estimativas geradas por IA. Confira valores atuais antes de viajar.</p>
          <p>
            Fotos via{" "}
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Pexels
            </a>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
