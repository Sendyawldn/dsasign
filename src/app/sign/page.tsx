import { WorkflowShell } from "@/components/workflow-shell";
import { SignWorkflow } from "@/components/sign-workflow";

export default function SignPage() {
  return (
    <WorkflowShell
      eyebrow="Document signing"
      title="Seal a document with the private key"
      description="Upload the document, provide the signer key values, and download the signature payload."
      activeHref="/sign"
    >
      <SignWorkflow />
    </WorkflowShell>
  );
}
