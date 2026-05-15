import { WorkspaceElement, Metrics, Language } from '../types';

export function calculateMetrics(elements: WorkspaceElement[], lang: Language, totalArea: number): Metrics {
  const area = totalArea || 0;
  
  let seats = 0;

  let openSpace = 0;
  let offices = 0;
  let confRooms = 0;
  let lounge = 0;
  let dining = 0;
  let reception = 0;
  let archive = 0;
  let site = 0;
  let archiveCapacity = 0;

  for (const el of elements) {
    if (el.type === 'desk_bench') {
      const cap = el.capacity || 2;
      openSpace += cap;
      seats += cap;
    } else if (el.type === 'desk_individual') {
      const cap = el.capacity || 1;
      openSpace += cap;
      seats += cap;
    } else if (el.type === 'desk_operative') {
      const cap = el.capacity || 1;
      openSpace += cap;
      seats += cap;
    } else if (el.type === 'desk_executive') {
      const cap = el.capacity || 1;
      openSpace += cap;
      seats += cap;
    } else if (el.type === 'private_office') {
      offices += 1;
      seats += 1;
    } else if (el.type === 'meeting_room') {
      confRooms += 1;
      seats += (el.capacity || 0);
    } else if (el.type === 'lounge') {
      lounge += 1;
      seats += 4;
    } else if (el.type === 'dining') {
      dining += 1;
      seats += 6;
    } else if (el.type === 'reception') {
      reception += 1;
    } else if (el.type === 'archive') {
      archive += 1;
      archiveCapacity += (el.capacity || 0);
    } else if (el.type === 'site') {
      site += 1;
    }
  }

  const density = seats > 0 ? +(area / seats).toFixed(2) : 0;

  const daylight = Math.min(100, Math.max(70, 100 - (offices * 2)));
  const privacy = Math.min(100, Math.max(10, 10 + (offices * 3) + (confRooms * 2)));
  const efficiency = Math.min(100, Math.max(60, 75 + (openSpace > 0 ? 5 : 0) - (confRooms)));

  return {
    area,
    seats,
    openSpace,
    offices,
    confRooms,
    lounge,
    dining,
    reception,
    archive,
    site,
    archiveCapacity,
    density,
    daylight,
    privacy,
    efficiency
  };
}
