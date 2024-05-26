import { useContext } from 'react';
import { ModalContext } from '@/components/Context';
import type { ModalShowType } from '@/types/Modal';
import ModalSignup from './modals/ModalSignup';
import ModalRecovery from './modals/ModalRecovery';
import ModalMakeSchedule from './modals/ModalMakeSchedule';
import ModalInviteReplacement from './modals/ModalInviteReplacement';
import ModalAcceptInvite from './modals/ModalAcceptInvite';
import ModalInviteNotification from './modals/ModalInviteNotification';
import ModalConfirmPhone from './modals/ModalConfirmPhone';
import ModalNotifications from './modals/ModalNotifications';

const Modals = () => {
  const { show } = useContext(ModalContext);
  const setState = typeof show === 'object' ? show.modalSetState : undefined;

  const modals: { [K in ModalShowType]: JSX.Element | null } = {
    none: null,
    signup: <ModalSignup />,
    recovery: <ModalRecovery />,
    makeSchedule: <ModalMakeSchedule />,
    inviteReplacement: <ModalInviteReplacement />,
    acceptInvite: <ModalAcceptInvite />,
    inviteNotification: <ModalInviteNotification />,
    notifications: <ModalNotifications />,
    activation: setState ? <ModalConfirmPhone setState={setState} /> : null,
  };

  return typeof show === 'object' ? modals[show.show] : modals[show];
};

export default Modals;
