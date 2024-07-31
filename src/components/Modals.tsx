import { useContext } from 'react';
import { ModalContext } from '@/components/Context';
import type { ModalShowType } from '@/types/Modal';
import ModalSignup from './modals/user/ModalSignup';
import ModalRecovery from './modals/user/ModalRecovery';
import ModalMakeSchedule from './modals/crew/ModalMakeSchedule';
import ModalCrewChat from './modals/crew/ModalCrewChat';
import ModalInviteReplacement from './modals/user/ModalInviteReplacement';
import ModalAcceptInvite from './modals/user/ModalAcceptInvite';
import ModalInviteNotifications from './modals/notification/ModalInviteNotifications';
import ModalConfirmPhone from './modals/user/ModalConfirmPhone';
import ModalNotifications from './modals/notification/ModalNotifications';
import ModalCarsControl from './modals/car/ModalCarsControl';
import ModalCarsEdit from './modals/car/ModalCarsEdit';
import ModalCarsAdd from './modals/car/ModalCarsAdd';
import ModalSwapShifts from './modals/crew/ModalSwapShifts';
import ModalTakeSickLeaveOrVacation from './modals/user/ModalTakeSickLeaveOrVacation';
import ModalCancelSickLeaveOrVacation from './modals/user/ModalCancelSickLeaveOrVacation';
import ModalEndWorkShift from './modals/user/ModalEndWorkShift';
import ModalCrewSettings from './modals/crew/ModalCrewSettings';
import ModalUserProfile from './modals/user/ModalUserProfile';
import ModalShiftReport from './modals/crew/ModalShiftReport';
import ModalKickReplacement from './modals/crew/ModalKickReplacement';

const Modals = () => {
  const { show } = useContext(ModalContext);

  const getParams = () => {
    if (typeof show === 'object') {
      if (show?.modalSetState) {
        return show.modalSetState;
      }
      if (show?.modalContext) {
        return show.modalContext;
      }
    }
    return undefined;
  };

  const params = getParams();

  const modals: { [K in ModalShowType]: JSX.Element | null } = {
    none: null,
    signup: <ModalSignup />,
    recovery: <ModalRecovery />,
    makeSchedule: <ModalMakeSchedule />,
    inviteReplacement: <ModalInviteReplacement />,
    acceptInvite: <ModalAcceptInvite />,
    inviteNotification: <ModalInviteNotifications />,
    notifications: <ModalNotifications />,
    carsAdd: <ModalCarsAdd />,
    swapShifts: <ModalSwapShifts />,
    chat: <ModalCrewChat />,
    takeSickLeave: <ModalTakeSickLeaveOrVacation type="takeSickLeave" />,
    takeVacation: <ModalTakeSickLeaveOrVacation type="takeVacation" />,
    cancelSickLeave: <ModalCancelSickLeaveOrVacation type="cancelSickLeave" />,
    cancelVacation: <ModalCancelSickLeaveOrVacation type="cancelVacation" />,
    endWorkShift: <ModalEndWorkShift />,
    crewSettings: <ModalCrewSettings />,
    userProfile: <ModalUserProfile />,
    shiftReport: <ModalShiftReport />,
    kickReplacement: <ModalKickReplacement />,
    carsControl: params && typeof params === 'string' ? <ModalCarsControl modalContext={params} /> : <ModalCarsControl />,
    carsEdit: params && typeof params === 'number' ? <ModalCarsEdit modalContext={params} /> : null,
    activation: params && typeof params !== 'number' && typeof params !== 'string' ? <ModalConfirmPhone setState={params} /> : null,
  };

  return typeof show === 'object' ? modals[show.show] : modals[show];
};

export default Modals;
