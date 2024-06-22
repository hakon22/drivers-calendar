import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import locale from '@/locales/pickers.locale.RU';
import cn from 'classnames';
import type { Dayjs } from 'dayjs';
import { CellRenderInfo } from 'rc-picker/lib/interface';
import { Calendar as CalendarAntd } from 'antd';
import { SelectInfo } from 'antd/lib/calendar/generateCalendar';
import { ScheduleSchemaType } from '../../server/types/crew/ScheduleSchemaType';

export type CalendarProps = {
  dateValues?: { firstShift?: Dayjs, secondShift?: Dayjs },
  setDateValues?: React.Dispatch<React.SetStateAction<CalendarProps['dateValues']>>,
  mode: 'calendar' | 'shift' | 'sickLeave' | 'vacation',
};

type IsDisabledType = (
  mode: CalendarProps['mode'],
  id: number,
  scheduleSchema: ScheduleSchemaType,
  currentDay: Dayjs,
  selectedDay?: Dayjs,
  firstShift?: Dayjs,
  secondShift?: Dayjs,
) => boolean;

const isDisabled: IsDisabledType = (mode, id, scheduleSchema, currentDay, selectedDay, firstShift, secondShift) => {
  if (!scheduleSchema[currentDay.format('DD-MM-YYYY')]) return true;
  if (mode === 'shift') {
    if (!firstShift) {
      return scheduleSchema[currentDay.format('DD-MM-YYYY')].id !== id;
    }
    if (firstShift && !secondShift) {
      if (currentDay.format('DD-MM-YYYY') !== selectedDay?.format('DD-MM-YYYY')) {
        return scheduleSchema[currentDay.format('DD-MM-YYYY')].id === id;
      }
    }
  }
  if (mode === 'sickLeave') {
    if (firstShift && !secondShift) {
      return currentDay.isBefore(firstShift);
    }
  }
  return false;
};

const Calendar = ({ dateValues, setDateValues, mode = 'calendar' }: CalendarProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'index' });
  const { schedule_schema: scheduleSchema } = useAppSelector((state) => state.crew);
  const { id } = useAppSelector((state) => state.user);

  const [selectedDate, setSelectedDate] = useState<Dayjs>();

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
    const disabled = isDisabled(mode, id as number, scheduleSchema, value, selectedDate, dateValues?.firstShift, dateValues?.secondShift);
    const listData = getListData(value);
    const className = cn('d-flex justify-content-center align-items-center border-0', {
      disabled,
      selected: value.isSame(selectedDate),
    });
    return (
      <button
        className={className}
        type="button"
        disabled={disabled}
        style={{
          backgroundColor: listData.user.color, height: '3.6em', width: '3.6em',
        }}
      >
        {listData.content}
      </button>
    );
  };

  const onSelect = (date: Dayjs, selectInfo: SelectInfo) => {
    if (selectInfo.source === 'date' && setDateValues) {
      if (!dateValues?.firstShift || (dateValues?.firstShift && mode === 'shift' && scheduleSchema[date.format('DD-MM-YYYY')].id === id)) {
        if (date.isSame(selectedDate)) {
          setDateValues({});
          setSelectedDate(undefined);
        } else {
          setSelectedDate(date);
          setDateValues({ firstShift: date });
        }
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
