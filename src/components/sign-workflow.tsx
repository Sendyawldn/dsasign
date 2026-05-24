"use client";

import { useState } from "react";
import { Copy, Download, FileUp, Loader2, Upload } from "lucide-react";

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
import type { SignatureRecord } from "@/lib/contracts";
import { copyText, downloadJson, toPrettyJson } from "./workflow-utils";

type ApiResponse = {
  success: boolean;
  message: string;
  data?: SignatureRecord;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
};

export function SignWorkflow() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentHash, setDocumentHash] = useState("");
  const [x, setX] = useState("");
  const [p, setP] = useState("");
  const [q, setQ] = useState("");
  const [g, setG] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SignatureRecord | null>(null);
  const [message, setMessage] = useState(
    "Upload a document and paste the private key values to seal it.",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      if (documentFile) {
        formData.append("document", documentFile);
      } else if (documentHash.trim()) {
        formData.append("documentHash", documentHash.trim());
      }

      formData.append("x", x.trim());
      formData.append("p", p.trim());
      formData.append("q", q.trim());
      formData.append("g", g.trim());

      const response = await fetch("/api/sign", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.error?.message ||
            payload.message ||
            "Failed to sign document.",
        );
      }

      setResponse(payload.data);
      setMessage(payload.message);
    } catch (exception) {
      setResponse(null);
      setError(
        exception instanceof Error
          ? exception.message
          : "Failed to sign document.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Seal a document</CardTitle>
          <CardDescription>
            Upload the file or provide a document hash, then sign it with the
            private key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="document">Document file</Label>
              <label
                htmlFor="document"
                className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/40"
              >
                <Upload className="size-5 text-foreground" />
                <span>
                  {documentFile
                    ? documentFile.name
                    : "Choose a PDF, TXT, or DOCX file"}
                </span>
                <input
                  id="document"
                  type="file"
                  className="sr-only"
                  onChange={(event) =>
                    setDocumentFile(event.target.files?.[0] ?? null)
                  }
                />
              </label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="documentHash">Document hash fallback</Label>
              <Input
                id="documentHash"
                value={documentHash}
                onChange={(event) => setDocumentHash(event.target.value)}
                placeholder="sha256:..."
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="x">Private key x</Label>
                <Input
                  id="x"
                  value={x}
                  onChange={(event) => setX(event.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p">p</Label>
                <Input
                  id="p"
                  value={p}
                  onChange={(event) => setP(event.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="q">q</Label>
                <Input
                  id="q"
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="g">g</Label>
                <Input
                  id="g"
                  value={g}
                  onChange={(event) => setG(event.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="..."
                />
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              If you have a generated key bundle, copy the numeric fields here.
              The API will hash the file for you when a document is uploaded.
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
                  <FileUp className="size-4" />
                )}
                {loading ? "Signing" : "Sign document"}
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
            <CardTitle>Signature output</CardTitle>
            <CardDescription>
              Copy or download the signature JSON after the seal is created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Signature payload
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Document hash and signature values from the API.
                      </p>
                    </div>
                    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Ready
                    </div>
                  </div>
                  <pre className="mt-4 overflow-x-auto text-sm leading-6 text-foreground">
                    {toPrettyJson(response)}
                  </pre>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 rounded-full px-3"
                      onClick={async () => copyText(toPrettyJson(response))}
                    >
                      <Copy className="size-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 rounded-full px-3"
                      onClick={() =>
                        downloadJson("dsasign-signature.json", response)
                      }
                    >
                      <Download className="size-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                The signature JSON appears here after a successful signing
                request.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Education mode</CardTitle>
            <CardDescription>
              Read the steps to explain how the signature was produced.
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
                The step list appears after the server returns a signature.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
