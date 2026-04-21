"use client";

import * as React from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GripVertical,
  ImageIcon,
  Moon,
  Sun,
  Sunset,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency, formatLocalEquivalent } from "@/lib/utils";
import type { ActivityCategory, ActivityTime, ItineraryDay } from "@/lib/types";

interface Props {
  day: ItineraryDay;
  currency: string;
  localCurrency: string;
  localCurrencyRate: number;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  defaultOpen?: boolean;
}

const timeIcon: Record<ActivityTime, React.ReactNode> = {
  "manhã": <Sun className="size-4" />,
  "tarde": <Sunset className="size-4" />,
  "noite": <Moon className="size-4" />,
};

const categoryVariant: Record<ActivityCategory, React.ComponentProps<typeof Badge>["variant"]> = {
  comida: "comida",
  bebida: "bebida",
  atividade: "atividade",
  transporte: "transporte",
  hospedagem: "hospedagem",
  outro: "outro",
};

const DRAG_MIME = "text/plain";

function Carousel({ day, currency }: { day: ItineraryDay; currency: string }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  const update = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  React.useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const hasAnyImage = day.activities.some((a) => a.image);
  if (!hasAnyImage) return null;

  return (
    <div className="group/carousel relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label={`Galeria do dia ${day.day}`}
      >
        {day.activities.map((a, i) => (
          <figure
            key={i}
            className="relative shrink-0 snap-start overflow-hidden rounded-xl border bg-muted"
            style={{ width: "min(78%, 280px)", aspectRatio: "4 / 3" }}
          >
            {a.image ? (
              <Image
                src={a.image.url}
                alt={a.image.alt}
                fill
                sizes="(max-width: 768px) 78vw, 280px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="size-6" aria-hidden />
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 text-white">
              <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide opacity-90">
                <span>{a.time}</span>
                <span className="tabular-nums">{formatCurrency(a.estimatedCost, currency)}</span>
              </div>
              <p className="line-clamp-2 text-xs font-medium leading-snug">{a.name}</p>
            </div>
            {a.image && (
              <figcaption className="absolute right-1 top-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] text-white/90">
                <a
                  href={a.image.photographer.profileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:underline"
                >
                  {a.image.photographer.name}
                </a>
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollBy(-1)}
        disabled={!canPrev}
        className={cn(
          "absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full border bg-background/90 p-1.5 shadow-sm opacity-0 transition-opacity backdrop-blur group-hover/carousel:opacity-100 md:inline-flex",
          !canPrev && "!opacity-0 pointer-events-none",
        )}
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Próximo"
        onClick={() => scrollBy(1)}
        disabled={!canNext}
        className={cn(
          "absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border bg-background/90 p-1.5 shadow-sm opacity-0 transition-opacity backdrop-blur group-hover/carousel:opacity-100 md:inline-flex",
          !canNext && "!opacity-0 pointer-events-none",
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

export function DayCard({
  day,
  currency,
  localCurrency,
  localCurrencyRate,
  index,
  total,
  onMove,
  defaultOpen = true,
}: Props) {
  const dailyTotalLocal = formatLocalEquivalent(
    day.dailyTotal,
    localCurrencyRate,
    localCurrency,
    currency,
  );
  const [open, setOpen] = React.useState(defaultOpen);
  const [dragging, setDragging] = React.useState(false);
  const [dropOver, setDropOver] = React.useState<"top" | "bottom" | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData(DRAG_MIME, String(index));
    e.dataTransfer.effectAllowed = "move";
    setDragging(true);
  };

  const handleDragEnd = () => {
    setDragging(false);
    setDropOver(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const offset = e.clientY - rect.top;
    setDropOver(offset < rect.height / 2 ? "top" : "bottom");
  };

  const handleDragLeave = () => setDropOver(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData(DRAG_MIME);
    const from = Number.parseInt(raw, 10);
    setDropOver(null);
    setDragging(false);
    if (!Number.isFinite(from) || from === index) return;
    const before = dropOver === "top";
    let to = before ? index : index + 1;
    if (from < to) to -= 1;
    onMove(from, to);
  };

  const moveUp = () => index > 0 && onMove(index, index - 1);
  const moveDown = () => index < total - 1 && onMove(index, index + 1);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative transition-opacity",
        dragging && "opacity-40",
      )}
      aria-roledescription="Card de dia reordenável"
    >
      {dropOver === "top" && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1.5 left-0 right-0 h-1 rounded-full bg-primary"
        />
      )}
      {dropOver === "bottom" && (
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-1.5 left-0 right-0 h-1 rounded-full bg-primary"
        />
      )}
      <Card className="animate-fade-in-up overflow-hidden">
        <div className="flex w-full items-center gap-2 p-3 pl-2 md:p-4 md:pl-3">
          <span
            aria-hidden
            title="Arraste para reordenar"
            className="hidden cursor-grab select-none rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing md:inline-flex"
          >
            <GripVertical className="size-4" />
          </span>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex flex-1 items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent/40"
            aria-expanded={open}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
              {day.day}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Dia {day.day}</p>
              <h3 className="truncate text-base font-semibold leading-tight">{day.title}</h3>
            </div>
            <span className="hidden flex-col items-end text-right tabular-nums sm:flex">
              <span className="text-sm font-medium leading-none">
                {formatCurrency(day.dailyTotal, currency)}
              </span>
              {dailyTotalLocal && (
                <span className="mt-0.5 text-[11px] text-muted-foreground">
                  {dailyTotalLocal}
                </span>
              )}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          <div className="flex flex-col">
            <button
              type="button"
              onClick={moveUp}
              disabled={index === 0}
              aria-label="Mover dia para cima"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronUp className="size-4" />
            </button>
            <button
              type="button"
              onClick={moveDown}
              disabled={index === total - 1}
              aria-label="Mover dia para baixo"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        </div>

        {open && (
          <>
            <Carousel day={day} currency={currency} />
            <CardContent className="p-5 pt-0">
              <Separator className="mb-5" />
              <ol className="space-y-5">
                {day.activities.map((activity, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center pt-1">
                      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {timeIcon[activity.time]}
                      </span>
                      {idx < day.activities.length - 1 && (
                        <span className="mt-2 h-full w-px flex-1 bg-border" aria-hidden />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {activity.time}
                        </span>
                        <Badge variant={categoryVariant[activity.category]}>
                          {activity.category}
                        </Badge>
                        <span className="ml-auto flex flex-col items-end tabular-nums">
                          <span className="text-sm font-medium leading-none">
                            {formatCurrency(activity.estimatedCost, currency)}
                          </span>
                          {(() => {
                            const local = formatLocalEquivalent(
                              activity.estimatedCost,
                              localCurrencyRate,
                              localCurrency,
                              currency,
                            );
                            return local ? (
                              <span className="mt-0.5 text-[11px] text-muted-foreground">
                                {local}
                              </span>
                            ) : null;
                          })()}
                        </span>
                      </div>
                      <p className="font-medium leading-snug">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Separator className="my-5" />
              <div className="flex items-center justify-between text-sm sm:hidden">
                <span className="text-muted-foreground">Total do dia</span>
                <span className="flex flex-col items-end tabular-nums">
                  <span className="font-medium leading-none">
                    {formatCurrency(day.dailyTotal, currency)}
                  </span>
                  {dailyTotalLocal && (
                    <span className="mt-0.5 text-[11px] text-muted-foreground">
                      {dailyTotalLocal}
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
