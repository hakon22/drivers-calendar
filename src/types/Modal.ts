export type ModalShowType = 'none'
  | 'activation'
  | 'signup'
  | 'recovery'
  | 'makeSchedule'
  | 'inviteReplacement'
  | 'acceptInvite'
  | 'inviteNotification'
  | 'notifications'
  | 'carsControl'
  | 'carsEdit'
  | 'carsAdd'
  | 'swapShifts'
  | 'takeSickLeave'
  | 'takeVacation'
  | 'cancelSickLeave'
  | 'cancelVacation'
  | 'chat'
  | 'endWorkShift'
  | 'crewSettings'
  | 'userProfile'
  | 'shiftReport';

export type ModalShowObjectType = {
  show: ModalShowType;
  modalSetState?: (arg: unknown) => void;
  modalContext?: number | string;
};
