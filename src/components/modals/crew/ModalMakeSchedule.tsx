import { Modal, Button, DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { useContext, useState, useRef } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import locale from '@/locales/pickers.locale.RU';
import { ModalContext, NavbarContext, SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import routes from '@/routes';
import axios from 'axios';
import SortableItem from '../../SortableItem';
import { UserModel } from '../../../../server/db/tables/Users';

const ModalMakeSchedule = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.makeSchedule' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { closeNavbar } = useContext(NavbarContext);

  const { token } = useAppSelector((state) => state.user);
  const { users, shiftOrder } = useAppSelector((state) => state.crew);

  const [sortableUsers, setSortableUsers] = useState(shiftOrder.length ? shiftOrder.map((orderId) => users.find((usr) => usr.id === orderId) as UserModel) : users);
  const [activeId, setActiveId] = useState(0);
  const [page, setPage] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over?.id && active.id !== over.id) {
      setSortableUsers((items) => {
        const oldIndex = items.indexOf(items.find((item) => item.id === active.id) as UserModel);
        const newIndex = items.indexOf(items.find((item) => item.id === over.id) as UserModel);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(+active.id);
  };

  const onFinish: DatePickerProps<Dayjs[]>['onChange'] = async (date, startDate) => {
    try {
      if (!Array.isArray(startDate)) {
        setIsSubmit(true);
        const { data } = await axios.post(routes.makeSchedule, { startDate, users: sortableUsers }, {
          headers: { Authorization: `Bearer ${token}` },
        }) as { data: { code: number } };
        if (data.code === 1) {
          modalClose();
          closeNavbar();
        }
        setIsSubmit(false);
      }
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={modalClose}
    >
      <div className="my-4 d-flex flex-column align-items-center gap-3">
        {!page ? (
          <>
            <div className="h1">{t('selectQueue')}</div>
            <DndContext
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
              <SortableContext items={sortableUsers} strategy={verticalListSortingStrategy}>
                <ul className="d-flex flex-column gap-2 ps-0 col-12">
                  {sortableUsers.map((user, index) => <SortableItem user={user} key={user.id} index={index + 1} activeId={activeId} />)}
                </ul>
              </SortableContext>
            </DndContext>
            <Button className="col-4 mx-auto mt-3 button" onClick={() => setPage(1)}>
              {t('next')}
            </Button>
          </>
        ) : (
          <>
            <div className="h1" ref={ref}>{t('selectDate')}</div>
            <DatePicker
              onChange={onFinish}
              needConfirm
              open
              locale={locale}
              getPopupContainer={(defaultContainer) => {
                defaultContainer.classList.add('d-none');
                return ref?.current ? ref.current : defaultContainer;
              }}
            />
            <Button className="col-4 mx-auto mt-3 button" onClick={() => setPage(0)}>
              {t('back')}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ModalMakeSchedule;
