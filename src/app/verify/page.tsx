import { WorkflowShell } from "@/components/workflow-shell";
import { VerifyWorkflow } from "@/components/verify-workflow";

export default function VerifyPage() {
  return (
    <WorkflowShell
      eyebrow="Signature verification"
      title="Check whether the signature still matches"
      description="Upload the document, signature, and public key to see whether the seal is still valid."
      activeHref="/verify"
    >
      <VerifyWorkflow />
    </WorkflowShell>
  );
}
