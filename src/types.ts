export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  name: string;
  start: Date;
  end: Date;
  categoryId: string;
}
