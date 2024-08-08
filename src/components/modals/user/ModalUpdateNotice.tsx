/* eslint-disable react/no-unstable-nested-components */
import {
  Modal, Button, Result, Collapse,
} from 'antd';
import { useContext, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { CaretRightOutlined } from '@ant-design/icons';
import { SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import { useAppDispatch } from '@/utilities/hooks';
import { readUpdates } from '@/slices/userSlice';
import { UpdateNoticeModel } from '../../../../server/db/tables/UpdateNotice';

const ModalUpdateNotice = ({ updatesNotice }: { updatesNotice: UpdateNoticeModel[] }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.updatesNotice' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const dispatch = useAppDispatch();

  const { setIsSubmit } = useContext(SubmitContext);

  const [isClose, setIsClose] = useState(false);

  const onRead = async (id: number) => {
    try {
      setIsSubmit(true);
      await dispatch(readUpdates(id));
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  return (
    <Modal
      centered
      open={!isClose}
      footer={null}
      styles={{
        content: {
          paddingLeft: '0.25em', paddingRight: '0.25em', maxHeight: '90vh', overflow: 'auto',
        },
      }}
      onCancel={() => {
        setIsClose(true);
      }}
    >
      <Result
        status="success"
        title={t('title')}
        className="p-2 mt-result-extra-0"
        extra={(
          <div className="d-flex flex-column gap-2">
            {updatesNotice.map(({
              id: key, title: label, createdAt, message,
            }) => (
              <Collapse
                key={key}
                bordered={false}
                accordion
                defaultActiveKey={updatesNotice[0].id}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                items={[{
                  key,
                  label: (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fs-6 fw-bold">{label}</span>
                      <span className="text-muted">{dayjs(createdAt).format('DD.MM.YYYY')}</span>
                    </div>
                  ),
                  headerClass: 'd-flex align-items-center',
                  children: (
                    <div className="d-flex flex-column gap-4">
                      <div className="text-start" style={{ lineHeight: 1.8 }}>{message}</div>
                      <div className="mt-4 d-flex justify-content-center col-10 mx-auto">
                        <Button className="button-height button w-100" onClick={() => onRead(key)}>{t('readButton')}</Button>
                      </div>
                    </div>
                  ),
                }]}
              />
            ))}
          </div>
        )}
      />
    </Modal>
  );
};

export default ModalUpdateNotice;
