const truncateLastDecimal = (num: number) => {
  // Преобразуем число в строку
  let numStr = num.toString();

  // Проверяем, есть ли в строке символ запятой
  const decimalIndex = numStr.indexOf('.');
  if (decimalIndex !== -1) {
    // Получаем часть числа после запятой
    const decimalPart = numStr.slice(decimalIndex + 1);

    // Если у числа два знака после запятой
    if (decimalPart.length === 2) {
      // Обрезаем последний знак после запятой
      numStr = numStr.slice(0, decimalIndex + 2);
    }
    if (decimalPart.length > 5) {
      // Обрезаем последний знак после запятой
      numStr = Number(numStr).toFixed(1);
    }
  }

  // Преобразуем обратно в число и возвращаем его
  return parseFloat(numStr);
};

export default truncateLastDecimal;
