const fetchImage = async (img: string, setState?: React.Dispatch<React.SetStateAction<string>>) => {
  if (process.env.NODE_ENV === 'development') {
    const response = await import(`../images/market/${img}`);
    return setState ? setState(response.default.src) : response.default.src;
  }
  return setState ? setState(`/_next/static/media/${img}`) : `/_next/static/media/${img}`;
};

export const fetchingItemsImage = async <T extends { image: string }> (items: T[]) => {
  const values = Object.values<T>(items)
    .map(async (item) => ({ ...item, image: await fetchImage(item.image) }));
  const fetchedItems = await Promise.all(values);
  return fetchedItems;
};

export default fetchImage;
