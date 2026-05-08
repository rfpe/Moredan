export type Category = {
  id: string;
  name: string;
  color: string;
};

export type AttributeType = 'text' | 'textarea' | 'url';

export type EventAttribute = {
  id: string;
  name: string;
  type: AttributeType;
  order: number;
};

export type CalendarEvent = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  categoryId: string;
  attributes?: Record<string, string>;
};
