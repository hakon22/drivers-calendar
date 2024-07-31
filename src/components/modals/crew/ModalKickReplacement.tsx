import {
  Modal, Button, Radio, Form,
  Space,
  Popconfirm,
} from 'antd';
import { useContext } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext, NavbarContext, SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import axios from 'axios';
import routes from '@/routes';
import toast from '@/utilities/toast';

const ModalKickReplacement = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.kickReplacement' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { setIsSubmit } = useContext(SubmitContext);
  const { modalClose } = useContext(ModalContext);
  const { closeNavbar } = useContext(NavbarContext);

  const { id: userId } = useAppSelector((state) => state.user);
  const { users } = useAppSelector((state) => state.crew);

  const [form] = Form.useForm();
  const selectedId = Form.useWatch('id', form);

  const onFinish = async ({ id }: { id: number}) => {
    try {
      if (!id) return;
      setIsSubmit(true);
      const { data } = await axios.get(`${routes.kickReplacement}/${id}`) as { data: { code: number } };
      if (data.code === 1) {
        toast(tToast('kickReplacementSuccess'), 'success');
        modalClose();
        closeNavbar();
      }
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
        <Form name="kick-user" form={form} className="d-flex flex-column justify-content-center align-items-center col-10" onFinish={onFinish}>
          <Form.Item name="id" className="border-button w-100">
            <Radio.Group size="large" className="w-100">
              <Space direction="vertical" className="w-100 gap-3">
                {users.filter((user) => user.id !== userId)
                  .map((user) => <Radio.Button key={user.id} className="border-button text-center w-100" value={user.id}>{user.username}</Radio.Button>)}
              </Space>
            </Radio.Group>
          </Form.Item>
          <div className="d-flex flex-column justify-content-center align-items-center w-100">
            <p className="text-muted text-center">{t('textP1')}</p>
            <p className="text-muted text-center mb-4">{t('textP2')}</p>
            <Popconfirm
              title={t('popconfirm.title')}
              description={t('popconfirm.description', { username: users.find((user) => user.id === selectedId)?.username })}
              placement="top"
              onConfirm={form.submit}
              okButtonProps={{ danger: true }}
              okText={t('popconfirm.ok')}
              cancelText={t('popconfirm.cancel')}
            >
              <Button className="col-10 w-100 button-height button">
                {t('submitButton')}
              </Button>
            </Popconfirm>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalKickReplacement;
