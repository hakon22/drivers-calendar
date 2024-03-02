import type { PriceAndCount, Cart } from './Cart';
import type { Context, SetContext } from '../components/CardContextMenu';

export type ModalCloseType = 'order' | 'recovery' | 'login' | 'signup' | boolean;

export type ModalShowType = ModalCloseType | 'cart' | 'activation' | 'createItem' | 'removeItem' | 'editItem' | 'confirmEmail';

export type ModalProps = {
  onHide: (arg?: ModalCloseType) => void;
  show?: ModalShowType;
}

export type ModalActivateProps = ModalProps & {
  id?: string;
  email?: string;
}

export type ModalRemoveItemProps = ModalProps & {
  context: Context;
  setContext: SetContext;
}

export type ModalEditItemProps = ModalProps & {
  context?: Context;
  setContext?: SetContext;
}

export type ModalConfirmEmailProps = ModalProps & {
  setIsConfirmed: (arg: boolean) => void;
}

export type ModalCartProps = ModalProps & {
  items: (Cart | undefined)[];
  priceAndCount: PriceAndCount;
}
