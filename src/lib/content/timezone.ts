export const PROMOTION_TIME_ZONE = "America/New_York";

function parts(date: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: PROMOTION_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date).reduce<Record<string, string>>((acc, part) => { acc[part.type] = part.value; return acc; }, {});
}

export function utcToEtInput(value: Date): string {
  const p = parts(value);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function etInputToUtc(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Invalid ET datetime-local value");
  const [, year, month, day, hour, minute] = match;
  const desired = Date.UTC(+year, +month - 1, +day, +hour, +minute);
  let guess = new Date(desired);
  for (let i = 0; i < 3; i += 1) {
    const p = parts(guess);
    const actual = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    guess = new Date(guess.getTime() + desired - actual);
  }
  return guess;
}

export function isWithinPromotionWindow(now: Date, start: Date, end: Date) {
  return now.getTime() >= start.getTime() && now.getTime() < end.getTime();
}
