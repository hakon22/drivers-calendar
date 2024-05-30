import dayjs from 'dayjs';

const checkDateDiff = (date: Date, day: number) => dayjs().diff(dayjs(date), 'day') > day;

export default checkDateDiff;
