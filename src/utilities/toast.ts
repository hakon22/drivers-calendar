import { toast } from 'react-toastify';

type ToastType = 'info' | 'success' |'warning' | 'error';

export default (text: string, type: ToastType) => toast[type](text);
