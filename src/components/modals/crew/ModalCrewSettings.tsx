import {
  Modal, Checkbox, Radio, Button,
} from 'antd';
import { useContext } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext, SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import axios from 'axios';
import routes from '@/routes';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { RadioChangeEvent } from 'antd/lib';
import toast from '@/utilities/toast';
import SeasonEnum from '../../../../server/types/crew/enum/SeasonEnum';

const url = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_DEV_HOST
  : process.env.NEXT_PUBLIC_PRODUCTION_HOST;

const ModalCrewSettings = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.crewSettings' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { setIsSubmit } = useContext(SubmitContext);
  const { modalClose } = useContext(ModalContext);

  const {
    id: crewId, ref, season = SeasonEnum.SUMMER, isRoundFuelConsumption = false,
  } = useAppSelector((state) => state.crew);

  const onChangeIsRound = async ({ target }: CheckboxChangeEvent) => {
    try {
      setIsSubmit(true);
      await axios.patch(routes.changeIsRoundFuel, { isRoundFuelConsumption: target.checked }, { params: { crewId } });
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  const onChangeFuelSeason = async ({ target }: RadioChangeEvent) => {
    try {
      setIsSubmit(true);
      await axios.patch(routes.changeFuelSeason, { season: target.value }, { params: { crewId } });
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
        <CopyToClipboard text={`${url}/schedule/${ref}`}>
          <Button type="dashed" className="mt-3" style={{ color: 'orange' }} onClick={() => toast(tToast('copyRefSuccess'), 'success')}>
            {t('copyRef')}
          </Button>
        </CopyToClipboard>
      </div>
    </Modal>
  );
};

export default ModalCrewSettings;
