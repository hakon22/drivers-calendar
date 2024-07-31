export type ScheduleSchemaUserType = {
  id: number;
  color: string;
};

export type ScheduleSchemaType = {
  [key: string]: ScheduleSchemaUserType,
};
