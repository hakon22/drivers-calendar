import { useTranslation } from 'react-i18next';
import { useEffect, useContext } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/navigation';
import cn from 'classnames';
import { Calendar, type CalendarProps } from 'antd';
import { CellRenderInfo } from 'rc-picker/lib/interface';
import { fetchCrew } from '@/slices/crewSlice';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { AuthContext } from '@/components/Context';
import locale from '@/locales/pickers.locale.RU';
import routes from '@/routes';
import FloatButtons from '@/components/FloatButtons';
import type { Dayjs } from 'dayjs';
import Helmet from '@/components/Helmet';
import NavBar from '@/components/NavBar';
import axios from 'axios';
import { fetchNotifications } from '@/slices/notificationSlice';
import { ScheduleSchemaType } from '../../server/types/crew/ScheduleSchemaType';

const Index = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'index' });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loggedIn } = useContext(AuthContext);
  const { token, crewId } = useAppSelector((state) => state.user);
  const { loadingStatus, schedule_schema: scheduleSchema } = useAppSelector((state) => state.crew);

  const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };

  const getListData = (value: Dayjs, info: CellRenderInfo<Dayjs>) => {
    if (scheduleSchema && scheduleSchema[value.format('DD-MM-YYYY')]) {
      return { user: scheduleSchema[value.format('DD-MM-YYYY')], content: value.date() };
    }
    return { user: { color: 'white', name: null }, content: value.date() };
  };

  const dateFullCellRender = (value: Dayjs, info: CellRenderInfo<Dayjs>) => {
    if (info.type !== 'date') return info.originNode;
    const listData = getListData(value, info);
    const className = cn('d-flex justify-content-center align-items-center', { 'text-danger fw-bold': value.format('DD-MM-YYYY') === info.today.format('DD-MM-YYYY') });
    return (
      <div className={className} style={{ backgroundColor: listData.user.color, height: '3.6em', width: '3.6em' }}>
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
      <NavBar />
      <div className="my-4 col-12 d-flex flex-column align-items-center gap-3">
        <h1>{t('title')}</h1>
        <Calendar
          onPanelChange={onPanelChange}
          fullscreen={false}
          fullCellRender={dateFullCellRender}
          locale={locale}
        />
      </div>
      <FloatButtons />
    </div>
  );
};

export default Index;
