"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const current = theme === "system" ? resolvedTheme : theme;
  const next = current === "dark" ? "light" : "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Alternar para tema ${next === "dark" ? "escuro" : "claro"}`}
      onClick={() => setTheme(next)}
      className="rounded-full"
    >
      {mounted && current === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
