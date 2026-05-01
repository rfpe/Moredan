export type Category = {
  id: string;
  name: string;
  color: string;
};

export type CalendarEvent = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  categoryId: string;
};
