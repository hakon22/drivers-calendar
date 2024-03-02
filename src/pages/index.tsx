import { useEffect, useContext } from 'react';
import { Spinner } from 'react-bootstrap';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/navigation';
import useErrorHandler from '@/utilities/useErrorHandler';
import { fetchItems, itemsAdd, selectors } from '@/slices/itemsSlice';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import type { Item } from '@/types/Item';
import type { Error } from '@/types/InitialState';
import store from '@/slices';
import { fetchingItemsImage } from '@/utilities/fetchImage';
import { AuthContext } from '@/components/Context';
import routes from '@/routes';

type ItemsProps = {
  fetchedItems: Item[];
  error: Error;
};

const Index = ({ fetchedItems, error }: ItemsProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loggedIn } = useContext(AuthContext);
  const items = useAppSelector(selectors.selectAll);

  useEffect(() => {
    if (!loggedIn) {
      router.push(routes.welcomePage);
    }
  }, [loggedIn]);

  useErrorHandler(error);

  return loggedIn && (
    <div>
      hi
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { q } = query;
  await store.dispatch(fetchItems());
  const { error, entities: items } = store.getState().items;
  const fetchedItems = Object.values(items);
  // const fetchedItems = await fetchingItemsImage<Item>(items);

  return { props: { fetchedItems, error } };
};

export default Index;
