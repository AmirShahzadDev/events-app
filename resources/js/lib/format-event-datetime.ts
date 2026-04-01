/**
 * Format an ISO-8601 instant for display (12-hour clock, local timezone).
 */
export function formatEventDateTime(
    iso: string,
    options: {
        month?: 'short' | 'long';
    } = {},
): string {
    const { month = 'short' } = options;
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month,
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(d);
}
