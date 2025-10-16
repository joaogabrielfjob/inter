const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+/g;

function dateParser(_: string, value: string) {
  if (typeof value === 'string' && value.match(isoDateRegex)) {
    return new Date(value);
  }

  return value;
}

export function transformDates(date: unknown) {
  if (date && typeof date === 'string') {
    try {
      return JSON.parse(date, dateParser);
    } catch {
      console.error('Failed to parse JSON string:', date);
      return date;
    }
  }

  return date;
}
