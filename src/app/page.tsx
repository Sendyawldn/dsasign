import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSignature,
  KeyRound,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkflowShell } from "@/components/workflow-shell";

const highlights = [
  {
    icon: KeyRound,
    title: "Generate a key pair",
    text: "Create a public/private key pair with the server-side ElGamal/DSA math.",
    href: "/keygen",
  },
  {
    icon: FileSignature,
    title: "Seal a document",
    text: "Upload a file, hash it, and produce a signature payload.",
    href: "/sign",
  },
  {
    icon: ShieldCheck,
    title: "Verify the seal",
    text: "Compare the document, signature, and public key against the math result.",
    href: "/verify",
  },
];

const steps = [
  "Signer generates a key pair.",
  "Signer uploads a document and creates a signature.",
  "Verifier checks the signature against the document hash and public key.",
];

export default function Home() {
  return (
    <WorkflowShell
      eyebrow="Digital signature workflow"
      title="Bukti digital yang bergerak seperti arsip yang disegel"
      description="DSASign keeps the signer and verifier flows in one place, with visible math, downloadable JSON, and clear valid/invalid outcomes."
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Start with the custody flow</CardTitle>
            <CardDescription>
              Everything revolves around a document passing from key generation
              to signing and then verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-full px-5">
                <Link href="/keygen">
                  Open keygen
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full px-5"
              >
                <Link href="/sign">Seal a document</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border border-border bg-background/80 p-4 transition-colors hover:border-foreground/20 hover:bg-muted/30"
                  >
                    <Icon className="size-5 text-foreground" />
                    <p className="mt-4 text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.text}
                    </p>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-border/80 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>What the app shows</CardTitle>
              <CardDescription>
                The UI is built to explain the math instead of hiding it behind
                a spinner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-3 rounded-2xl border border-border bg-muted/20 p-4"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold text-foreground">
                    {index + 1}
                  </div>
                  <p className="pt-1 leading-6">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>Built for education</CardTitle>
              <CardDescription>
                The API returns the intermediate steps so students can present
                the process clearly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4">
                <Upload className="size-5 text-foreground" />
                File upload is supported for signing and verification.
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4">
                <CheckCircle2 className="size-5 text-foreground" />
                Valid and invalid states are explained in plain language.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </WorkflowShell>
  );
}
