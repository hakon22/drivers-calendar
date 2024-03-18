export default {
  translation: {
    404: {
      title: 'Ошибка 404',
      description: 'Страница не найдена',
      text: 'Возможно, наши горе-разработчики что-то сломали :(',
      prev: 'Назад',
    },
    welcome: {
      title: 'Календарь водителя',
      description: 'Войдите или создайте экипаж',
      signupButton: 'Создать экипаж',
      loginButton: 'Войти',
    },
    signup: {
      title: 'Создание экипажа',
      description: 'Создание экипажа',
      prev: 'Назад',
      userForm: {
        phone: 'Телефон',
        username: 'Имя',
        color: 'Цвет рабочих смен',
        colorTooltip: 'Этим цветом будут отображаться ваши рабочие смены на календаре',
        schedule: 'График',
        '2/2': '2/2',
        '1/2': '1/2',
        '1/3': '1/3',
        next: 'Подтвердить телефон',
      },
      carForm: {
        loading: 'Загрузка...',
        submitButton: 'Создать экипаж',
        brand: 'Выберите марку',
        model: 'Выберите модель',
        inventory: 'Инвентарный',
        call: 'Вызывной',
        mileage: 'Пробег',
        mileage_after_maintenance: 'Пробег после ТО',
        remaining_fuel: 'Остаток топлива',
        fuel_consumption_summer: 'Летний расход топлива',
        fuel_consumption_winter: 'Зимний расход топлива',
        city: 'Город',
        highway: 'Трасса',
        km: 'км',
        litre: 'л',
        litrePerKm: 'л/100км',
      },
    },
    login: {
      title: 'Войти в экипаж',
      description: 'Войти в экипаж',
      phone: 'Телефон',
      password: 'Пароль',
      forgotPassword: 'Забыли пароль?',
      submitButton: 'Войти',
      prev: 'Назад',
    },
    recovery: {
      title: 'Восстановить пароль',
      description: 'Восстановление пароля',
      phone: 'Телефон',
      rememberPassword: 'Вспомнили пароль?',
      submitButton: 'Восстановить пароль',
      prev: 'Назад',
    },
    validation: {
      required: 'Обязательное поле',
      requirements: 'От 3 до 20 символов',
      passMin: 'Не менее 6 символов',
      phone: 'Введите корректный номер телефона',
      code: 'Введите 4 цифры',
      mastMatch: 'Пароли должны совпадать',
      userAlreadyExists: 'Такой пользователь уже существует',
      userNotAlreadyExists: 'Такой пользователь не зарегистрирован',
      incorrectPassword: 'Неверный пароль',
      incorrectCode: 'Неверный код',
      timeNotOver: 'Время повторной отправки СМС не подошло',
      incorrectColor: 'Неверное значение цвета',
      incorrectSchedule: 'Некорректный график',
    },
    toast: {
      sendSmsSuccess: 'СМС успешно отправлено',
      sendSmsError: 'Не удалось отправить СМС',
      timeNotOverForSms: 'Вы можете отправлять СМС только раз в минуту',
      unknownError: 'Неизвестная ошибка',
      networkError: 'Ошибка соединения',
      authError: 'Ошибка аутентификации',
    },
    modals: {
      signup: {
        title: 'Регистрация прошла успешно!',
        subTitle: 'Пароль для входа выслан Вам в SMS-сообщении.',
        loginButton: 'Войти в экипаж',
      },
      confirmPhone: {
        h1: 'Подтверждение телефона',
        enterTheCode: 'Введите код из СМС',
        didntReceive: 'Не получили код?',
        timerCode_zero: 'Отправка нового кода через {{ count }} секунд',
        timerCode_one: 'Отправка нового кода через {{ count }} секунду',
        timerCode_few: 'Отправка нового кода через {{ count }} секунды',
        timerCode_many: 'Отправка нового кода через {{ count }} секунд',
        sendAgain: 'Отправить код еще раз',
        loading: 'Проверка...',
      },
    },
  },
} as const;
