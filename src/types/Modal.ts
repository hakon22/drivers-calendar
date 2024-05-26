export type ModalShowType = 'none'
  | 'activation'
  | 'signup'
  | 'recovery'
  | 'makeSchedule'
  | 'inviteReplacement'
  | 'acceptInvite'
  | 'inviteNotification'
  | 'notifications';

export type ModalShowObjectType = {
  show: ModalShowType;
  modalSetState: (arg: unknown) => void;
};
