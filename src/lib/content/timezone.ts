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

  const matchingInstants = [-60, 0, 60]
    .map((minutes) => new Date(guess.getTime() + minutes * 60_000))
    .filter((candidate) => utcToEtInput(candidate) === value)
    .sort((a, b) => a.getTime() - b.getTime());

  if (!matchingInstants.length) {
    throw new Error(`Eastern Time ${value} does not exist because of the daylight saving transition`);
  }

  // During the fall transition, 01:00-01:59 occurs twice. Use the earlier EDT instant.
  return matchingInstants[0];
}

export function isWithinPromotionWindow(now: Date, start: Date, end: Date) {
  return now.getTime() >= start.getTime() && now.getTime() < end.getTime();
}
