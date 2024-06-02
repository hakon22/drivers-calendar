import dayjs from 'dayjs';

const isOverdueDate = (date: Date, day: number) => dayjs().diff(dayjs(date), 'day') > day;

export default isOverdueDate;
