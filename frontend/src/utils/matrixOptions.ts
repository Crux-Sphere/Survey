/**
 * Matrix / Radio Grid option helpers.
 * New format: [{ id: 1, label: "..." }, ...]
 * Legacy: "line1\\nline2" or ["line1", "line2"]
 */

export type MatrixOption = { id: number; label: string };

export function parseMatrixOptions(value: unknown): string[] {
  if (value == null || value === "") return [];

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (item == null) return "";
        if (typeof item === "string") return item.trim();
        if (typeof item === "object") {
          const label =
            item.label ?? item.value ?? item.name ?? item.text ?? "";
          return String(label).trim();
        }
        return String(item).trim();
      })
      .filter(Boolean);
  }

  return [];
}

export function toMatrixOptionObjects(labels: string[]): MatrixOption[] {
  return labels
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label, index) => ({ id: index + 1, label }));
}
