import { useTranslation } from 'react-i18next';
import { useEffect, useContext } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/navigation';
import cn from 'classnames';
import { Calendar, type CalendarProps } from 'antd';
import { CellRenderInfo } from 'rc-picker/lib/interface';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { AuthContext } from '@/components/Context';
import locale from '@/locales/pickers.locale.RU';
import routes from '@/routes';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import Helmet from '@/components/Helmet';

const Index = ({ appData }: { appData: string }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'index' });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loggedIn } = useContext(AuthContext);
  const { loadingStatus } = useAppSelector((state) => state.user);

  const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };

  const generateSchedule = (startDate: dayjs.Dayjs, numDays: number) => {
    const schedule: { [key: string]: string } = {};
    const people = ['green', 'orange'];

    const predicate = (i: number) => {
      let result;
      switch (people.length) {
        case 2:
          result = i % 4 < 2 ? 0 : 1; // 2/2
          break;
        case 3:
          result = i % 3; // 1/2
          break;
        case 4:
          result = i % 4; // 1/3
          break;
        default:
          result = 0;
          break;
      }
      return result;
    };

    let currDay = startDate;

    for (let i = 0; i < numDays; i += 1) {
      const personIndex = predicate(i);
      schedule[currDay.format('DD-MM-YYYY')] = people[personIndex];
      currDay = currDay.add(1, 'day');
    }

    return schedule;
  };

  const startDate = dayjs('2024-05-15');
  const numDays = 500;

  const schedule = generateSchedule(startDate, numDays);

  const getListData = (value: Dayjs, info: CellRenderInfo<Dayjs>) => {
    if (schedule[value.format('DD-MM-YYYY')]) {
      return { color: schedule[value.format('DD-MM-YYYY')], content: value.date() };
    }
    return { color: 'white', content: value.date() };
  };

  const dateFullCellRender = (value: Dayjs, info: CellRenderInfo<Dayjs>) => {
    if (!(info.type === 'date')) return info.originNode;
    const listData = getListData(value, info);
    const className = cn('d-flex justify-content-center align-items-center', { 'text-danger': value.format('DD-MM-YYYY') === info.today.format('DD-MM-YYYY') });
    return (
      <div className={className} style={{ backgroundColor: listData.color, height: '3.6em', width: '3.6em' }}>
        {listData.content}
      </div>
    );
  };

  useEffect(() => {
    if (!loggedIn) {
      router.push(routes.welcomePage);
    }
  }, [loggedIn]);

  return loggedIn && (
    <div className="d-flex justify-content-center anim-show">
      <Helmet title={t('title')} description={t('description')} />
      <div className="my-4 col-12 d-flex flex-column align-items-center gap-3">
        <h1>{t('title')}</h1>
        <Calendar
          onPanelChange={onPanelChange}
          fullscreen={false}
          fullCellRender={dateFullCellRender}
          locale={locale}
        />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const data = {};

  return { props: { appData: data } };
};

export default Index;
