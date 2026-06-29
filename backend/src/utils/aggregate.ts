// Simple aggregate placeholder. In production this would be a richer pipeline.
export function aggregate(report: { text: string }) {
  // Derive lightweight metadata for demonstration
  const length = report.text.length;
  const wordCount = report.text.split(/\s+/).filter(Boolean).length;
  return { length, wordCount };
}
