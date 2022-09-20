export function getDateString(seconds: number) {
  const parts = [];

  seconds = Math.floor(seconds);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days) {
    parts.push(`${days} days`);
  }

  if (hours) {
    parts.push(`${hours % 24} hours`);
  }

  if (minutes) {
    parts.push(`${minutes % 60} minutes`);
  }

  if (seconds) {
    parts.push(`${seconds % 60} seconds`);
  }

  return parts.join(', ');
}
