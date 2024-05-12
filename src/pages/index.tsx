import { useEffect, useContext } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/navigation';
import cn from 'classnames';
import useErrorHandler from '@/utilities/useErrorHandler';
import { Calendar, type CalendarProps } from 'antd';
import { CellRenderInfo } from 'rc-picker/lib/interface';
import CalendarLocale from 'rc-picker/lib/locale/ru_RU';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import type { Error } from '@/types/InitialState';
import store from '@/slices';
import { AuthContext } from '@/components/Context';
import routes from '@/routes';
import type { User } from '@/types/User';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/ru';

const Index = () => {
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

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') return dateFullCellRender(current, info);
    return info.originNode;
  };

  useEffect(() => {
    if (!loggedIn) {
      router.push(routes.welcomePage);
    }
  }, [loggedIn]);

  return loggedIn && (
    <Calendar
      onPanelChange={onPanelChange}
      fullscreen={false}
      fullCellRender={dateFullCellRender}
      locale={{
        lang: {
          placeholder: 'Выберите дату',
          yearPlaceholder: 'Выберите год',
          quarterPlaceholder: 'Выберите квартал',
          monthPlaceholder: 'Выберите месяц',
          weekPlaceholder: 'Выберите неделю',
          rangePlaceholder: ['Начальная дата', 'Конечная дата'],
          rangeYearPlaceholder: ['Начальный год', 'Год окончания'],
          rangeMonthPlaceholder: ['Начальный месяц', 'Конечный месяц'],
          rangeWeekPlaceholder: ['Начальная неделя', 'Конечная неделя'],
          shortWeekDays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
          shortMonths: [
            'Янв',
            'Фев',
            'Мар',
            'Апр',
            'Май',
            'Июн',
            'Июл',
            'Авг',
            'Сен',
            'Окт',
            'Ноя',
            'Дек',
          ],
          ...CalendarLocale,
        },
      }}
    />
  );
};

export default Index;
