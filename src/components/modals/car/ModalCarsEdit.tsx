import { Modal } from 'antd';
import { useContext } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext } from '@/components/Context';
import CarUpdate from '@/components/forms/CarUpdate';

const ModalCarsEdit = ({ modalContext }: { modalContext: number }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.carsEdit' });
  const { modalClose } = useContext(ModalContext);

  const { cars } = useAppSelector((state) => state.crew);
  const car = cars.find(({ id }) => id === modalContext);

  return car && (
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
        <div className="h1">{t('title', { car: `${car?.brand} ${car?.model}` })}</div>
        <CarUpdate car={car} />
      </div>
    </Modal>
  );
};

export default ModalCarsEdit;
