import dayjs from 'dayjs';
import { ChatMessagesModel } from '../../server/db/tables/ChatMessages';

const groupObjectsByDate = (objects: ChatMessagesModel[]) => {
  // Создаем пустой объект для группировки
  const groupedByDate: { [key: string]: ChatMessagesModel[] } = {};

  // Проходим по каждому объекту в исходном массиве
  objects.forEach((obj) => {
    // Получаем дату в формате 'YYYY-MM-DD'
    const date = dayjs(obj.createdAt).format('YYYY-MM-DD');
    // Если в объекте groupedByDate нет ключа с текущей датой, создаем новый массив
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    // Добавляем текущий объект в соответствующий массив даты
    groupedByDate[date].push(obj);
  });

  return groupedByDate;
};

export default groupObjectsByDate;
