export type ModalShowType = 'none'
  | 'activation'
  | 'signup'
  | 'recovery'
  | 'makeSchedule'
  | 'inviteReplacement'
  | 'acceptInvite';

export type ModalShowObjectType = {
  show: ModalShowType;
  modalSetState: (arg: unknown) => void;
};
