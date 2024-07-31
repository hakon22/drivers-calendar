import { Modal, Checkbox, Radio } from 'antd';
import { useContext } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext, SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import axios from 'axios';
import routes from '@/routes';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { RadioChangeEvent } from 'antd/lib';
import SeasonEnum from '../../../../server/types/crew/enum/SeasonEnum';

const ModalCrewSettings = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.crewSettings' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { setIsSubmit } = useContext(SubmitContext);
  const { modalClose } = useContext(ModalContext);

  const { season = SeasonEnum.SUMMER, isRoundFuelConsumption = false } = useAppSelector((state) => state.crew);

  const onChangeIsRound = async ({ target }: CheckboxChangeEvent) => {
    try {
      setIsSubmit(true);
      await axios.patch(routes.changeIsRoundFuel, { isRoundFuelConsumption: target.checked });
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  const onChangeFuelSeason = async ({ target }: RadioChangeEvent) => {
    try {
      setIsSubmit(true);
      await axios.patch(routes.changeFuelSeason, { season: target.value });
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={modalClose}
    >
      <div className="my-4 d-flex flex-column align-items-center gap-4">
        <div className="h1">{t('title')}</div>
        <Radio.Group value={season} onChange={onChangeFuelSeason} size="middle" className="border-button">
          <Radio.Button className="border-button" value={SeasonEnum.SUMMER}>{t('summer')}</Radio.Button>
          <Radio.Button className="border-button" value={SeasonEnum.WINTER}>{t('winter')}</Radio.Button>
        </Radio.Group>
        <Checkbox checked={isRoundFuelConsumption} onChange={onChangeIsRound}>{t('roundFuel')}</Checkbox>
      </div>
    </Modal>
  );
};

export default ModalCrewSettings;
