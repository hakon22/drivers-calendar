import { Modal } from 'antd';
import { useContext } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext } from '@/components/Context';
import CarUpdate from '@/components/forms/CarUpdate';
import { CarModel } from '../../../../server/db/tables/Cars';

const ModalCarsEdit = ({ modalContext }: { modalContext: number }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.carsEdit' });
  const { modalOpen } = useContext(ModalContext);

  const { cars } = useAppSelector((state) => state.crew);
  const {
    fuel_consumption_summer_city: fuelConsumptionSummerCity,
    fuel_consumption_summer_highway: fuelConsumptionSummerHighway,
    fuel_consumption_winter_city: fuelConsumptionWinterCity,
    fuel_consumption_winter_highway: fuelConsumptionWinterHighway,
    ...rest
  } = cars.find(({ id }) => id === modalContext) as CarModel;

  const preparedCar = {
    ...rest,
    fuel_consumption_summer: { city: fuelConsumptionSummerCity, highway: fuelConsumptionSummerHighway },
    fuel_consumption_winter: { city: fuelConsumptionWinterCity, highway: fuelConsumptionWinterHighway },
  };

  return preparedCar && (
    <Modal
      centered
      open
      footer={null}
      styles={{
        content: {
          paddingLeft: '0.5em', paddingRight: '0.5em', maxHeight: '90vh', overflow: 'auto',
        },
      }}
      onCancel={() => modalOpen('carsControl')}
    >
      <div className="col-12 my-4 d-flex flex-column align-items-center gap-3">
        <div className="h1">{t('title', { car: `${preparedCar?.brand} ${preparedCar?.model}` })}</div>
        <CarUpdate car={preparedCar} />
      </div>
    </Modal>
  );
};

export default ModalCarsEdit;
