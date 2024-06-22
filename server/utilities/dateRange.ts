import { type Dayjs } from 'dayjs';

const dateRange = (start: Dayjs, end: Dayjs) => {
  const range = [];
  let current = start;
  while (!current.isAfter(end)) {
    range.push(current);
    current = current.add(1, 'days');
  }
  return range;
};

export default dateRange;
