import type { HistoricalEvent } from './mockEvents';
import { daySlices } from './mockEvents';
import march13Data from './march13Events.json';

// Generate database from march13 data
const march13Events: HistoricalEvent[] = march13Data.map((ev: any, idx: number) => ({
  id: `0313-${idx}`,
  lat: ev.lat,
  lng: ev.lng,
  year: ev.year,
  title: ev.title,
  description: ev.description,
  region: "未知"
}));

export const eventsDatabase: Record<string, HistoricalEvent[]> = {
  "03-13": march13Events,
};

// Insert legacy mock data into the database
daySlices.forEach(slice => {
  const monthStr = slice.month.toString().padStart(2, '0');
  const dayStr = slice.day.toString().padStart(2, '0');
  const key = `${monthStr}-${dayStr}`;
  if (!eventsDatabase[key]) {
    eventsDatabase[key] = [];
  }
  eventsDatabase[key].push(...slice.events);
});

export function getEventsByDate(dateKey: string): HistoricalEvent[] {
  return eventsDatabase[dateKey] || [];
}

export function searchEventsDatabase(query: string): HistoricalEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  
  const allEvents = Object.values(eventsDatabase).flat();
  return allEvents.filter(ev =>
    ev.title.toLowerCase().includes(q) ||
    ev.description.toLowerCase().includes(q) ||
    ev.region.toLowerCase().includes(q) ||
    String(ev.year).includes(q)
  );
}
