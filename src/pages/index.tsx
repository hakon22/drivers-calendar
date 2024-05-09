import { useEffect, useContext } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/navigation';
import useErrorHandler from '@/utilities/useErrorHandler';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import type { Error } from '@/types/InitialState';
import store from '@/slices';
import { AuthContext } from '@/components/Context';
import routes from '@/routes';
import type { User } from '@/types/User';

const Index = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loggedIn } = useContext(AuthContext);
  const { loadingStatus } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!loggedIn) {
      router.push(routes.welcomePage);
    }
  }, [loggedIn]);

  return loggedIn && (
    <div>
      hi
    </div>
  );
};

export default Index;
