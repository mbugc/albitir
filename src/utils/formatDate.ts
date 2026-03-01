/**
 * Format a pickup time string (HH:mm) for display.
 * @example formatPickupTime("17:00") → "5:00 PM"
 */
export function formatPickupTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a pickup window for display.
 * @example formatPickupWindow("17:00", "19:00") → "5:00 PM - 7:00 PM"
 */
export function formatPickupWindow(start: string, end: string): string {
  return `${formatPickupTime(start)} - ${formatPickupTime(end)}`;
}

/**
 * Determine if a pickup date is today, tomorrow, or a specific date.
 */
export function getPickupDateLabel(pickupDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pickup = new Date(pickupDate + 'T00:00:00');

  const diffMs = pickup.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return 'Past';

  return pickup.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get the next applicable pickup date based on days of week.
 * @param daysOfWeek Array of day numbers (1=Mon, 7=Sun)
 */
export function getNextPickupDate(daysOfWeek: number[]): string {
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + i);
    // JS getDay: 0=Sun, 1=Mon ... 6=Sat
    // Our format: 1=Mon ... 7=Sun
    const jsDay = candidate.getDay();
    const ourDay = jsDay === 0 ? 7 : jsDay;
    if (daysOfWeek.includes(ourDay)) {
      return candidate.toISOString().split('T')[0];
    }
  }
  // Fallback: today
  return now.toISOString().split('T')[0];
}
