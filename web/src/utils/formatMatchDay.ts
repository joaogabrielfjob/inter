export function formatMatchDay(matchDay: string): string {
  const [year, month, day] = matchDay.split('-');
  return `${day}/${month}/${year.slice(-2)}`;
}
