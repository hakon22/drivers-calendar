import {
  Modal, Button, Table, Popconfirm,
} from 'antd';
import { useContext, useState } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext, SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import routes from '@/routes';
import axios from 'axios';
import { PencilFill, XLg } from 'react-bootstrap-icons';
import { ColumnsType } from 'antd/es/table';
import toast from '@/utilities/toast';
import CarAdd from '@/components/forms/CarAdd';

type DataType = {
  key: number;
  model: string;
  call: string;
  inventory: string;
};

const ModalCarsControl = ({ modalContext }: { modalContext?: string }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.carsControl' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { modalClose, modalOpen } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);

  const { token, crewId } = useAppSelector((state) => state.user);
  const { cars, activeCar } = useAppSelector((state) => state.crew);

  const [add, setAdd] = useState(false);

  const activeCarUpdateHandler = async (id: number) => {
    try {
      setIsSubmit(true);
      const { data } = await axios.post(routes.activeCarsUpdate, { activeCar: id }, {
        headers: { Authorization: `Bearer ${token}` },
      }) as { data: { code: number } };
      if (data.code === 1) {
      } else if (data.code === 2) {
        toast(tToast('carNotOnTheCrew'), 'error');
      } else if (data.code === 3) {
        toast(tToast('carIsActiveAnotherCrew'), 'error');
      }
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  const handleOk = async (id: number) => {
    try {
      const { data } = await axios.delete(`${routes.removeCar}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }) as { data: { code: number } };
      if (data.code === 1) {
        toast(tToast('carRemoveSuccess'), 'success');
      } else if (data.code === 2) {
        toast(tToast('carNotExistInCrew'), 'error');
      } else if (data.code === 3) {
        toast(tToast('carIsActive'), 'error');
      }
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      dataIndex: 'select',
      className: 'cursor-pointer',
    },
    {
      title: t('model'),
      dataIndex: 'model',
      align: 'center',
      className: 'cursor-pointer',
    },
    {
      title: t('call'),
      dataIndex: 'call',
      align: 'center',
      className: 'cursor-pointer',
    },
    {
      title: t('inventory'),
      dataIndex: 'inventory',
      align: 'center',
      className: 'cursor-pointer',
    },
    {
      dataIndex: 'update',
      className: 'non-select',
      render: (text, record) => (
        <PencilFill
          title={t('edit')}
          className="non-select d-flex align-items-center text-warning"
          role="button"
          onClick={() => modalOpen('carsEdit', undefined, record.key)}
        />
      ),
    },
    {
      dataIndex: 'remove',
      className: 'non-select',
      render: (text, record) => (
        <Popconfirm
          title={t('popconfirm.title')}
          description={t('popconfirm.description')}
          placement="topLeft"
          onConfirm={async () => handleOk(record.key)}
          okButtonProps={{ danger: true }}
          okText={t('popconfirm.ok')}
          cancelText={t('popconfirm.cancel')}
        >
          <XLg
            title={t('remove')}
            className="non-select d-flex align-items-center text-danger"
            role="button"
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      centered
      open
      footer={null}
      transitionName={modalContext}
      styles={{
        content: {
          paddingLeft: '0.5em', paddingRight: '0.5em', maxHeight: '90vh', overflow: 'auto',
        },
      }}
      onCancel={modalClose}
    >
      <div className="col-12 my-4 d-flex flex-column align-items-center gap-3">
        <div className="h1">{t('title')}</div>
        <Table
          className={cars?.length ? 'mb-3 w-100' : 'w-100'}
          size="small"
          rowSelection={{
            type: 'radio',
            selectedRowKeys: activeCar ? [activeCar] : undefined,
            onChange: async ([index]) => {
              if (activeCar !== index) {
                await activeCarUpdateHandler(index as number);
              }
            },
          }}
          onRow={({ key }) => ({
            onClick: async ({ target }) => {
              const { classList, tagName } = target as HTMLElement;
              if (!classList.contains('non-select') && tagName === 'TD' && (activeCar !== key)) {
                await activeCarUpdateHandler(key);
              }
            },
          })}
          locale={{
            emptyText: t('emptyText'),
          }}
          pagination={false}
          columns={columns}
          dataSource={cars?.map(({
            id, brand, model, call, inventory,
          }) => ({
            key: id, model: `${brand} ${model}`, call, inventory,
          }))}
        />
        {add ? <CarAdd /> : (
          <Button className="col-10 mx-auto button-height button" onClick={() => setAdd(true)}>
            {t('add')}
          </Button>
        )}
      </div>
    </Modal>
  );
};

ModalCarsControl.defaultProps = {
  modalContext: undefined,
};

export default ModalCarsControl;
