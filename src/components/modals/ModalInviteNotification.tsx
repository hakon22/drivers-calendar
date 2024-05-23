import { Modal, Result, Button } from 'antd';
import { useContext } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext, NavbarContext, SubmitContext } from '@/components/Context';

const ModalInviteNotification = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.inviteReplacement' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });
  const { t: tValidation } = useTranslation('translation', { keyPrefix: 'validation' });

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { closeNavbar } = useContext(NavbarContext);

  const { token } = useAppSelector((state) => state.user);
  const { users } = useAppSelector((state) => state.crew);

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={modalClose}
    >
      <Result
        status="info"
        title={t('title', { users })}
        subTitle={t('subTitle', { cars })}
        extra={(
          <div className="mt-5 d-flex justify-content-center">
            <Button className="col-10 button-height button" htmlType="submit">
              {t('start')}
            </Button>
          </div>
        )}
      />
    </Modal>
  );
};

export default ModalInviteNotification;
