export type ModalShowType = 'none'
  | 'activation'
  | 'signup'
  | 'recovery'
  | 'makeSchedule'
  | 'inviteReplacement'
  | 'acceptInvite'
  | 'inviteNotification';

export type ModalShowObjectType = {
  show: ModalShowType;
  modalSetState: (arg: unknown) => void;
};
