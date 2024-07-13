interface PaginationInterface<T> {
  rows: T[];
  limit: number;
  offset: number;
  count: number;
  current: number;
  total: number;
}

export default PaginationInterface;
