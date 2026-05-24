export type WorkflowStep = {
  label: string;
  detail: string;
  value?: string;
};

export type PublicKeyParams = {
  p: string;
  q: string;
  g: string;
  y: string;
};

export type PrivateKeyParams = {
  x: string;
};

export type SignatureParts = {
  r: string;
  s: string;
};

export type PublicKeyRecord = {
  algorithm: "ElGamal-DSA";
  keyType: "public";
  params: PublicKeyParams;
  createdAt: string;
};

export type PrivateKeyRecord = {
  algorithm: "ElGamal-DSA";
  keyType: "private";
  params: PrivateKeyParams;
  warning: string;
};

export type KeyGenerationResult = {
  publicKey: PublicKeyRecord;
  privateKey: PrivateKeyRecord;
  steps: WorkflowStep[];
};

export type SignatureRecord = {
  algorithm: "ElGamal-DSA";
  documentHash: string;
  signature: SignatureParts;
  signedAt: string;
  steps: WorkflowStep[];
};

export type VerificationRecord = {
  valid: boolean;
  reason: string;
  documentHash: string;
  signature: SignatureParts;
  checkedAt: string;
  steps: WorkflowStep[];
};
