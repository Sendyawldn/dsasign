import type { WorkflowStep } from "@/lib/contracts";

type EducationPoint = {
  title: string;
  detail: string;
};

type EducationModeProps = {
  title: string;
  description: string;
  points: EducationPoint[];
  steps?: WorkflowStep[];
  emptyMessage: string;
};

export function EducationMode({
  title,
  description,
  points,
  steps,
  emptyMessage,
}: EducationModeProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-background/80 p-4">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.title}
              className="rounded-xl border border-border bg-muted/20 p-3"
            >
              <p className="text-sm font-medium text-foreground">
                {point.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {point.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {steps?.length ? (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={`${step.label}-${index}`}
              className="rounded-2xl border border-border bg-background/80 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
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
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
