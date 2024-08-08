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
        submitButtonWithLogin: 'Добавить',
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
    index: {
      title: 'График смен',
      adminTitle: 'Список экипажей',
      prev: 'Назад',
      description: 'График смен',
      adminSelectCrew: {
        drivers: 'Водители:',
        cars: 'Автомобили:',
        submitButton: 'Детали экипажа',
      },
      navbar: {
        menu: 'Меню',
        buttons: {
          makeSchedule: 'Составить график',
          inviteReplacement: 'Пригласить сменщика',
          kickReplacement: 'Исключить сменщика',
          swapShifts: 'Поменяться сменами',
          takeSickLeave: 'Взять больничный',
          cancelSickLeave: 'Отменить больничный',
          takeVacation: 'Взять отпуск',
          cancelVacation: 'Отменить отпуск',
          car: 'Автомобили',
          crewSettings: 'Настройки экипажа',
          userProfile: 'Настройки пользователя',
          writeToSupport: 'Написать в поддержку',
          exit: 'Выйти из аккаунта',
          leave: 'Выйти из экипажа',
        },
        popconfirm: {
          title: 'Подтвердите действие',
          description: 'Вы действительно хотите покинуть экипаж? Вы сможете войти только по приглашению!',
          cancel: 'Нет',
          ok: 'Да',
        },
      },
    },
    validation: {
      required: 'Обязательное поле',
      requirements: 'От 3 до 20 символов',
      passMin: 'Не менее 6 символов',
      phone: 'Введите корректный номер телефона',
      code: 'Введите 4 цифры',
      mastMatch: 'Пароли должны совпадать',
      userAlreadyExists: 'Такой пользователь уже существует',
      userNotExists: 'Такой пользователь не зарегистрирован',
      incorrectPassword: 'Неверный пароль',
      incorrectCode: 'Неверный код',
      timeNotOver: 'Время повторной отправки СМС не подошло',
      incorrectColor: 'Неверное значение цвета',
      incorrectSchedule: 'Некорректный график',
      userInCrew: 'Пользователь уже состоит в экипаже',
    },
    toast: {
      sendSmsSuccess: 'СМС успешно отправлено',
      sendSmsError: 'Не удалось отправить СМС',
      timeNotOverForSms: 'Вы можете отправлять СМС только раз в минуту',
      unknownError: 'Ошибка: {{ error }}',
      networkError: 'Ошибка соединения',
      authError: 'Ошибка аутентификации',
      userAlreadyExists: 'Данный номер телефона уже зарегистрирован',
      carAlreadyExists: 'Вызывной или инвентарный уже существует',
      crewNotExists: 'Экипаж не существует',
      userInYouCrew: 'Пользователь уже в вашем экипаже!',
      invalidInvitation: 'Приглашение недействительно',
      alreadyOnCrew: 'Вы уже состоите в экипаже!',
      carNotOnTheCrew: 'Автомобиль не числится в экипаже!',
      carUpdateSuccess: 'Автомобиль успешно обновлён',
      carRemoveSuccess: 'Автомобиль успешно удалён',
      carIsActive: 'Нельзя удалить активный автомобиль',
      carNotExistInCrew: 'Автомобиль уже не в экипаже',
      carIsActiveAnotherCrew: 'Автомобиль активен в другом экипаже',
      carNotExists: 'Автомобиль не существует',
      sentRequestSuccess: 'Запрос успешно отправлен',
      notificationNotExist: 'Уведомления не существует',
      shiftsNotAvailable: 'Ваших смен в заданном промежутке не найдено',
      reservedDaysNotAvailable: 'Данные не существуют',
      cancelVacation: 'Отпуск отменён',
      cancelSickLeave: 'Больничный отменён',
      endShiftSuccess: 'Смена успешно завершена',
      changeProfileSuccess: 'Данные успешно изменены',
      kickReplacementSuccess: 'Сменщик успешно исключён из экипажа',
      expelledFromCrewSuccess: 'Вас исключили из экипажа',
      swipShiftSuccess: 'Вы успешно поменялись сменами!',
    },
    modals: {
      signup: {
        title: 'Регистрация прошла успешно!',
        subTitle: 'Пароль для входа выслан Вам в SMS-сообщении.',
        subTitleWithOldUser: 'Данные существующего пользователя были обновлены.',
        loginButton: 'Войти в экипаж',
      },
      recovery: {
        title: 'Восстановление пароля прошло успешно!',
        subTitle: 'Новый пароль для входа выслан Вам в SMS-сообщении.',
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
      makeSchedule: {
        selectQueue: 'Выберите порядок расстановки',
        selectDate: 'Выберите дату начала',
        next: 'Далее',
        back: 'Назад',
      },
      inviteReplacement: {
        phone: 'Введите номер телефона',
        submitButton: 'Выслать приглашение',
        title: 'Приглашение отправлено!',
        title2: 'Пригласить сменщика',
        subTitle: 'Высланный пароль действует 24 часа',
        back: 'Вернуться в календарь',
      },
      acceptInvite: {
        title: 'Вас пригласили в экипаж к {{ users }}',
        subTitle: 'Автомобили в этом экипаже: {{ cars }}',
        start: 'Старт!',
        username: 'Введите ваше имя',
        color: 'Цвет рабочих смен',
        colorTooltip: 'Этим цветом будут отображаться ваши рабочие смены на календаре',
      },
      inviteNotification: {
        accept: 'Принять',
        decline: 'Отклонить',
        invitations: 'Приглашения',
      },
      notifications: {
        title: 'Уведомления',
        noNotifications: 'Уведомлений нет',
        delete: 'Удалить',
        accept: 'Принять',
        decline: 'Отклонить',
      },
      carsControl: {
        title: 'Автомобили',
        model: 'Авто',
        call: 'Выз.',
        inventory: 'Инв.',
        emptyText: 'Автомобилей нет',
        add: 'Добавить',
        remove: 'Удалить',
        edit: 'Редактировать',
        popconfirm: {
          title: 'Удаление автомобиля',
          description: 'Вы действительно хотите удалить автомобиль?',
          cancel: 'Нет',
          ok: 'Да',
        },
      },
      carsEdit: {
        title: '{{ car }}',
        update: 'Обновить',
        add: 'Добавить из списка',
        carsNotFound: 'Автомобили не найдены',
        selectCar: 'Выберите автомобиль',
        addNewCar: 'Добавить новый',
      },
      carsAdd: {
        title: 'Добавление автомобиля',
      },
      swapShifts: {
        firstShift: 'Выберите свою смену',
        secondShift: 'Выберите смену замены',
        confirmScheduleChange: 'Подтвердите смену графика',
        yourShift: 'Ваша смена: ',
        changedShift: 'Смена сменщика: ',
        submitButton: 'Поменяться сменами',
        title: 'Сменщику был выслан запрос на изменение графика',
        subTitle: 'Вы получите уведомление о принятом решении',
        back: 'Вернуться в календарь',
      },
      takeSickLeave: {
        firstShift: 'Выберите начало больничного',
        secondShift: 'Выберите конец больничного',
        confirmScheduleChange: 'Подтвердите даты больничного',
        yourShift: 'Начало: ',
        changedShift: 'Конец: ',
        submitButton: 'Взять больничный',
        title: 'Больничный зарегистрирован!',
        subTitle: 'Сменщикам придёт уведомление, что вы заболели',
        back: 'Вернуться в календарь',
      },
      takeVacation: {
        firstShift: 'Выберите начало отпуска',
        secondShift: 'Выберите конец отпуска',
        confirmScheduleChange: 'Подтвердите даты отпуска',
        yourShift: 'Начало: ',
        changedShift: 'Конец: ',
        submitButton: 'Взять отпуск',
        title: 'Отпуск зарегистрирован!',
        subTitle: 'Сменщикам придёт уведомление, что вы запланировали отпуск',
        back: 'Вернуться в календарь',
      },
      cancelSickLeave: {
        currentReservedDays: 'Текущий больничный',
        yourShift: 'Начало: ',
        changedShift: 'Конец: ',
        submitButton: 'Отменить больничный',
      },
      cancelVacation: {
        currentReservedDays: 'Текущий отпуск',
        yourShift: 'Начало: ',
        changedShift: 'Конец: ',
        submitButton: 'Отменить отпуск',
      },
      chat: {
        title: 'Чат экипажа',
        placeholder: 'Введите сообщение...',
      },
      endWorkShift: {
        title: 'Завершение смены',
        floatButton: 'Закрыть смену',
        isRefueling: 'Была заправка',
        isDowntime: 'Простой',
        isHighway: 'Пробег по трассе',
        mileageCity: 'Пробег по Москве',
        mileageHighway: 'Пробег по трассе',
        refueling: 'Заправлено',
        startMileage: 'Пробег: {{ mileage }} км',
        startRemainingFuel: 'Остаток топлива: {{ fuel }} л',
        mileage: 'Пробег: ',
        mileageAfterMaintenance: 'Пробег после последнего ТО: ',
        resultRefueling: 'Заправлено: ',
        downtime: 'Простой: ',
        remainingFuel: 'Остаток топлива: ',
        fuelConsumptionCity: 'Расход топлива по городу: ',
        fuelConsumptionHighway: 'Расход топлива по трассе: ',
        totalFuelConsumption: 'Суммарный расход топлива: ',
        complete: 'Готово',
        km: 'км',
        litre: 'л',
        submitButton: 'Закрыть смену',
      },
      crewSettings: {
        title: 'Настройки экипажа',
        roundFuel: 'Округлять остаток топлива',
        summer: 'Летняя норма',
        winter: 'Зимняя норма',
      },
      userProfile: {
        title: 'Настройки пользователя',
        phone: 'Телефон',
        username: 'Имя',
        color: 'Цвет рабочих смен',
        colorTooltip: 'Этим цветом будут отображаться ваши рабочие смены на календаре',
        confirm: 'Подтвердить телефон',
        password: 'Пароль',
        oldPassword: 'Старый пароль',
        confirmPassword: 'Подтвердите пароль',
        isRoundCalendarDays: 'Закруглять календарные дни',
        submitButton: 'Сохранить',
      },
      shiftReport: {
        title: 'Отчёт закрытых смен',
        completed: 'Завершил',
        mileageAfterMaintenance: 'ТО',
        date: 'Дата',
        car: 'Авто',
        mileage: 'Пробег',
        remainingFuel: 'Остаток',
        refueling: 'Заправка',
        emptyText: 'Ещё никто не закрывал смену',
      },
      updatesNotice: {
        title: 'Новое обновление!',
        readButton: 'Прочитать',
      },
      kickReplacement: {
        title: 'Исключить сменщика',
        submitButton: 'Исключить',
        textP1: 'Сменщик будет исключён из экипажа и сможет вернуться только по приглашению.',
        textP2: 'График будет перераспределён с первого рабочего дня исключаемого.',
        popconfirm: {
          title: 'Подтвердите действие',
          description: 'Вы действительно хотите исключить {{ username }}?',
          cancel: 'Нет',
          ok: 'Да',
        },
      },
    },
  },
} as const;
