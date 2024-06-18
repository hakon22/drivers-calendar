export type ScheduleSchemaUserType = {
  id: number;
  phone: string;
  color: string;
  username: string;
};

export type ScheduleSchemaType = {
  [key: string]: ScheduleSchemaUserType,
};
