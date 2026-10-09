/** "OCT 08 2026" — the project brief's revision date (Sheet 06). */
export function formatBriefDate(date: Date): string {
  return date
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    .toUpperCase()
    .replace(',', '');
}
