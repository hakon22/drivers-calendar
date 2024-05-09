export type ModalShowType = 'none' | 'activation' | 'signup' | 'recovery';

export type ModalShowObjectType = {
  show: ModalShowType;
  modalSetState: (arg: unknown) => void;
};
