export type ModalShowType = 'none' | 'activation' | 'signup' | 'recovery' | 'makeSchedule' | 'inviteReplacement';

export type ModalShowObjectType = {
  show: ModalShowType;
  modalSetState: (arg: unknown) => void;
};
