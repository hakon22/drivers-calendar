export type ModalShowType = 'none' | 'activation' | 'signup' | 'recovery' | 'makeSchedule';

export type ModalShowObjectType = {
  show: ModalShowType;
  modalSetState: (arg: unknown) => void;
};
