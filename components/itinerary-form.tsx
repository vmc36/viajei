"use client";

import * as React from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Currency, ItineraryRequestInput } from "@/lib/types";

const KEYWORD_MAX = 60;
const KEYWORDS_MAX = 20;
const CITY_MAX = 80;
const TEXT_MAX = 2000;
const SAFE_TEXT = /^[\p{L}\p{N}\s\-',.&()/]+$/u;
const SEPARATORS = /[,;\n\r\t•·|]+|\s+[eE]\s+|\s+and\s+/g;

interface Props {
  loading: boolean;
  onSubmit: (input: ItineraryRequestInput) => void;
}

function parseKeywords(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(SEPARATORS)) {
    const value = raw.trim().replace(/^[-.]+|[-.]+$/g, "");
    if (!value) continue;
    if (value.length > KEYWORD_MAX) continue;
    if (!SAFE_TEXT.test(value)) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= KEYWORDS_MAX) break;
  }
  return out;
}

export function ItineraryForm({ loading, onSubmit }: Props) {
  const [city, setCity] = React.useState("");
  const [days, setDays] = React.useState(5);
  const [currency, setCurrency] = React.useState<Currency>("BRL");
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const parsed = React.useMemo(() => parseKeywords(text), [text]);

  const removeKeyword = (idx: number) => {
    const next = parsed.filter((_, i) => i !== idx);
    setText(next.join(", "));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedCity = city.trim();
    if (trimmedCity.length < 2) return setError("Informe uma cidade.");
    if (trimmedCity.length > CITY_MAX) return setError("Cidade muito longa.");
    if (!SAFE_TEXT.test(trimmedCity)) return setError("Cidade contém caracteres inválidos.");
    if (days < 1 || days > 14) return setError("Dias devem estar entre 1 e 14.");
    if (!parsed.length) return setError("Descreva pelo menos uma ideia no brainstorming.");
    onSubmit({ city: trimmedCity, days, currency, keywords: parsed });
  };

  return (
    <Card className="animate-fade-in-up">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid gap-6 md:grid-cols-[1fr_auto_auto]">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade de destino</Label>
              <Input
                id="city"
                placeholder="Lisboa"
                value={city}
                maxLength={CITY_MAX}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="off"
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Dias</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={14}
                step={1}
                inputMode="numeric"
                className="w-24"
                value={days}
                onChange={(e) =>
                  setDays(Math.max(1, Math.min(14, Number(e.target.value) || 1)))
                }
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                disabled={loading}
                className="flex h-10 w-full min-w-[6rem] rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="keywords">Brainstorming</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {parsed.length}/{KEYWORDS_MAX}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Escreva livremente ou cole um texto — separamos automaticamente por vírgulas, ponto
              e vírgula, quebras de linha ou &quot;e&quot;.
            </p>
            <Textarea
              id="keywords"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, TEXT_MAX))}
              maxLength={TEXT_MAX}
              disabled={loading}
              placeholder="Ex: pastel de nata, fado ao vivo, bondinho 28, vinho do porto, museu de arte, praia ao pôr do sol..."
              className="min-h-[120px] resize-y"
              rows={5}
            />
            {parsed.length > 0 && (
              <div
                className={cn(
                  "flex flex-wrap gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3",
                  loading && "opacity-60",
                )}
                aria-label="Palavras-chave detectadas"
              >
                {parsed.map((kw, i) => (
                  <span
                    key={`${kw}-${i}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-background px-2 py-1 text-xs shadow-sm"
                  >
                    {kw}
                    <button
                      type="button"
                      aria-label={`Remover ${kw}`}
                      onClick={() => removeKeyword(i)}
                      disabled={loading}
                      className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Gerando roteiro...
              </>
            ) : (
              <>
                <Sparkles /> Gerar roteiro
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
