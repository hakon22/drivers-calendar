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
  | 'carsEdit';

export type ModalShowObjectType = {
  show: ModalShowType;
  modalSetState?: (arg: unknown) => void;
  modalContext?: number | string;
};
