import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import locale from '@/locales/pickers.locale.RU';
import cn from 'classnames';
import type { Dayjs } from 'dayjs';
import { CellRenderInfo } from 'rc-picker/lib/interface';
import { Calendar as CalendarAntd } from 'antd';
import { SelectInfo } from 'antd/lib/calendar/generateCalendar';

export type CalendarProps = {
  dateValues?: { firstShift?: Dayjs, secondShift?: Dayjs },
  setDateValues?: React.Dispatch<React.SetStateAction<CalendarProps['dateValues']>>,
};

const Calendar = ({ dateValues, setDateValues }: CalendarProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'index' });
  const { schedule_schema: scheduleSchema } = useAppSelector((state) => state.crew);
  const { id } = useAppSelector((state) => state.user);

  const getListData = (value: Dayjs) => {
    if (scheduleSchema && scheduleSchema[value.format('DD-MM-YYYY')]) {
      return { user: scheduleSchema[value.format('DD-MM-YYYY')], content: value.date() };
    }
    return {
      user: {
        id: null, color: 'white', username: null, phone: null,
      },
      content: value.date(),
    };
  };

  const dateFullCellRender = (value: Dayjs, info: CellRenderInfo<Dayjs>) => {
    if (info.type !== 'date') return info.originNode;
    const listData = getListData(value);
    const className = cn('d-flex justify-content-center align-items-center', {
      disabled: !setDateValues || !dateValues?.firstShift,
    });
    return (
      <div
        className={className}
        style={{
          backgroundColor: listData.user.color, height: '3.6em', width: '3.6em',
        }}
      >
        {listData.content}
      </div>
    );
  };

  const onSelect = (date: Dayjs, selectInfo: SelectInfo) => {
    if (selectInfo.source === 'date' && setDateValues) {
      if (!scheduleSchema[date.format('DD-MM-YYYY')]) {
        return;
      }
      if (scheduleSchema[date.format('DD-MM-YYYY')].id !== id && !dateValues?.firstShift) {
        return;
      }
      if (scheduleSchema[date.format('DD-MM-YYYY')].id === id && dateValues?.firstShift) {
        return;
      }
      if (!dateValues?.firstShift) {
        setDateValues({ firstShift: date });
      } else if (dateValues.firstShift && !dateValues.secondShift) {
        setDateValues((state) => ({ ...state, secondShift: date }));
      }
    }
  };

  return (
    <CalendarAntd
      onSelect={onSelect}
      fullscreen={false}
      fullCellRender={dateFullCellRender}
      locale={locale}
    />
  );
};

Calendar.defaultProps = {
  dateValues: undefined,
  setDateValues: undefined,
};

export default Calendar;
