export type ElementType =
  | 'desk_bench'
  | 'desk_individual'
  | 'desk_operative'
  | 'desk_executive'
  | 'meeting_room'
  | 'huddle_room'
  | 'private_office'
  | 'lounge'
  | 'dining'
  | 'reception'
  | 'archive'
  | 'site';

export type Language = 'en' | 'es';

export interface WorkspaceElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity?: number;
}

export interface WorkspaceVersion {
  id: string;
  name: string;
  elements: WorkspaceElement[];
}

export interface ProjectDetails {
  projectName: string;
  advisorName: string;
  totalArea: number;
  clientLogoUrl?: string;
}

export interface Metrics {
  area: number;
  seats: number;
  openSpace: number;
  offices: number;
  confRooms: number;
  lounge: number;
  dining: number;
  reception: number;
  archive: number;
  archiveCapacity: number;
  site: number;
  density: number;
  daylight: number;
  privacy: number;
  efficiency: number;
}