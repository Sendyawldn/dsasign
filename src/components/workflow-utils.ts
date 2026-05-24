export function toPrettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([toPrettyJson(value)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
