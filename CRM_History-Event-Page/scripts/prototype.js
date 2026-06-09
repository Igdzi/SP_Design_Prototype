(function () {
    'use strict';

    var services = {
        all: { label: 'Всі сервіси', paid: true },
        crm: { label: 'CRM', paid: true, className: 'service-crm', icon: 'assets/icons/i-crm.svg' },
        email: { label: 'Розсилки', paid: true, className: 'service-email', icon: 'assets/icons/i-email.svg' },
        automation: { label: 'Automation', paid: true, className: 'service-automation', icon: 'assets/icons/i-automation.svg' },
        chatbots: { label: 'Чат-боти', paid: true, className: 'service-chatbots', icon: 'assets/icons/i-chatbots.svg' },
        sites: { label: 'Сайти', paid: true, className: 'service-sites', icon: 'assets/icons/i-websites.svg' },
        popups: { label: 'Попапи', paid: true, className: 'service-popups', icon: 'assets/icons/i-pop-ups.svg' },
        push: { label: 'Push', paid: true, className: 'service-push', icon: 'assets/icons/i-push.svg' },
        smtp: { label: 'SMTP', paid: true, className: 'service-smtp', icon: 'assets/icons/i-smtp.svg' },
        edu: { label: 'Курси', paid: true, className: 'service-edu', icon: 'assets/icons/i-courses.svg' }
    };

    var eventTypes = {
        crm: ['Закрита угода', 'Переміщення угоди', 'Новий контакт', 'Видалення контакту', 'Нова задача', 'Завершення задачі'],
        email: ['Відправлення', 'Новий шаблон', 'Автоматизація'],
        automation: ['Відправлення', 'Новий шаблон', 'Автоматизація'],
        chatbots: ['Відправлення', 'Новий шаблон', 'Автоматизація'],
        sites: ['Відправлення', 'Новий шаблон', 'Автоматизація'],
        popups: ['Відправлення', 'Новий шаблон', 'Автоматизація'],
        push: ['Відправлення', 'Новий шаблон', 'Автоматизація'],
        smtp: ['Відправлення', 'Новий шаблон', 'Автоматизація'],
        edu: ['Відправлення', 'Новий шаблон', 'Автоматизація']
    };

    var events = [
        item('crm', 'Юрій Коваленко', 'закрив угоду', 'Інтеграція API для ТОВ «Техносвіт»', 'Закрита угода', 'Сума: 42 000 грн, етап: Won', 'Сьогодні', '14:28', '2026-05-28 14:28'),
        item('email', 'Марина Савченко', 'запустила кампанію', 'Травнева промо-розсилка', 'Запуск кампанії', '18 420 отримувачів, сегмент: Активні клієнти', 'Сьогодні', '13:51', '2026-05-28 13:51'),
        item('automation', 'Ігор Мельник', 'запустив сценарій', 'Реактивація лідів після демо', 'Запуск сценарію', 'Тригер: зміна етапу угоди', 'Сьогодні', '13:12', '2026-05-28 13:12'),
        item('chatbots', 'Олена Петренко', 'додала тег контакту', 'Запит ціни у Telegram-боті', 'Тег додано', 'Тег: hot-lead, канал: Telegram', 'Сьогодні', '12:40', '2026-05-28 12:40'),
        item('sites', 'Марина Савченко', 'опублікувала сторінку', 'Лендінг для весняної акції', 'Опублікована сторінка', 'Домен: promo.example.com', 'Сьогодні', '12:05', '2026-05-28 12:05'),
        item('popups', 'Олена Петренко', 'оновила правило показу', 'Попап для сегменту «Нові відвідувачі»', 'Оновлення правила', 'Показ після 20 секунд на сайті', 'Сьогодні', '11:42', '2026-05-28 11:42'),
        item('smtp', 'Юрій Коваленко', 'підтвердив домен', 'mail.technosvit.ua', 'Домен підтверджено', 'SPF і DKIM активні', 'Сьогодні', '11:31', '2026-05-28 11:31'),
        item('edu', 'Ігор Мельник', 'опублікував урок', 'Модуль 3: Автоматизація продажів', 'Новий урок', 'Курс: CRM для відділу продажів', 'Сьогодні', '11:18', '2026-05-28 11:18'),
        item('crm', 'Олена Петренко', 'перенесла угоду', 'Підключення чат-бота для «Green Market»', 'Зміна етапу', 'З етапу Demo до етапу Contract', 'Сьогодні', '09:42', '2026-05-28 09:42'),
        item('email', 'Юрій Коваленко', 'створив шаблон', 'Welcome-серія для нових лідів', 'Новий шаблон', 'Категорія: Онбординг', 'Сьогодні', '09:10', '2026-05-28 09:10'),
        item('crm', 'Ігор Мельник', 'додав контакт', 'Наталія Бондар, ТОВ «Альфа Дистрибуція»', 'Новий контакт', 'Джерело: форма на сайті', 'Вчора', '18:24', '2026-05-27 18:24'),
        item('chatbots', 'Марина Савченко', 'запустила ланцюжок', 'Повернення покинутого кошика', 'Запуск ланцюжка', 'Messenger: Instagram, аудиторія: 1 082', 'Вчора', '16:33', '2026-05-27 16:33'),
        item('push', 'Олена Петренко', 'створила push-кампанію', 'Знижка 15% для повторної покупки', 'Запуск кампанії', 'Браузери: Chrome, Safari', 'Вчора', '15:17', '2026-05-27 15:17'),
        item('edu', 'Ігор Мельник', 'перевірив домашнє завдання', 'Практика з воронкою продажів', 'Домашнє завдання', 'Студент: Антон Литвин, оцінка: прийнято', 'Вчора', '13:02', '2026-05-27 13:02'),
        item('crm', 'Марина Савченко', 'створила угоду', 'Розширення тарифу для «Nova Trade»', 'Нова угода', 'Сума: 18 500 грн, відповідальний: Марина Савченко', '11 Травня', '17:05', '2026-05-11 17:05'),
        item('email', 'Олена Петренко', 'оновила список', 'Клієнти з останньою покупкою 90 днів тому', 'Відправлення', 'Додано 426 контактів', '11 Травня', '15:33', '2026-05-11 15:33'),
        item('edu', 'Ігор Мельник', 'відмітив завершення курсу', 'CRM для менеджерів', 'Завершення курсу', 'Студентів завершили: 24', '11 Травня', '12:20', '2026-05-11 12:20'),
        item('chatbots', 'Юрій Коваленко', 'отримав відповідь бота', 'Запит консультації з CRM', 'Відповідь бота', 'Ключове слово: demo', '10 Травня', '19:38', '2026-05-10 19:38'),
        item('crm', 'Олена Петренко', 'закрила угоду', 'Повторне замовлення для «Fresh Food»', 'Закрита угода', 'Причина: успішна оплата', '10 Травня', '18:16', '2026-05-10 18:16'),
        item('edu', 'Ігор Мельник', 'опублікував урок', 'Модуль 2: Робота із запереченнями', 'Новий урок', 'Курс: CRM для менеджерів', '6 Травня', '15:21', '2026-05-06 15:21'),
        item('edu', 'Олена Петренко', 'відмітила завершення курсу', 'Онбординг нового менеджера', 'Завершення курсу', 'Студентів завершили: 8', '6 Травня', '12:06', '2026-05-06 12:06'),
        item('edu', 'Марина Савченко', 'перевірила домашнє завдання', 'Складання follow-up листа', 'Домашнє завдання', 'Студент: Ліза Павленко, оцінка: прийнято', '5 Травня', '17:18', '2026-05-05 17:18')
    ];

    var upsellContent = {
        all: {
            title: 'Повна історія подій SendPulse в одному місці',
            subtitle: 'Переглядайте всі події без обмежень, швидко знаходьте потрібні зміни та контролюйте роботу команди в одному журналі.',
            image: 'assets/images/il-all-events.png?v=20260609-updated-illustrations',
            tariffTitle: 'Доступно на платних тарифах Всі сервіси',
            benefits: [
                'Переглядати повну історію подій без обмеження після 10 записів',
                'Швидко знаходити потрібні дії за пошуком, сервісом, менеджером і типом події',
                'Відстежувати активність команди в CRM, розсилках, чат-ботах та інших сервісах',
                'Аналізувати дані подій в усьому сервісі'
            ]
        },
        crm: {
            title: 'Повна історія подій CRM без обмежень',
            subtitle: 'Контролюйте зміни в угодах, контактах і задачах, щоб команда бачила весь контекст роботи з клієнтами.',
            image: 'assets/images/il-product-crm.png?v=20260609-updated-illustrations',
            tariffTitle: 'Доступно на платних тарифах CRM:',
            showTariffLabels: true,
            benefits: [
                'Переглядати всі зміни в угодах, контактах і задачах після 10 останніх записів',
                'Швидко знаходити дії менеджерів за пошуком, відповідальним і типом CRM-події',
                'Відстежувати рух угод між етапами та завершення задач у команді',
                'Аналізувати активність менеджерів у CRM без ручного збору даних'
            ]
        },
        email: {
            title: 'Повна історія подій у розсилках',
            subtitle: 'Бачте всі запуски кампаній, зміни списків і шаблонів, щоб швидко перевіряти роботу email-маркетингу.',
            image: 'assets/images/il-product-email.png?v=20260609-updated-illustrations',
            tariffTitle: 'Доступно на платних тарифах Розсилки',
            benefits: [
                'Переглядати всі події розсилок без обмеження останніми 10 записами',
                'Знаходити потрібні кампанії, шаблони та списки за пошуком і фільтрами',
                'Контролювати, хто запускав кампанії та оновлював аудиторії',
                'Швидше розбиратися в змінах перед аналізом результатів розсилок'
            ]
        },
        automation: {
            title: 'Повна історія подій Automation',
            subtitle: 'Відстежуйте запуски сценаріїв, зміни тригерів і шаблонів, щоб автоматизації працювали прозоро для всієї команди.',
            image: 'assets/images/il-product-automation.png?v=20260609-updated-illustrations',
            tariffTitle: 'Доступно на платних тарифах Automation',
            benefits: [
                'Переглядати всі події сценаріїв після перших 10 записів',
                'Шукати зміни в автоматизаціях за менеджером, типом події та деталями',
                'Контролювати запуск, редагування та оновлення ланцюжків',
                'Швидко знаходити причину змін у сценаріях продажів і маркетингу'
            ]
        },
        chatbots: {
            title: 'Повна історія подій чат-ботів',
            subtitle: 'Зберігайте повний журнал змін у ботах, тегах і ланцюжках для швидкої перевірки діалогів і командної роботи.',
            image: 'assets/images/il-product-chatbots.png?v=20260609-updated-illustrations',
            tariffTitle: 'Доступно на платних тарифах Чат-боти',
            benefits: [
                'Переглядати всі події чат-ботів без обмеження 10 записами',
                'Знаходити зміни в ланцюжках, тегах і відповідях за пошуком',
                'Бачити, хто оновлював бота та які дії впливали на контакти',
                'Контролювати активність у Telegram, Instagram та інших каналах'
            ]
        },
        sites: {
            title: 'Повна історія подій сайтів',
            subtitle: 'Відстежуйте публікації сторінок, зміни доменів і налаштувань, щоб команда бачила актуальний стан сайтів.',
            image: 'assets/images/il-product-websites.png?v=20260609-updated-illustrations',
            tariffTitle: 'Доступно на платних тарифах Сайти',
            benefits: [
                'Переглядати всі події сайтів, а не тільки останні 10 записів',
                'Швидко знаходити публікації сторінок, зміни доменів і налаштувань',
                'Контролювати, хто оновлював лендінги та важливі сторінки',
                'Аналізувати зміни перед запуском кампаній і промо-акцій'
            ]
        },
        popups: {
            title: 'Повна історія подій попапів',
            subtitle: 'Контролюйте зміни правил показу, сегментів і форм, щоб попапи працювали за потрібним сценарієм.',
            image: 'assets/images/il-product-popups.png?v=20260609-popups-illustration',
            tariffTitle: 'Доступно на платних тарифах Попапи',
            benefits: [
                'Переглядати всі події попапів без обмеження після 10 записів',
                'Знаходити оновлення правил показу, сегментів і форм',
                'Бачити, хто змінював умови показу та налаштування попапів',
                'Швидко перевіряти історію змін перед запуском нових пропозицій'
            ]
        },
        push: {
            title: 'Повна історія подій Push',
            subtitle: 'Відстежуйте створення кампаній, зміни аудиторій і налаштувань браузерних сповіщень в одному журналі.',
            image: 'assets/images/il-product-push.png?v=20260609-updated-illustrations',
            tariffTitle: 'Доступно на платних тарифах Push',
            benefits: [
                'Переглядати всі події push-кампаній після 10 останніх записів',
                'Шукати кампанії, браузери та сегменти за деталями події',
                'Контролювати, хто створював і редагував push-розсилки',
                'Швидше перевіряти зміни перед повторними запусками кампаній'
            ]
        },
        smtp: {
            title: 'Повна історія подій SMTP',
            subtitle: 'Бачте всі зміни доменів, налаштувань і відправлень, щоб технічна історія SMTP була прозорою.',
            image: 'assets/images/il-product-smtp.png?v=20260609-updated-illustrations',
            tariffTitle: 'Доступно на платних тарифах SMTP',
            benefits: [
                'Переглядати всі SMTP-події без обмеження останніми 10 записами',
                'Знаходити підтвердження доменів, зміни SPF, DKIM і налаштувань',
                'Контролювати, хто вносив технічні зміни в SMTP',
                'Швидко перевіряти історію перед діагностикою доставлення'
            ]
        },
        edu: {
            title: 'Повна історія подій курсів',
            subtitle: 'Контролюйте публікації уроків, домашні завдання та завершення курсів у повній історії навчального процесу.',
            image: 'assets/images/il-product-courses.png?v=20260609-updated-illustrations',
            tariffTitle: 'Доступно на платних тарифах Курси',
            benefits: [
                'Переглядати всі події курсів без обмеження після 10 записів',
                'Знаходити уроки, домашні завдання та студентські дії за пошуком',
                'Бачити, хто оновлював навчальні матеріали та перевіряв завдання',
                'Аналізувати активність студентів і команди в одному журналі'
            ]
        }
    };

    var serviceEventSamples = {
        crm: [
            ['оновив суму угоди', 'Річний контракт для «Delta Logistics»', 'Оновлення угоди', 'Нова сума: 76 000 грн, імовірність: 80%'],
            ['змінив відповідального', 'Впровадження CRM для «City Dental»', 'Зміна відповідального', 'Відповідальний: Олена Петренко'],
            ['додав примітку', 'Перемовини з «EcoFarm»', 'Нова примітка', 'Клієнт попросив підготувати комерційну пропозицію'],
            ['створив задачу', 'Підписання договору з «Media Point»', 'Нова задача', 'Дедлайн: завтра, тип: дзвінок'],
            ['прикріпив файл', 'Акт виконаних робіт для «Softline UA»', 'Файл додано', 'Файл: agreement-final.pdf'],
            ['відновив контакт', 'Андрій Шевчук, «West Retail»', 'Контакт відновлено', 'Контакт повернено з архіву'],
            ['змінив етап', 'Підключення інтеграції оплат', 'Зміна етапу', 'З етапу Proposal до етапу Invoice'],
            ['закрив задачу', 'Повторний дзвінок після демо', 'Завершення задачі', 'Результат: клієнт підтвердив наступну зустріч'],
            ['додав товар до угоди', 'Пакет консультацій для «Smart Food»', 'Оновлення товарів', 'Додано: 5 годин консультацій'],
            ['видалив дубль контакту', 'Олександр Романюк', 'Видалення контакту', 'Обʼєднано з основною карткою контакту']
        ],
        email: [
            ['запланувала кампанію', 'Розсилка до Дня народження клієнта', 'Запланована кампанія', 'Дата запуску: 31 травня, сегмент: VIP-клієнти'],
            ['змінила тему листа', 'Промо для повторної покупки', 'Оновлення кампанії', 'Нова тема: Поверніться за подарунком'],
            ['імпортував контакти', 'Список «Весняна акція»', 'Імпорт контактів', 'Додано 1 240 контактів, 18 пропущено'],
            ['оновила сегмент', 'Активні покупці за 30 днів', 'Оновлення сегмента', 'Умова: покупка після 1 травня'],
            ['створив A/B тест', 'Тема листа для нових лідів', 'A/B тест', 'Варіанти: 2 теми, аудиторія: 20% списку'],
            ['призупинила кампанію', 'Нагадування про вебінар', 'Кампанію призупинено', 'Причина: оновлення посилання на трансляцію'],
            ['видалила чернетку', 'Старий шаблон промо-листа', 'Чернетку видалено', 'Автор чернетки: Марина Савченко'],
            ['оновив sender name', 'Команда підтримки SendPulse', 'Налаштування відправника', 'Імʼя відправника: Support Team'],
            ['перевірив лист', 'Тест перед запуском травневої кампанії', 'Тестове відправлення', 'Отримувач: marketing@example.com'],
            ['додав UTM-мітки', 'Кампанія для нових лідів', 'Оновлення посилань', 'Джерело: email, кампанія: may_leads']
        ],
        automation: [
            ['оновив умову старту', 'Welcome-сценарій для нових контактів', 'Оновлення тригера', 'Тригер: додавання до списку «Нові ліди»'],
            ['додав блок email', 'Реактивація після 30 днів тиші', 'Оновлення сценарію', 'Лист: Поверніться до замовлення'],
            ['змінила затримку', 'Follow-up після демо', 'Оновлення затримки', 'Затримка: 2 дні після дзвінка'],
            ['запустив тест сценарію', 'Онбординг нових клієнтів', 'Тест сценарію', 'Контакт для тесту: qa@example.com'],
            ['зупинила сценарій', 'Стара серія для холодних лідів', 'Сценарій зупинено', 'Причина: оновлення воронки продажів'],
            ['додав умову', 'Повернення покинутого кошика', 'Оновлення умови', 'Умова: сума кошика більше 1 000 грн'],
            ['оновив шаблон SMS', 'Нагадування про оплату', 'Оновлення повідомлення', 'Текст скорочено до 120 символів'],
            ['перемістив блок', 'Сценарій повторної покупки', 'Зміна структури', 'Блок перевірки покупки перенесено вище'],
            ['додав ціль', 'Запис на консультацію', 'Оновлення цілі', 'Ціль: перехід на сторінку бронювання'],
            ['відновив сценарій', 'Підігрів лідів після вебінару', 'Сценарій відновлено', 'Статус: активний']
        ],
        chatbots: [
            ['оновила привітання', 'Telegram-бот для консультацій', 'Оновлення повідомлення', 'Додано кнопку «Записатися на демо»'],
            ['додав швидку відповідь', 'FAQ для Instagram', 'Оновлення бота', 'Відповідь: умови доставки'],
            ['змінив тег', 'Контакти з питанням про ціну', 'Тег оновлено', 'Тег: price-request'],
            ['запустив розсилку', 'Повідомлення про нову колекцію', 'Запуск розсилки', 'Канал: Telegram, отримувачів: 2 314'],
            ['оновила ланцюжок', 'Кваліфікація ліда в Messenger', 'Оновлення ланцюжка', 'Додано питання про бюджет'],
            ['підключив канал', 'WhatsApp для підтримки', 'Канал підключено', 'Номер: +380 XX XXX XX XX'],
            ['вимкнула команду', 'Стара команда /promo', 'Команду вимкнено', 'Причина: завершення акції'],
            ['додав змінну', 'Збір заявки на консультацію', 'Оновлення змінних', 'Змінна: preferred_time'],
            ['перевірив сценарій', 'Бот для запису на курс', 'Тест ланцюжка', 'Тест пройдено без помилок'],
            ['оновив меню', 'Головне меню Telegram-бота', 'Оновлення меню', 'Додано пункт «Мої замовлення»']
        ],
        sites: [
            ['оновила SEO-заголовок', 'Сторінка «CRM для продажів»', 'SEO оновлено', 'Title: CRM для малого бізнесу'],
            ['змінив домен', 'Лендінг вебінару', 'Домен оновлено', 'Домен: webinar.example.com'],
            ['додав форму', 'Сторінка консультації', 'Форма додана', 'Форма: Запит на демо'],
            ['опублікував зміни', 'Головна сторінка промо-сайту', 'Публікація сторінки', 'Версія: 18'],
            ['оновила блок цін', 'Лендінг тарифів', 'Оновлення контенту', 'Додано тариф Standard'],
            ['підключив аналітику', 'Сайт продуктового каталогу', 'Інтеграція додана', 'Google Analytics активний'],
            ['змінила зображення', 'Hero-блок весняної акції', 'Оновлення медіа', 'Файл: spring-sale-cover.png'],
            ['додала сторінку', 'Політика конфіденційності', 'Нова сторінка', 'Статус: чернетка'],
            ['оновив favicon', 'Сайт бренду «Nova Trade»', 'Оновлення налаштувань', 'Файл: favicon.svg'],
            ['відкотив публікацію', 'Лендінг старої акції', 'Відкат версії', 'Повернено версію: 12']
        ],
        popups: [
            ['оновила сегмент', 'Попап для нових відвідувачів', 'Оновлення сегмента', 'Умова: перший візит на сайт'],
            ['змінив таймер', 'Знижка за підписку', 'Оновлення правила', 'Показ через 15 секунд'],
            ['додав сторінку показу', 'Форма збору лідів', 'Оновлення таргетингу', 'Сторінка: /pricing'],
            ['запустила попап', 'Акція вихідного дня', 'Попап активовано', 'Період: 28-31 травня'],
            ['зупинив попап', 'Стара пропозиція -10%', 'Попап зупинено', 'Причина: акція завершилась'],
            ['оновила текст кнопки', 'Попап консультації', 'Оновлення контенту', 'Кнопка: Отримати консультацію'],
            ['додав A/B варіант', 'Форма підписки на блог', 'A/B тест', 'Варіант B: коротший заголовок'],
            ['змінив частоту', 'Пропозиція для повернення', 'Оновлення частоти', 'Не частіше 1 разу на 7 днів'],
            ['оновив інтеграцію', 'Попап заявки в CRM', 'Інтеграція оновлена', 'Дія: створювати угоду в CRM'],
            ['перевірив мобільну версію', 'Попап для мобільного трафіку', 'Тест відображення', 'Статус: без помилок']
        ],
        push: [
            ['запланувала кампанію', 'Нагадування про розпродаж', 'Запланована кампанія', 'Запуск: сьогодні о 18:00'],
            ['оновив сегмент', 'Підписники Chrome за 60 днів', 'Оновлення сегмента', 'Умова: активність за 60 днів'],
            ['змінила іконку', 'Push про нову статтю', 'Оновлення медіа', 'Файл: blog-icon.png'],
            ['відправив тест', 'Перевірка push перед запуском', 'Тестове відправлення', 'Браузер: Safari'],
            ['зупинила кампанію', 'Стара промо-акція', 'Кампанію зупинено', 'Причина: оновлення промокоду'],
            ['додав UTM', 'Push для повторної покупки', 'Оновлення посилання', 'Кампанія: repeat_buyers'],
            ['оновив заголовок', 'Знижка на річний тариф', 'Оновлення кампанії', 'Новий заголовок: -20% тільки сьогодні'],
            ['створила чернетку', 'Новий реліз продукту', 'Нова кампанія', 'Статус: чернетка'],
            ['змінив TTL', 'Термінова пропозиція', 'Оновлення налаштувань', 'TTL: 6 годин'],
            ['перевірив доставлення', 'Push для активних клієнтів', 'Перевірка кампанії', 'Доставлено: 92%']
        ],
        smtp: [
            ['оновив DKIM', 'mail.novatrade.ua', 'DKIM оновлено', 'Статус: очікує перевірки DNS'],
            ['додав домен', 'notify.greenmarket.ua', 'Домен додано', 'SPF запис потрібно підтвердити'],
            ['перевірив репутацію', 'Основний SMTP-акаунт', 'Перевірка репутації', 'Статус: добра'],
            ['змінив ліміт', 'Транзакційні листи', 'Оновлення ліміту', 'Новий ліміт: 80 000 листів на місяць'],
            ['додав webhook', 'Події доставлення SMTP', 'Webhook додано', 'URL: https://example.com/smtp-hook'],
            ['оновила відправника', 'billing@technosvit.ua', 'Відправник оновлено', 'Імʼя: Billing Team'],
            ['перезапустив перевірку', 'Домен freshfood.ua', 'Перевірка домену', 'SPF і DKIM перевіряються повторно'],
            ['створив SMTP-ключ', 'Ключ для інтеграції сайту', 'SMTP-ключ створено', 'Доступ: тільки відправлення'],
            ['видалив старий webhook', 'Webhook тестового середовища', 'Webhook видалено', 'Причина: більше не використовується'],
            ['оновив bounce-адресу', 'Повернення листів', 'Налаштування bounce', 'Адреса: bounce@example.com']
        ],
        edu: [
            ['оновив урок', 'Модуль 1: Перший контакт з клієнтом', 'Урок оновлено', 'Додано відео та чекліст'],
            ['додав тест', 'Перевірка знань після модуля 2', 'Новий тест', 'Питань: 12, прохідний бал: 80%'],
            ['перевірила завдання', 'Скрипт дзвінка для демо', 'Домашнє завдання', 'Студент: Ірина Левченко, оцінка: прийнято'],
            ['відкрив доступ', 'Курс «CRM для продажів»', 'Доступ відкрито', 'Група: нові менеджери'],
            ['закрив доступ', 'Архівний курс з онбордингу', 'Доступ закрито', 'Причина: курс оновлюється'],
            ['додав студента', 'Група «Травень 2026»', 'Новий студент', 'Студент: Максим Орел'],
            ['оновила сертифікат', 'CRM для менеджерів', 'Сертифікат оновлено', 'Шаблон: standard-certificate'],
            ['опублікував модуль', 'Модуль 4: Робота з повторними продажами', 'Новий модуль', 'Уроків у модулі: 5'],
            ['змінив дедлайн', 'Домашнє завдання з воронкою', 'Дедлайн оновлено', 'Новий дедлайн: 3 червня'],
            ['експортував прогрес', 'Аналітика курсу «CRM Basic»', 'Експорт прогресу', 'Файл: course-progress.csv']
        ]
    };

    var state = {
        service: 'all',
        visible: 11,
        loading: false,
        search: '',
        filtersApplied: false,
        filters: { manager: '', types: [] }
    };

    var feed = document.getElementById('activityFeed');
    var tabs = document.getElementById('serviceTabs');
    var loader = document.getElementById('activityLoader');
    var filterToggle = document.getElementById('button-basic');
    var filterPanel = document.getElementById('deal-filter-menu');
    var filterFixedTop = document.getElementById('filterFixedTop');
    var filterScrollWrap = document.getElementById('filterScrollWrap');
    var managerFilter = document.getElementById('managerFilter');
    var typeGroups = document.getElementById('eventTypeGroups');
    var activeFilterParams = document.getElementById('activeFilterParams');
    var activitySearch = document.getElementById('activitySearch');
    var activitySearchSummary = document.getElementById('activitySearchSummary');
    var drawerTitle = document.getElementById('upsellDrawerTitle');
    var drawerSubtitle = document.getElementById('upsellDrawerSubtitle');
    var drawerImage = document.getElementById('upsellDrawerImage');
    var drawerBenefits = document.getElementById('upsellDrawerBenefits');
    var drawerTariffTitle = document.getElementById('upsellDrawerTariffTitle');
    var drawerTariffLabels = document.getElementById('upsellDrawerTariffLabels');
    var renderedEvents = [];

    function item(service, author, action, entity, type, details, dateLabel, time, fullDate) {
        return { service: service, author: author, action: action, entity: entity, type: type, details: details, dateLabel: dateLabel, time: time, fullDate: fullDate };
    }

    function createServiceEvent(serviceKey, sample, index) {
        var maleAuthors = ['Юрій Коваленко', 'Ігор Мельник'];
        var femaleAuthors = ['Марина Савченко', 'Олена Петренко'];
        var dateLabel = index < 4 ? 'Сьогодні' : index < 8 ? 'Вчора' : index < 10 ? '11 Травня' : '10 Травня';
        var firstActionWord = sample[0].split(' ')[0];
        var authors = firstActionWord.slice(-2) === 'ла' ? femaleAuthors : maleAuthors;
        var hour = 17 - (index % 8);
        var minutes = String((index * 7) % 60).padStart(2, '0');
        return item(
            serviceKey,
            authors[index % authors.length],
            sample[0],
            sample[1],
            sample[2],
            sample[3],
            dateLabel,
            String(hour).padStart(2, '0') + ':' + minutes,
            '2026-05-' + String(28 - (index % 18)).padStart(2, '0') + ' ' + String(hour).padStart(2, '0') + ':' + minutes
        );
    }

    function serviceEvents(serviceKey) {
        var samples = serviceEventSamples[serviceKey] || [];
        var rows = samples.map(function (sample, index) {
            return createServiceEvent(serviceKey, sample, index);
        });

        if (rows.length) rows.push(createServiceEvent(serviceKey, samples[0], rows.length));

        return rows;
    }

    function currentUpsellContent(serviceKey) {
        var content = upsellContent[serviceKey || state.service] || upsellContent.all;
        return {
            title: content.title,
            subtitle: content.subtitle,
            image: content.image || upsellContent.all.image,
            benefits: content.benefits || upsellContent.all.benefits,
            tariffTitle: content.tariffTitle || upsellContent.all.tariffTitle,
            showTariffLabels: !!content.showTariffLabels
        };
    }

    function syncDrawerContent(serviceKey) {
        var content = currentUpsellContent(serviceKey);
        drawerTitle.textContent = content.title;
        drawerSubtitle.textContent = content.subtitle;
        drawerImage.setAttribute('src', content.image);
        drawerTariffTitle.textContent = content.tariffTitle;
        drawerTariffLabels.classList.toggle('hide', !content.showTariffLabels);
        drawerBenefits.innerHTML = content.benefits.map(function (benefit, index) {
            var icons = ['icon-list', 'icon-filter', 'icon-users', 'icon-dashboard'];
            return '<li><span class="activity-benefit-icon"><span class="sp-icon ' + icons[index % icons.length] + '"></span></span><span>' + escapeHtml(benefit) + '</span></li>';
        }).join('');
    }

    function closeModals() {
        document.querySelectorAll('.modal.in').forEach(function (modal) {
            modal.classList.remove('in');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        });
        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
            backdrop.parentNode.removeChild(backdrop);
        });
    }

    function openModal(selector) {
        var modal = document.querySelector(selector);
        var backdrop = document.createElement('div');
        if (!modal) return;
        closeModals();
        backdrop.className = 'modal-backdrop fade in';
        document.body.appendChild(backdrop);
        document.body.classList.add('modal-open');
        modal.style.display = 'block';
        modal.removeAttribute('aria-hidden');
        modal.classList.add('in');
    }

    function openDrawer(serviceKey) {
        syncDrawerContent(serviceKey);
        document.getElementById('upsellDrawer').classList.add('is-open');
        document.getElementById('upsellDrawer').setAttribute('aria-hidden', 'false');
    }

    function closeDrawer() {
        document.getElementById('upsellDrawer').classList.remove('is-open');
        document.getElementById('upsellDrawer').setAttribute('aria-hidden', 'true');
    }

    function renderTabs() {
        var order = ['all', 'crm', 'email', 'automation', 'chatbots', 'sites', 'popups', 'push', 'smtp', 'edu'];
        tabs.innerHTML = order.map(function (key) {
            var count = 11;
            var active = state.service === key ? ' class="active"' : '';
            var selected = state.service === key ? 'true' : 'false';
            return '<li' + active + '><a href="#" role="tab" aria-selected="' + selected + '" data-service="' + key + '"><span class="activity-tab-label">' + services[key].label + '</span><span class="activity-tab-count">' + count + '</span></a></li>';
        }).join('');
    }

    function renderTypeGroups() {
        var keys = state.service === 'all' ? ['crm', 'email', 'automation', 'chatbots', 'sites', 'popups', 'push', 'smtp', 'edu'] : [state.service];
        typeGroups.innerHTML = keys.filter(function (key) { return eventTypes[key]; }).map(function (key) {
            var options = eventTypes[key].map(function (type) {
                var checked = state.filters.types.some(function (selected) {
                    return selected.service === key && selected.type === type;
                }) ? ' checked' : '';
                return '<label class="checkbox-inline"><input type="checkbox" data-filter-service="' + key + '" value="' + type + '"' + checked + '> ' + type + '</label>';
            }).join('');
            var heading = state.service === 'all'
                ? '<button class="activity-type-heading" type="button" aria-expanded="true"><span class="activity-type-service">' + services[key].label + '</span><span class="caret"></span></button>'
                : '<div class="activity-type-heading is-static"><span class="activity-type-service">' + services[key].label + '</span></div>';
            return '<div class="activity-type-group">' + heading +
                '<div class="activity-type-options">' + options + '</div></div>';
        }).join('');
    }

    function isLocked(event, index) {
        return index >= 10;
    }

    function filteredEvents() {
        var sourceEvents = state.service === 'all' ? events : serviceEvents(state.service);

        return sourceEvents.filter(function (event) {
            var inService = state.service === 'all' || event.service === state.service;
            var inManager = !state.filters.manager || event.author === state.filters.manager;
            var inType = !state.filters.types.length || state.filters.types.some(function (selected) {
                return selected.service === event.service && selected.type === event.type;
            });
            var query = state.search.toLocaleLowerCase();
            var inSearch = !query || [event.author, event.action, event.entity, event.type, event.details].some(function (value) {
                return value.toLocaleLowerCase().indexOf(query) > -1;
            });
            return inService && inManager && inType && inSearch;
        });
    }

    function escapeHtml(value) {
        return value.replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
    }

    function highlightSearch(value) {
        var query = state.search.trim();
        var escaped = escapeHtml(value);
        if (!query) return escaped;
        var escapedQuery = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return escaped.replace(new RegExp('(' + escapedQuery + ')', 'gi'), '<strong class="activity-search-highlight sp-primary">$1</strong>');
    }

    function eventMarkup(event, locked) {
        var service = services[event.service];
        var icon = '<span class="activity-service-icon ' + service.className + '">' + (service.icon ? '<img src="' + service.icon + '" alt="">' : service.code) + '</span>';
        if (locked) {
            icon = '<span class="activity-service-icon ' + service.className + ' service-locked" aria-hidden="true">' +
                '<img src="assets/icons/locked.svg?v=20260603-locked-svg" alt=""></span>';
            return '<article class="activity-event is-locked" data-open-drawer data-drawer-service="' + event.service + '">' +
                icon +
                '<div class="activity-event-main">' +
                '<div class="activity-event-text"><span class="activity-skeleton is-mid"></span></div>' +
                '<div class="activity-event-meta"><span class="activity-badge ' + service.className + '">' + service.label + '</span><span class="activity-details"><strong>Деталі:</strong> <span class="activity-skeleton is-mid"></span></span></div>' +
                '</div><time class="activity-time">' + event.time + '</time></article>';
        }
        return '<article class="activity-event" data-event-id="' + renderedEvents.indexOf(event) + '">' +
            icon +
            '<div class="activity-event-main">' +
            '<div class="activity-event-text"><span class="activity-event-author">' + highlightSearch(event.author) + '</span> ' + highlightSearch(event.action) + ' <strong>' + highlightSearch(event.entity) + '</strong></div>' +
            '<div class="activity-event-meta"><span class="activity-badge ' + service.className + '">' + service.label + '</span><span class="activity-details"><strong>Деталі:</strong> ' + highlightSearch(event.details) + '</span></div>' +
            '</div><time class="activity-time">' + event.time + '</time></article>';
    }

    function renderFeed() {
        var list = filteredEvents();
        var visibleList = list.slice(0, state.visible);
        var grouped = {};
        renderedEvents = visibleList;

        visibleList.forEach(function (event, index) {
            if (!grouped[event.dateLabel]) grouped[event.dateLabel] = [];
            grouped[event.dateLabel].push({ event: event, locked: isLocked(event, index) });
        });

        feed.innerHTML = Object.keys(grouped).map(function (date) {
            var rows = grouped[date].map(function (row) { return eventMarkup(row.event, row.locked); }).join('');
            return '<section class="activity-date-group"><h3 class="activity-date-title">' + date + ' · ' + grouped[date].length + '</h3>' + rows + '</section>';
        }).join('') || '<div class="no-deals activity-empty">Немає даних для відображення</div>';
        activitySearchSummary.innerHTML = state.search ? 'Знайдено результатів: <strong>' + list.length + '</strong>' : '';
        activitySearchSummary.classList.toggle('is-visible', !!state.search);

        loader.classList.toggle('is-visible', state.visible < list.length);
        renderTabs();
        syncFilterState();
        loadMoreIfNeeded();
    }

    function syncFilterState() {
        var locked = state.service !== 'all' && services[state.service] && !services[state.service].paid;
        filterPanel.classList.toggle('is-locked', locked);
        filterToggle.classList.toggle('active', state.filtersApplied);
        renderActiveFilterParams();
        managerFilter.disabled = locked;
        document.querySelectorAll('#eventTypeGroups input').forEach(function (control) {
            control.disabled = locked;
        });
    }

    function renderActiveFilterParams() {
        var params = [];
        if (state.filters.manager) {
            params.push({ name: 'manager', label: 'Менеджер: ', value: state.filters.manager });
        }
        state.filters.types.forEach(function (selected) {
            params.push({
                name: selected.service + ':' + selected.type,
                label: services[selected.service].label + ': ',
                value: selected.type
            });
        });
        activeFilterParams.innerHTML = params.map(function (param) {
            return '<span class="one-filter-params" data-filtername="' + param.name + '" data-filtervalue="' + param.value + '">' +
                param.label + '<span>' + param.value + '</span><span class="sp-icon icon-delete" data-remove-filter="' + param.name + '"></span></span>';
        }).join('');
    }

    function resetAndRender() {
        state.visible = 11;
        state.loading = false;
        renderTypeGroups();
        syncDrawerContent();
        renderFeed();
    }

    function scheduleLoadMore() {
        if (state.loading || state.visible >= filteredEvents().length) return;
        state.loading = true;
        loader.classList.add('is-visible');
        window.setTimeout(function () {
            state.visible += 10;
            state.loading = false;
            renderFeed();
        }, 350);
    }

    function loadMoreIfNeeded() {
        if (!loader.classList.contains('is-visible')) return;
        var rect = loader.getBoundingClientRect();
        if (rect.top < window.innerHeight + 120) scheduleLoadMore();
    }

    function showDetails(id) {
        var event = renderedEvents[id];
        if (!event) return;
        var service = services[event.service];
        var icon = '<span class="activity-service-icon ' + service.className + '"><img src="' + service.icon + '" alt=""></span>';
        var dateParts = event.fullDate.split(' ');
        document.getElementById('eventDetailsBody').innerHTML =
            '<div class="activity-modal-block">' +
            '<div class="activity-modal-block-header">' + icon +
            '<div class="activity-modal-block-title"><span class="activity-badge ' + service.className + '">' + service.label + '</span><time><span>' + dateParts[0] + '</span><i></i><span>' + dateParts[1] + '</span></time></div>' +
            '</div>' +
            '<div class="activity-modal-row"><span>Автор:</span><p>' + event.author + '</p></div>' +
            '<div class="activity-modal-row"><span>Дія:</span><p>' + event.action + ' <strong>' + event.entity + '</strong></p></div>' +
            '<div class="activity-modal-row"><span>Деталі:</span><p>' + event.details + '</p></div>' +
            '</div>';
        openModal('#eventDetailsModal');
    }

    document.addEventListener('click', function (event) {
        var modalTrigger = event.target.closest('[data-toggle="modal"]');
        var dismissTrigger = event.target.closest('[data-dismiss="modal"]');
        var dropdownTrigger = event.target.closest('[data-toggle="dropdown"]');
        var collapseTrigger = event.target.closest('[data-toggle="collapse"]');
        var tabTrigger = event.target.closest('[data-service]');
        var card = event.target.closest('[data-event-id]');
        var drawerTrigger = event.target.closest('[data-open-drawer]');
        var drawerClose = event.target.closest('.activity-drawer-close');
        var typeHeading = event.target.closest('.activity-type-heading');
        var removeFilter = event.target.closest('[data-remove-filter]');
        var openDropdown = document.querySelector('.dropdown.open, .btn-group.open');

        if (modalTrigger) {
            event.preventDefault();
            openModal(modalTrigger.getAttribute('data-target'));
            return;
        }
        if (dismissTrigger || event.target.classList.contains('modal')) {
            event.preventDefault();
            closeModals();
            return;
        }
        if (dropdownTrigger) {
            event.preventDefault();
            var dropdown = dropdownTrigger.closest('.dropdown, .btn-group');
            if (openDropdown && openDropdown !== dropdown) openDropdown.classList.remove('open');
            if (dropdown) dropdown.classList.toggle('open');
            return;
        }
        if (collapseTrigger) {
            event.preventDefault();
            var target = document.querySelector(collapseTrigger.getAttribute('data-target'));
            if (target) target.classList.toggle('in');
            return;
        }
        if (tabTrigger) {
            event.preventDefault();
            state.service = tabTrigger.getAttribute('data-service');
            resetAndRender();
            return;
        }
        if (drawerTrigger) {
            event.preventDefault();
            openDrawer(drawerTrigger.getAttribute('data-drawer-service'));
            return;
        }
        if (drawerClose || event.target.id === 'upsellDrawer') {
            closeDrawer();
            return;
        }
        if (card) {
            showDetails(card.getAttribute('data-event-id'));
            return;
        }
        if (removeFilter) {
            var filterName = removeFilter.getAttribute('data-remove-filter');
            if (filterName === 'manager') {
                state.filters.manager = '';
                managerFilter.value = '';
            } else {
                state.filters.types = state.filters.types.filter(function (selected) {
                    return selected.service + ':' + selected.type !== filterName;
                });
            }
            state.filtersApplied = !!state.filters.manager || state.filters.types.length > 0;
            resetAndRender();
            return;
        }
        if (typeHeading) {
            if (state.service !== 'all') return;
            var options = typeHeading.nextElementSibling;
            var isHidden = options.classList.toggle('hide');
            typeHeading.setAttribute('aria-expanded', String(!isHidden));
            return;
        }
        if (!event.target.closest('#deal-filter-menu') && !event.target.closest('#button-basic')) {
            filterPanel.classList.remove('is-open');
            filterToggle.setAttribute('aria-expanded', 'false');
        }
        if (openDropdown && !event.target.closest('.dropdown, .btn-group')) openDropdown.classList.remove('open');
    });

    filterToggle.addEventListener('click', function () {
        filterPanel.classList.toggle('is-open');
        filterToggle.setAttribute('aria-expanded', String(filterPanel.classList.contains('is-open')));
    });

    filterScrollWrap.addEventListener('scroll', function () {
        filterFixedTop.classList.toggle('is-scrolled', filterScrollWrap.scrollTop > 0);
    });

    document.getElementById('applyFilters').addEventListener('click', function () {
        state.filters.manager = managerFilter.value;
        state.filters.types = Array.prototype.slice.call(typeGroups.querySelectorAll('input:checked')).map(function (input) {
            return { service: input.getAttribute('data-filter-service'), type: input.value };
        });
        state.filtersApplied = !!state.filters.manager || state.filters.types.length > 0;
        filterPanel.classList.remove('is-open');
        filterToggle.setAttribute('aria-expanded', 'false');
        resetAndRender();
    });

    document.getElementById('resetFilters').addEventListener('click', function () {
        state.filters = { manager: '', types: [] };
        state.filtersApplied = false;
        managerFilter.value = '';
        resetAndRender();
    });

    document.getElementById('closeFilters').addEventListener('click', function () {
        filterPanel.classList.remove('is-open');
        filterToggle.setAttribute('aria-expanded', 'false');
    });

    function updateSearch() {
        state.search = activitySearch.value.trim();
        resetAndRender();
    }

    activitySearch.addEventListener('input', updateSearch);
    activitySearch.addEventListener('search', updateSearch);

    window.addEventListener('scroll', function () {
        loadMoreIfNeeded();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeModals();
            closeDrawer();
            filterPanel.classList.remove('is-open');
            filterToggle.setAttribute('aria-expanded', 'false');
        }
    });

    renderTabs();
    renderTypeGroups();
    renderFeed();
}());
