import { Modal, Button, Table } from 'antd';
import { useContext } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ApiContext, ModalContext, SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import routes from '@/routes';
import axios from 'axios';
import { PencilFill, XLg } from 'react-bootstrap-icons';
import { ColumnsType } from 'antd/es/table';

type DataType = {
  key: number;
  model: string;
  call: string;
  inventory: string;
};

const ModalCarsControl = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.carsControl' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { modalClose, modalOpen } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { activeCarUpdate } = useContext(ApiContext);

  const { token, crewId } = useAppSelector((state) => state.user);
  const { cars, activeCar } = useAppSelector((state) => state.crew);

  const activeCarUpdateHandler = async (id: number) => {
    try {
      setIsSubmit(true);
      const { data } = await axios.post(routes.activeCarsUpdate, { activeCar: id }, {
        headers: { Authorization: `Bearer ${token}` },
      }) as { data: { code: number } };
      if (data.code === 1) {
        activeCarUpdate({ ...data, crewId });
      }
      setIsSubmit(false);
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
          title={t('profile.addressForm.changing')}
          className="non-select d-flex align-items-center text-warning"
          role="button"
          onClick={() => modalOpen('carsEdit', undefined, record.key)}
        />
      ),
    },
    {
      dataIndex: 'remove',
      className: 'non-select',
      render: (text, record, index) => (
        <XLg
          title={t('profile.addressForm.removing')}
          className="non-select d-flex align-items-center text-danger"
          role="button"
          onClick={async () => {
            setIsSubmit(true);
            // await dispatch(fetchRemoveAddress({ token, index }));
            setIsSubmit(false);
          }}
        />
      ),
    },
  ];

  return (
    <Modal
      centered
      open
      footer={null}
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
              if (!classList.contains('non-select') && tagName !== 'path' && (activeCar !== key)) {
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
        <Button className="col-10 mx-auto button-height button" onClick={() => {}}>
          {t('add')}
        </Button>
      </div>
    </Modal>
  );
};

export default ModalCarsControl;
