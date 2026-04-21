"use client";

import { Coins, Lightbulb, MapPin, RotateCcw, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DayCard } from "@/components/day-card";
import { formatCurrency, formatLocalEquivalent } from "@/lib/utils";
import type { Itinerary } from "@/lib/types";

interface Props {
  itinerary: Itinerary;
  onReset: () => void;
  onMoveDay: (from: number, to: number) => void;
}

export function ItineraryResult({ itinerary, onReset, onMoveDay }: Props) {
  const totalLocal = formatLocalEquivalent(
    itinerary.totalCost,
    itinerary.localCurrencyRate,
    itinerary.localCurrency,
    itinerary.currency,
  );
  const avgLocal = formatLocalEquivalent(
    itinerary.averageDailyCost,
    itinerary.localCurrencyRate,
    itinerary.localCurrency,
    itinerary.currency,
  );
  const showsLocal = Boolean(totalLocal);

  return (
    <section className="space-y-6" aria-live="polite">
      <Card className="animate-fade-in-up overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" /> Roteiro para
              </p>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {itinerary.city}
              </h2>
              <p className="text-sm text-muted-foreground">
                {itinerary.days.length} {itinerary.days.length === 1 ? "dia" : "dias"} ·{" "}
                {itinerary.currency}
                {showsLocal && ` · moeda local ${itinerary.localCurrency}`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:gap-8">
              <div>
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                  <Wallet className="size-3.5" /> Custo total
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums md:text-3xl">
                  {formatCurrency(itinerary.totalCost, itinerary.currency)}
                </p>
                {totalLocal && (
                  <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">{totalLocal}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Média diária
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums md:text-3xl">
                  {formatCurrency(itinerary.averageDailyCost, itinerary.currency)}
                </p>
                {avgLocal && (
                  <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">{avgLocal}</p>
                )}
              </div>
            </div>
          </div>
          {showsLocal && (
            <p className="mt-6 text-xs text-muted-foreground">
              Valores em {itinerary.localCurrency} são estimativas de conversão (taxa ≈{" "}
              {itinerary.localCurrencyRate.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}).
              Confira a cotação do dia.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {itinerary.days.map((day, idx) => (
          <DayCard
            key={day._uid ?? `day-${day.day}`}
            day={day}
            index={idx}
            total={itinerary.days.length}
            currency={itinerary.currency}
            localCurrency={itinerary.localCurrency}
            localCurrencyRate={itinerary.localCurrencyRate}
            onMove={onMoveDay}
          />
        ))}
      </div>

      <Card className="animate-fade-in-up">
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />
            <h3 className="text-base font-semibold">Dicas</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {itinerary.tips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button variant="outline" size="lg" onClick={onReset}>
          <RotateCcw /> Gerar outro roteiro
        </Button>
        {itinerary.usage && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Coins className="size-3" />
            <span className="tabular-nums">
              {itinerary.usage.totalTokens.toLocaleString("pt-BR")} tokens
            </span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">
              {itinerary.usage.inputTokens.toLocaleString("pt-BR")} entrada
            </span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">
              {itinerary.usage.outputTokens.toLocaleString("pt-BR")} saída
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
