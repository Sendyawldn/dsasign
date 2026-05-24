"use client";

import { useState } from "react";
import { Copy, Download, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { KeyGenerationResult } from "@/lib/contracts";
import { copyText, downloadJson, toPrettyJson } from "./workflow-utils";

type ApiResponse = {
  success: boolean;
  message: string;
  data?: KeyGenerationResult;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
};

export function KeygenWorkflow() {
  const [qBits, setQBits] = useState("160");
  const [pBits, setPBits] = useState("1024");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<KeyGenerationResult | null>(null);
  const [message, setMessage] = useState(
    "Generate a fresh key pair to start the signer workflow.",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/keygen", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          qBits: Number(qBits),
          pBits: Number(pBits),
        }),
      });

      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.error?.message ||
            payload.message ||
            "Failed to generate key pair.",
        );
      }

      setResponse(payload.data);
      setMessage(payload.message);
    } catch (exception) {
      setResponse(null);
      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to generate key pair.",
      );
    } finally {
      setLoading(false);
    }
  }

  const publicKey = response?.publicKey;
  const privateKey = response?.privateKey;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Generate key material</CardTitle>
          <CardDescription>
            Choose the bit sizes, then generate the public and private key pair
            on the server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="qBits">q bit size</Label>
                <Input
                  id="qBits"
                  inputMode="numeric"
                  value={qBits}
                  onChange={(event) => setQBits(event.target.value)}
                  placeholder="160"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pBits">p bit size</Label>
                <Input
                  id="pBits"
                  inputMode="numeric"
                  value={pBits}
                  onChange={(event) => setPBits(event.target.value)}
                  placeholder="1024"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Prime search can take a few seconds for larger values. The UI
              stays responsive while the server works.
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 rounded-full px-5"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                {loading ? "Generating" : "Generate key pair"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full px-5"
                onClick={() => {
                  setQBits("160");
                  setPBits("1024");
                  setError(null);
                  setMessage("Reset to the project defaults.");
                }}
              >
                Reset defaults
              </Button>
            </div>
          </form>

          <div className="mt-6 rounded-2xl border border-border bg-background/80 p-4 text-sm">
            <p className="font-medium text-foreground">Status</p>
            <p className="mt-1 text-muted-foreground">{error || message}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Key output</CardTitle>
            <CardDescription>
              The generated pair is ready to copy or download as JSON.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {publicKey ? (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Public key
                    </p>
                    <pre className="mt-3 overflow-x-auto text-sm leading-6 text-foreground">
                      {toPrettyJson(publicKey)}
                    </pre>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-full px-3"
                        onClick={async () => copyText(toPrettyJson(publicKey))}
                      >
                        <Copy className="size-4" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-full px-3"
                        onClick={() =>
                          downloadJson("dsasign-public-key.json", publicKey)
                        }
                      >
                        <Download className="size-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Private key
                    </p>
                    <pre className="mt-3 overflow-x-auto text-sm leading-6 text-foreground">
                      {toPrettyJson(privateKey)}
                    </pre>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-full px-3"
                        onClick={async () => copyText(toPrettyJson(privateKey))}
                      >
                        <Copy className="size-4" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-full px-3"
                        onClick={() =>
                          downloadJson("dsasign-private-key.json", privateKey)
                        }
                      >
                        <Download className="size-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                Generate a key pair to see the public and private key payloads
                here.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Education mode</CardTitle>
            <CardDescription>
              The server returns the math steps so you can explain the process
              line by line.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response?.steps?.length ? (
              <div className="space-y-3">
                {response.steps.map((step, index) => (
                  <div
                    key={`${step.label}-${index}`}
                    className="rounded-2xl border border-border bg-background/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {step.label}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {step.detail}
                        </p>
                      </div>
                      {step.value ? (
                        <code className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                          {step.value}
                        </code>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                The step list appears after a successful generation.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
