import { WorkflowShell } from "@/components/workflow-shell";
import { KeygenWorkflow } from "@/components/keygen-workflow";

export default function KeygenPage() {
  return (
    <WorkflowShell
      eyebrow="Key generation"
      title="Generate the signer key pair"
      description="Create the public and private key material that drives the signing and verification flow."
      activeHref="/keygen"
    >
      <KeygenWorkflow />
    </WorkflowShell>
  );
}
