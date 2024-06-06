import { Modal, Result } from 'antd';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ModalContext } from '@/components/Context';
import { LoginButton } from '@/pages/welcome';
import routes from '@/routes';

const ModalRecovery = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.recovery' });
  const router = useRouter();
  const { modalClose } = useContext(ModalContext);

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={() => {
        modalClose();
        router.push(routes.loginPage);
      }}
    >
      <Result
        status="success"
        title={t('title')}
        subTitle={t('subTitle')}
        extra={(
          <div className="col-9 d-flex mx-auto">
            <LoginButton title={t('loginButton')} className="button button-height w-100" onClick={modalClose} />
          </div>
        )}
      />
    </Modal>
  );
};

export default ModalRecovery;
