import Link from "next/link";
import type { ReactNode } from "react";
import { FileSignature, KeyRound, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type WorkflowShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  activeHref?: string;
  children: ReactNode;
};

const navItems = [
  {
    href: "/",
    label: "Beranda",
    icon: ShieldCheck,
  },
  {
    href: "/keygen",
    label: "Keygen",
    icon: KeyRound,
  },
  {
    href: "/sign",
    label: "Sign",
    icon: FileSignature,
  },
  {
    href: "/verify",
    label: "Verify",
    icon: ShieldCheck,
  },
];

export function WorkflowShell({
  eyebrow,
  title,
  description,
  activeHref,
  children,
}: WorkflowShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(250,249,246,0.98)_0%,rgba(245,242,235,0.9)_100%)] text-foreground dark:bg-[linear-gradient(180deg,rgba(15,15,17,0.98)_0%,rgba(10,10,12,0.92)_100%)]">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-sm">
              <FileSignature className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.18em] uppercase text-muted-foreground">
                DSASign
              </p>
              <p className="text-sm text-muted-foreground">
                Document custody workbench
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeHref === item.href;

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "gap-2 rounded-full px-4",
                    !isActive && "bg-background/80",
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
        <section className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance md:text-6xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            {description}
          </p>
        </section>

        <Separator />

        {children}
      </main>
    </div>
  );
}
