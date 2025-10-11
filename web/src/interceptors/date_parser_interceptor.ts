const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+/g;

function dateParser(_: string, value: string) {
  if (typeof value === 'string' && value.match(isoDateRegex)) {
    return new Date(value);
  }

  return value;
}

export function transformDates(data: unknown) {
  if (data && typeof data === 'string') {
    try {
      return JSON.parse(data, dateParser);
    } catch {
      console.error('Failed to parse JSON string:', data);
      return data;
    }
  }

  return data;
}
