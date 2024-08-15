import { useAppSelector } from '@/utilities/hooks';
import { useState, useContext, CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import locale from '@/locales/pickers.locale.RU';
import cn from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { CellRenderInfo } from 'rc-picker/lib/interface';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { Calendar as CalendarAntd, Button } from 'antd';
import { SelectInfo } from 'antd/lib/calendar/generateCalendar';
import { ScheduleSchemaType } from '../../server/types/crew/ScheduleSchemaType';
import { ModalContext } from './Context';

export type CalendarProps = {
  dateValues?: { firstShift?: Dayjs, secondShift?: Dayjs },
  setDateValues?: React.Dispatch<React.SetStateAction<CalendarProps['dateValues']>>,
  mode?: 'calendar' | 'shift' | 'sickLeave' | 'vacation',
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
  if (!scheduleSchema?.[currentDay.format('DD-MM-YYYY')] && mode !== 'sickLeave') return true;
  if (mode === 'shift') {
    if (!firstShift) {
      return scheduleSchema?.[currentDay.format('DD-MM-YYYY')]?.id !== id;
    }
    if (firstShift && !secondShift) {
      if (currentDay.format('DD-MM-YYYY') !== selectedDay?.format('DD-MM-YYYY')) {
        return scheduleSchema?.[currentDay.format('DD-MM-YYYY')]?.id === id;
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
  const { t } = useTranslation('translation', { keyPrefix: 'modals.endWorkShift' });

  const {
    schedule_schema: scheduleSchema, users, shiftOrder, activeCar, completedShifts,
  } = useAppSelector((state) => state.crew);
  const { id, isRoundCalendarDays = true } = useAppSelector((state) => state.user);

  const { modalOpen } = useContext(ModalContext);

  const [selectedDate, setSelectedDate] = useState<Dayjs>();

  const today = dayjs().format('DD-MM-YYYY');
  const isMyShift = scheduleSchema?.[today]?.id === id;

  const endWorkShiftHandler = () => modalOpen('endWorkShift');

  const getListData = (value: Dayjs) => {
    if (scheduleSchema && scheduleSchema[value.format('DD-MM-YYYY')]) {
      return { user: scheduleSchema[value.format('DD-MM-YYYY')], content: value.date() };
    }
    return {
      user: { id: null, color: 'white' },
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

    let style: CSSProperties = {};

    if (isRoundCalendarDays) {
      const lastId = scheduleSchema?.[value?.subtract(1, 'day').format('DD-MM-YYYY')]?.id;
      const firstId = scheduleSchema?.[value?.add(1, 'day').format('DD-MM-YYYY')]?.id;
      style = lastId !== listData.user.id && firstId !== listData.user.id
        ? { borderRadius: '7px' }
        : {
          borderTopRightRadius: firstId !== listData.user.id ? '7px' : 'unset',
          borderBottomRightRadius: firstId !== listData.user.id ? '7px' : 'unset',
          borderTopLeftRadius: lastId !== listData.user.id ? '7px' : 'unset',
          borderBottomLeftRadius: lastId !== listData.user.id ? '7px' : 'unset',
        };
    }
    if (!value.isToday()) {
      style.color = 'black';
    }
    return (
      <button
        className={className}
        type="button"
        disabled={disabled}
        style={{
          ...style,
          backgroundColor: listData.user.color,
          height: '13.5vw',
          width: '13.5vw',
          maxWidth: '100%',
          maxHeight: '60px',
        }}
      >
        {listData.content}
      </button>
    );
  };

  const onSelect = (date: Dayjs, selectInfo: SelectInfo) => {
    if (selectInfo.source === 'date' && setDateValues) {
      if (!dateValues?.firstShift || (dateValues?.firstShift && mode === 'shift' && scheduleSchema?.[date.format('DD-MM-YYYY')]?.id === id)) {
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
    <>
      <CalendarAntd
        onSelect={onSelect}
        fullscreen={false}
        fullCellRender={dateFullCellRender}
        locale={locale}
      />
      {isMyShift && activeCar && mode === 'calendar' && !completedShifts.find(({ date }) => dayjs(date).isSame(dayjs(), 'day')) && (
      <Button className="end-work-shift-btn button-height button" style={{ marginTop: '-1.2em', marginBottom: '-0.1em' }} onClick={endWorkShiftHandler}>
        <DoubleRightOutlined className="fs-6 me-3" />
        {t('floatButton')}
        <DoubleLeftOutlined className="fs-6 ms-3" />
      </Button>
      )}
      <div className="user-legend w-100 gap-2">
        {shiftOrder?.map((orderId) => {
          const user = users.find((usr) => usr.id === orderId);
          if (user) {
            return <a href={`tel:+${user.phone}`} key={user.id} className="text-decoration-none py-1 px-2 text-center w-100" style={{ backgroundColor: user.color, color: '#f8f9fb', borderRadius: '7px' }}>{user.username}</a>;
          }
          return null;
        })}
      </div>
    </>
  );
};

Calendar.defaultProps = {
  dateValues: undefined,
  setDateValues: undefined,
  mode: 'calendar',
};

export default Calendar;
