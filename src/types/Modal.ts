export type ModalShowType = 'none' | 'activation' | 'signup';

export type ModalShowObjectType = {
  show: ModalShowType;
  modalSetState: (arg: unknown) => void;
};
