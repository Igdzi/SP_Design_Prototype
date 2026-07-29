(function () {
    'use strict';

    var currentUser = 'Юрій Кіслицин';

    var state = {
        canPublishAnnouncements: true,
        feedVisible: 20,
        feedPageSize: 20,
        feedPeriod: 'сьогодні',
        currentAnnId: null,
        editingAnnId: null
    };


    /* icon + label + accent color for the activity-service-icon / activity-badge components
       (ported from ../CRM_History-Event-Page — see its prototype.css "ACTIVITY FEED" section).
       Icons are the actual SendPulse product SVGs from ../CRM_History-Event-Page/assets/icons/
       (confirmed 1:1 against Figma node-ids 5372-32082/32103/32179/32134/32239/32269/32593/32567/5375-32630). */
    var serviceMeta = {
        crm: { label: 'CRM', icon: 'assets/icons/i-crm.svg' },
        email: { label: 'Розсилки', icon: 'assets/icons/i-email.svg' },
        automation: { label: 'Automation', icon: 'assets/icons/i-automation.svg' },
        chatbots: { label: 'Чат-боти', icon: 'assets/icons/i-chatbots.svg' },
        sites: { label: 'Сайти', icon: 'assets/icons/i-websites.svg' },
        popups: { label: 'Попапи', icon: 'assets/icons/i-pop-ups.svg' },
        smtp: { label: 'SMTP', icon: 'assets/icons/i-smtp.svg' },
        push: { label: 'Push', icon: 'assets/icons/i-push.svg' },
        edu: { label: 'Курси', icon: 'assets/icons/i-courses.svg' }
    };

    var prioLabel = { normal: 'Інформаційний', important: 'Важливий', urgent: 'Терміновий' };

    /* ── MOCK DATA: ANNOUNCEMENTS ── */
    var announcements = [
        ann(1, 'urgent', 'Олена Коваль', '21.07.2026 18:30',
            'Завтра о 14:00 загальна нарада відділу продажів. Обговорюємо нові тарифи та KPI на серпень. Обов\'язкова участь.',
            true, 'assets/illustrations/ann-sample-image.svg'),
        ann(2, 'important', 'Максим Литвин', '20.07.2026 10:15',
            'Оновлення CRM: додано інтеграцію з Telegram-ботом. Тепер менеджери можуть отримувати сповіщення про нові угоди та завдання прямо у Telegram. Деталі у базі знань.',
            false),
        ann(3, 'normal', currentUser, '19.07.2026 09:00',
            'Нагадуємо: до кінця липня необхідно заповнити анкету самооцінки. Посилання надіслано на корпоративну пошту.',
            false)
    ];

    function ann(id, priority, author, date, text, hasImage, image) {
        return { id: id, priority: priority, author: author, date: date, text: text, hasImage: hasImage, image: image || null, status: 'active' };
    }

    /* ── MOCK DATA: FEED EVENTS (content ported verbatim from ../CRM_History-Event-Page/scripts/prototype.js) ── */
    var feedEvents = [
        serviceEvent('crm', 'Юрій Коваленко', 'закрив угоду', 'Інтеграція API для ТОВ «Техносвіт»', 'Сума: 42 000 грн, етап: Won', 'сьогодні', '14:28'),
        serviceEvent('email', 'Марина Савченко', 'запустила кампанію', 'Травнева промо-розсилка', '18 420 отримувачів, сегмент: Активні клієнти', 'сьогодні', '13:51'),
        serviceEvent('automation', 'Ігор Мельник', 'запустив сценарій', 'Реактивація лідів після демо', 'Тригер: зміна етапу угоди', 'сьогодні', '13:12'),
        serviceEvent('chatbots', 'Олена Петренко', 'додала тег контакту', 'Запит ціни у Telegram-боті', 'Тег: hot-lead, канал: Telegram', 'сьогодні', '12:40'),
        serviceEvent('sites', 'Марина Савченко', 'опублікувала сторінку', 'Лендінг для весняної акції', 'Домен: promo.example.com', 'сьогодні', '12:05'),
        serviceEvent('popups', 'Олена Петренко', 'оновила правило показу', 'Попап для сегменту «Нові відвідувачі»', 'Показ після 20 секунд на сайті', 'сьогодні', '11:42'),
        serviceEvent('smtp', 'Юрій Коваленко', 'підтвердив домен', 'mail.technosvit.ua', 'SPF і DKIM активні', 'сьогодні', '11:31'),
        serviceEvent('edu', 'Ігор Мельник', 'опублікував урок', 'Модуль 3: Автоматизація продажів', 'Курс: CRM для відділу продажів', 'сьогодні', '11:18'),
        serviceEvent('crm', 'Олена Петренко', 'перенесла угоду', 'Підключення чат-бота для «Green Market»', 'З етапу Demo до етапу Contract', 'сьогодні', '09:42'),
        serviceEvent('crm', 'Юрій Коваленко', 'створив угоду', 'Постачання меблів «Офіс Комфорт»', 'Сума: 280 000 грн, етап: Нова заявка', 'вчора', '17:05'),
        serviceEvent('email', 'Марина Савченко', 'запланувала розсилку', 'Літня знижка -20%', '9 800 отримувачів, сегмент: Всі клієнти', 'вчора', '15:30'),
        serviceEvent('crm', 'Ігор Мельник', 'закрив угоду', 'Розширення ліцензії «Медіа Груп»', 'Сума: 620 000 грн, етап: Won', 'вчора', '14:12'),
        serviceEvent('smtp', 'Олена Петренко', 'підтвердила домен', 'mail.mediagroup.ua', 'SPF і DKIM активні', 'вчора', '10:15')
    ];

    function serviceEvent(service, author, action, entity, details, dateLabel, time) {
        return {
            type: 'service', service: service, author: author, action: action, entity: entity, details: details,
            dateLabel: dateLabel, time: time, typeLabel: serviceMeta[service].label, title: entity,
            detail: [['Автор', author], ['Подія', action], ['Деталі', details]]
        };
    }

    feedEvents.forEach(function (event, index) { event._id = index; });

    /* ── MOCK DATA: MY DAY ── */
    /* priority: high (Високий, red, arrow-up) / medium (Середній, amber, arrow-right-circle) / low (Низький, gray, arrow-down) */
    var taskPriorityMeta = {
        high: { label: 'Високий', icon: 'icon-arrow-up', color: '#d94b4d' },
        medium: { label: 'Середній', icon: 'icon-arrow-right-circle', color: '#e3a92d' },
        low: { label: 'Низький', icon: 'icon-arrow-down', color: '#91a4a5' }
    };

    var linkTypeIcon = { deal: 'icon-deal', task: 'icon-task', contact: 'icon-contact' };
    var linkTypeCountLabel = { deal: 'Угоди', contact: 'Контакти', task: 'Задач' };

    /* "item / board" indicator colors — exact hex values from Figma node-id 6088-1396 (the "item / board" component set). */
    var boardColors = {
        '01-Gray': '#b1b1b1',
        '02-Blue': '#7eb7ff',
        '03-Cyan/Light Blue': '#77ceff',
        '04-Mint/Turquoise': '#58d8f2',
        '05-Light Green/Lime': '#a3e1a2',
        '06-Mustard/Gold': '#efc14e',
        '07-Yellow': '#dad001',
        '08-Orange': '#ec8c32',
        '09-Coral/Salmon': '#ff8565',
        '10-Pink': '#f08bf9',
        '11-Lavender': '#9593ff',
        '12-Purple': '#866cbf'
    };

    var tasks = [
        {
            id: 't1', name: 'Зателефонувати клієнту «Бета Трейд»', done: false, priority: 'high',
            dateStart: '21 липня, 17:00', dateEnd: null, dateSort: 1,
            board: { name: 'Продажі Q3', color: '02-Blue' },
            links: []
        },
        {
            id: 't2', name: 'Узгодити договір з юристами', done: false, priority: 'medium',
            dateStart: '21 липня, 16:00', dateEnd: '22 липня, 10:00', dateSort: 2,
            board: { name: 'Продажі Q3', color: '02-Blue' },
            links: []
        },
        {
            id: 't3', name: 'Підготувати комерційну пропозицію', done: false, priority: 'high',
            dateStart: '22 липня, 14:00', dateEnd: null, dateSort: 3,
            board: { name: 'Постачання', color: '04-Mint/Turquoise' },
            links: [{ type: 'deal', name: 'Постачання обладнання для «Агро-Тех»', drawerKey: 'deal-1' }]
        },
        {
            id: 't4', name: 'Провести демо для «Медіа Груп»', done: false, priority: 'low',
            dateStart: '22 липня, 16:00', dateEnd: null, dateSort: 4,
            board: { name: 'Маркетинг', color: '09-Coral/Salmon' },
            links: [{ type: 'contact', name: 'Оксана Терещенко' }]
        },
        {
            id: 't5', name: 'Надіслати рахунок ТОВ «Прогрес»', done: false, priority: 'medium',
            dateStart: null, dateEnd: null, dateSort: 5,
            board: { name: 'Задачі на літо', color: '03-Cyan/Light Blue' },
            links: { deal: 2, contact: 1, task: 3 }
        },
        {
            id: 't6', name: 'Оновити прайс-лист для дилерів', done: false, priority: 'medium',
            dateStart: '23 липня, 11:00', dateEnd: null, dateSort: 6,
            board: { name: 'Продажі Q3', color: '02-Blue' },
            links: []
        },
        {
            id: 't7', name: 'Погодити знижку для «Агро-Тех»', done: false, priority: 'high',
            dateStart: '23 липня, 15:00', dateEnd: null, dateSort: 7,
            board: { name: 'Постачання', color: '04-Mint/Turquoise' },
            links: [{ type: 'deal', name: 'Постачання обладнання для «Агро-Тех»', drawerKey: 'deal-1' }]
        },
        {
            id: 't8', name: 'Заповнити звіт по воронці за тиждень', done: false, priority: 'low',
            dateStart: '24 липня, 10:00', dateEnd: null, dateSort: 8,
            board: { name: 'Задачі на літо', color: '03-Cyan/Light Blue' },
            links: []
        }
    ];

    /* ── RESERVE QUEUE: backfills the Мій день task list as items are completed,
       so the panel keeps showing 8 tasks until the queue runs dry — then it shortens. ── */
    var taskQueue = [
        {
            id: 't9', name: 'Провести співбесіду з кандидатом', done: false, priority: 'medium',
            dateStart: '24 липня, 13:00', dateEnd: null, dateSort: 9,
            board: { name: 'Продажі Q3', color: '02-Blue' },
            links: []
        },
        {
            id: 't10', name: 'Підготувати звіт по маркетингу', done: false, priority: 'low',
            dateStart: '24 липня, 15:00', dateEnd: null, dateSort: 10,
            board: { name: 'Маркетинг', color: '09-Coral/Salmon' },
            links: []
        },
        {
            id: 't11', name: 'Узгодити терміни постачання з «Дата Хаб»', done: false, priority: 'high',
            dateStart: '25 липня, 10:00', dateEnd: null, dateSort: 11,
            board: { name: 'Постачання', color: '04-Mint/Turquoise' },
            links: [{ type: 'deal', name: 'Постачання серверів «Дата Хаб»', drawerKey: 'deal-7' }]
        },
        {
            id: 't12', name: 'Оновити CRM-профіль клієнта', done: false, priority: 'medium',
            dateStart: '25 липня, 12:00', dateEnd: null, dateSort: 12,
            board: { name: 'Задачі на літо', color: '03-Cyan/Light Blue' },
            links: []
        }
    ];

    var deadlineDeals = [
        {
            id: 'deal-3', name: 'Пілотний проєкт «Digital Solutions»',
            board: { name: 'Продажі', color: '10-Pink' }, amount: '400 000 UAH',
            dateLabel: 'До 19 Липня, 12:00', dateSort: 20260719,
            products: null
        },
        {
            id: 'deal-2', name: 'Річний контракт ТОВ «Бета Трейд»',
            board: { name: 'Продажі', color: '02-Blue' }, amount: '840 000 UAH',
            dateLabel: 'До 20 Липня, 17:00', dateSort: 20260720,
            products: null
        },
        {
            id: 'deal-1', name: 'Постачання обладнання для «Агро-Тех»',
            board: { name: 'Постачання', color: '04-Mint/Turquoise' }, amount: '1 200 000 UAH',
            dateLabel: 'До 21 Липня, 15:30', dateSort: 20260721,
            products: [{ name: 'Лінія розливу L-2000', price: '1 200 000', currency: 'UAH' }]
        },
        {
            id: 'deal-4', name: 'Постачання меблів «Офіс Комфорт»',
            board: { name: 'Постачання', color: '04-Mint/Turquoise' }, amount: '280 000 UAH',
            dateLabel: 'До 23 Липня, 10:00', dateSort: 20260723,
            products: { count: 5, total: '280 000', currency: 'UAH' }
        },
        {
            id: 'deal-5', name: 'Розширення ліцензії «Медіа Груп»',
            board: { name: 'Продажі', color: '12-Purple' }, amount: '620 000 UAH',
            dateLabel: 'До 26 Липня, 14:00', dateSort: 20260726,
            products: [{ name: 'Розширена ліцензія CRM x50', price: '620 000', currency: 'UAH' }]
        },
        {
            id: 'deal-6', name: 'Оновлення ліцензії «Технопром»',
            board: { name: 'Продажі', color: '06-Mustard/Gold' }, amount: '150 000 UAH',
            dateLabel: 'До 27 Липня, 12:00', dateSort: 20260727,
            products: { count: 1, total: '150 000', currency: 'UAH' }
        },
        {
            id: 'deal-7', name: 'Постачання серверів «Дата Хаб»',
            board: { name: 'Постачання', color: '08-Orange' }, amount: '2 100 000 UAH',
            dateLabel: 'До 28 Липня, 09:00', dateSort: 20260728,
            products: [{ name: 'Сервери Dell PowerEdge x6', price: '2 100 000', currency: 'UAH' }]
        },
        {
            id: 'deal-8', name: 'Продовження підписки «Нова Пошта Софт»',
            board: { name: 'Продажі', color: '11-Lavender' }, amount: '95 000 UAH',
            dateLabel: 'До 29 Липня, 16:00', dateSort: 20260729,
            products: { count: 2, total: '95 000', currency: 'UAH' }
        }
    ];

    /* ── PROTOTYPE-ONLY: pristine snapshot for the state switcher (full ⇄ empty) ── */
    var protoInitialState = {
        announcements: JSON.parse(JSON.stringify(announcements)),
        tasks: JSON.parse(JSON.stringify(tasks)),
        taskQueue: JSON.parse(JSON.stringify(taskQueue)),
        deadlineDeals: JSON.parse(JSON.stringify(deadlineDeals)),
        feedEvents: JSON.parse(JSON.stringify(feedEvents))
    };

    /* ── DRAWER CONTENT (deal / task / contact / call) ── */
    var drawerData = {
        'deal-1': {
            type: 'Угода',
            title: 'Постачання обладнання для «Агро-Тех»',
            rows: [
                ['Сума', '<strong>1 200 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-green"></span> Переговори'],
                ['Дедлайн', '21.07.2026'],
                ['Контакт', 'Петро Сидоренко, «Агро-Тех»'],
                ['Відповідальний', currentUser]
            ],
            comments: ['Клієнт просить знижку 5% — узгоджуємо з керівником відділу.']
        },
        'deal-2': {
            type: 'Угода',
            title: 'Річний контракт ТОВ «Бета Трейд»',
            rows: [
                ['Сума', '<strong>840 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-blue"></span> КП відправлено'],
                ['Дедлайн', '20.07.2026'],
                ['Контакт', 'Іван Мороз']
            ],
            comments: []
        },
        'deal-3': {
            type: 'Угода',
            title: 'Пілотний проєкт «Digital Solutions»',
            rows: [
                ['Сума', '<strong>400 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-orange"></span> Рахунок виставлено'],
                ['Дедлайн', '19.07.2026'],
                ['Контакт', 'Анна Шевченко']
            ],
            comments: []
        },
        'deal-4': {
            type: 'Угода',
            title: 'Постачання меблів «Офіс Комфорт»',
            rows: [
                ['Сума', '<strong>280 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-blue"></span> Нова заявка'],
                ['Дедлайн', '23.07.2026'],
                ['Контакт', 'Сергій Павленко']
            ],
            comments: []
        },
        'deal-5': {
            type: 'Угода',
            title: 'Розширення ліцензії «Медіа Груп»',
            rows: [
                ['Сума', '<strong>620 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-green"></span> Переговори'],
                ['Дедлайн', '26.07.2026'],
                ['Контакт', 'Оксана Терещенко']
            ],
            comments: []
        },
        'deal-6': {
            type: 'Угода',
            title: 'Оновлення ліцензії «Технопром»',
            rows: [
                ['Сума', '<strong>150 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-blue"></span> КП відправлено'],
                ['Дедлайн', '27.07.2026'],
                ['Контакт', 'Дмитро Гнатюк']
            ],
            comments: []
        },
        'deal-7': {
            type: 'Угода',
            title: 'Постачання серверів «Дата Хаб»',
            rows: [
                ['Сума', '<strong>2 100 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-orange"></span> Рахунок виставлено'],
                ['Дедлайн', '28.07.2026'],
                ['Контакт', 'Роман Клименко']
            ],
            comments: []
        },
        'deal-8': {
            type: 'Угода',
            title: 'Продовження підписки «Нова Пошта Софт»',
            rows: [
                ['Сума', '<strong>95 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-green"></span> Переговори'],
                ['Дедлайн', '29.07.2026'],
                ['Контакт', 'Наталія Бойко']
            ],
            comments: []
        },
        't1': {
            type: 'Завдання',
            title: 'Зателефонувати клієнту «Бета Трейд»',
            rows: [
                ['Статус', '<span class="label label-danger">Прострочено</span>'],
                ['Дедлайн', 'вчора 17:00'],
                ['Контакт', 'Іван Мороз']
            ],
            comments: []
        },
        't2': {
            type: 'Завдання',
            title: 'Узгодити договір з юристами',
            rows: [
                ['Статус', '<span class="label label-danger">Прострочено</span>'],
                ['Дедлайн', 'вчора 16:00'],
                ['Відповідальний', currentUser],
                ['Угода', '<a href="#" data-open-drawer="deal-2">Річний контракт ТОВ «Бета Трейд»</a>']
            ],
            comments: []
        },
        't3': {
            type: 'Завдання',
            title: 'Підготувати комерційну пропозицію',
            rows: [
                ['Статус', '<span class="label label-primary">В роботі</span>'],
                ['Дедлайн', '21.07.2026 14:00'],
                ['Відповідальний', currentUser],
                ['Угода', '<a href="#" data-open-drawer="deal-1">Постачання обладнання для «Агро-Тех»</a>']
            ],
            comments: []
        },
        't4': {
            type: 'Завдання',
            title: 'Провести демо для «Медіа Груп»',
            rows: [
                ['Статус', '<span class="label label-primary">В роботі</span>'],
                ['Дедлайн', '21.07.2026 16:00'],
                ['Відповідальний', currentUser]
            ],
            comments: []
        },
        't5': {
            type: 'Завдання',
            title: 'Надіслати рахунок ТОВ «Прогрес»',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '21.07.2026 18:00']
            ],
            comments: []
        },
        't6': {
            type: 'Завдання',
            title: 'Оновити прайс-лист для дилерів',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '23.07.2026 11:00'],
                ['Відповідальний', currentUser]
            ],
            comments: []
        },
        't7': {
            type: 'Завдання',
            title: 'Погодити знижку для «Агро-Тех»',
            rows: [
                ['Статус', '<span class="label label-primary">В роботі</span>'],
                ['Дедлайн', '23.07.2026 15:00'],
                ['Відповідальний', currentUser],
                ['Угода', '<a href="#" data-open-drawer="deal-1">Постачання обладнання для «Агро-Тех»</a>']
            ],
            comments: []
        },
        't8': {
            type: 'Завдання',
            title: 'Заповнити звіт по воронці за тиждень',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '24.07.2026 10:00']
            ],
            comments: []
        },
        't9': {
            type: 'Завдання',
            title: 'Провести співбесіду з кандидатом',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '24.07.2026 13:00']
            ],
            comments: []
        },
        't10': {
            type: 'Завдання',
            title: 'Підготувати звіт по маркетингу',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '24.07.2026 15:00']
            ],
            comments: []
        },
        't11': {
            type: 'Завдання',
            title: 'Узгодити терміни постачання з «Дата Хаб»',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '25.07.2026 10:00'],
                ['Угода', '<a href="#" data-open-drawer="deal-7">Постачання серверів «Дата Хаб»</a>']
            ],
            comments: []
        },
        't12': {
            type: 'Завдання',
            title: 'Оновити CRM-профіль клієнта',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '25.07.2026 12:00']
            ],
            comments: []
        },
        'contact-anna': {
            type: 'Контакт',
            title: 'Анна Шевченко',
            rows: [
                ['Компанія', '«Digital Solutions»'],
                ['Джерело', 'вручну'],
                ['Додано', currentUser]
            ],
            comments: []
        },
        'call-1': {
            type: 'Дзвінок',
            title: 'Вихідний дзвінок — Іван Мороз',
            rows: [
                ['Тривалість', '4 хв 12 сек'],
                ['Контакт', 'Іван Мороз'],
                ['Менеджер', currentUser],
                ['Запис', '<a href="#">▶ Прослухати запис</a>']
            ],
            comments: []
        }
    };

    /* ── HELPERS ── */
    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
    }

    function truncate(value, len) {
        return value.length > len ? value.slice(0, len).trim() + '…' : value;
    }

    function sortByField(list, sortField) {
        return list.slice().sort(function (a, b) { return a[sortField] - b[sortField]; });
    }

    /* ── DOM REFS ── */
    var annGrid = document.getElementById('annGrid');
    var annSecCount = document.getElementById('annSecCount');
    var annSection = document.getElementById('pulseAnnouncements');
    var feedListEl = document.getElementById('feedList');
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    var feedPeriodMenu = document.getElementById('feedPeriodMenu');
    var tasksPanelBody = document.getElementById('tasksPanelBody');
    var dealsPanelBody = document.getElementById('dealsPanelBody');
    var addAnnItem = document.getElementById('addAnnItem');
    var addAnnDivider = document.getElementById('addAnnDivider');

    /* ── RENDER: ANNOUNCEMENTS ── */
    function activeAnnouncements() {
        return announcements.filter(function (a) { return a.status === 'active'; });
    }

    function renderAnnouncements() {
        var active = activeAnnouncements();
        annSection.classList.toggle('hide', active.length === 0);
        annSecCount.textContent = active.length ? active.length : '';
        annGrid.innerHTML = active.map(function (a) {
            return '<div class="pulse-ann-card prio-' + a.priority + '" data-open-ann="' + a.id + '">' +
                '<div class="pulse-ann-card-head">' +
                '<span class="pulse-prio-badge">' + prioLabel[a.priority] + '</span>' +
                '<span class="pulse-ann-card-date">' + a.date + '</span>' +
                '</div>' +
                '<div class="pulse-ann-card-body">' +
                '<div class="pulse-ann-card-author">' + escapeHtml(a.author) + '</div>' +
                '<div class="pulse-ann-card-text">' + escapeHtml(a.text) + '</div>' +
                '</div>' +
                '</div>';
        }).join('');
    }

    /* ── RENDER: FEED LIST (activity-feed components ported from ../CRM_History-Event-Page) ── */
    function renderFeed() {
        var periodEvents = feedEvents.filter(function (event) { return event.dateLabel === state.feedPeriod; });
        var visible = periodEvents.slice(0, state.feedVisible);

        feedListEl.innerHTML = visible.map(renderEventRow).join('') || '<div class="alert alert-info">Немає даних для відображення</div>';

        var hasMore = periodEvents.length > state.feedVisible;
        loadMoreBtn.classList.toggle('hide', !hasMore);

        feedPeriodMenu.querySelectorAll('[data-period]').forEach(function (link) {
            link.classList.toggle('disabled', feedEvents.length === 0);
        });
    }

    function selectFeedPeriod(period) {
        if (state.feedPeriod === period) return;
        state.feedPeriod = period;
        state.feedVisible = state.feedPageSize;
        feedPeriodMenu.querySelectorAll('[data-period]').forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('data-period') === period);
        });
        renderFeed();
    }

    function renderEventRow(event) {
        var svc = serviceMeta[event.service];
        var clickAttr = event.type === 'email' ? ' data-open-mail="1"' : ' data-feed-drawer="' + event._id + '"';
        return '<article class="activity-event"' + clickAttr + '>' +
            '<span class="activity-service-icon service-' + event.service + '"><img src="' + svc.icon + '" alt=""></span>' +
            '<div class="activity-event-main">' +
            '<div class="activity-event-text"><span class="activity-event-author">' + escapeHtml(event.author) + '</span> ' + escapeHtml(event.action) + ' <strong>' + escapeHtml(event.entity) + '</strong></div>' +
            '<div class="activity-event-meta"><span class="activity-badge service-' + event.service + '">' + svc.label + '</span><span class="activity-details"><strong>Деталі:</strong> ' + escapeHtml(event.details) + '</span></div>' +
            '</div>' +
            '<time class="activity-time">' + event.time + '</time>' +
            '</article>';
    }

    function loadMoreFeed() {
        state.feedVisible += state.feedPageSize;
        renderFeed();
    }

    /* ── RENDER: MY DAY ── */
    function taskLinksSegment(links) {
        if (!links) return null;
        var counts = {};
        var singleType = null, singleName = null, total = 0;
        if (Array.isArray(links)) {
            if (!links.length) return null;
            if (links.length === 1) {
                singleType = links[0].type;
                singleName = links[0].name;
                total = 1;
            } else {
                links.forEach(function (l) { counts[l.type] = (counts[l.type] || 0) + 1; total++; });
            }
        } else {
            Object.keys(links).forEach(function (type) {
                if (links[type] > 0) { counts[type] = links[type]; total += links[type]; }
            });
        }
        if (!total) return null;
        if (singleName) return { icon: linkTypeIcon[singleType], text: escapeHtml(singleName) };
        var order = ['deal', 'contact', 'task'];
        var parts = order.filter(function (type) { return counts[type]; })
            .map(function (type) { return counts[type] + ' ' + linkTypeCountLabel[type]; });
        return { icon: 'icon-link', text: parts.join(', ') };
    }

    function taskMetaHtml(t) {
        var segments = [];

        if (t.board) {
            segments.push({ boardColor: boardColors[t.board.color] || '#9ca3af', text: escapeHtml(t.board.name) });
        }

        var prio = taskPriorityMeta[t.priority];
        segments.push({ icon: prio.icon, text: prio.label, color: prio.color });

        if (t.dateStart) {
            segments.push({ icon: 'icon-calendar', text: t.dateEnd ? (t.dateStart + ' - ' + t.dateEnd) : t.dateStart });
        }

        var linkSeg = taskLinksSegment(t.links);
        if (linkSeg) segments.push({ icon: linkSeg.icon, text: linkSeg.text });

        return segments.map(function (seg, index) {
            var dot = index > 0 ? '<span class="pulse-meta-dot"></span>' : '';
            var marker = seg.boardColor
                ? '<span class="pulse-board-dot" style="background:' + seg.boardColor + '"></span>'
                : '<span class="sp-icon ' + seg.icon + '"' + (seg.color ? ' style="color:' + seg.color + '"' : '') + '></span>';
            return dot + '<span class="pulse-meta-value">' + marker + seg.text + '</span>';
        }).join('');
    }

    function renderTasks(enteringId) {
        if (!tasks.length) {
            tasksPanelBody.innerHTML = emptyState('assets/illustrations/ic-empty-task.svg', 'У вас немає завдань');
            return;
        }
        var sorted = sortByField(tasks, 'dateSort').slice(0, 8);
        tasksPanelBody.innerHTML = sorted.map(function (t) {
            var enteringClass = t.id === enteringId ? ' is-entering' : '';
            return '<div class="pulse-row pulse-row-task' + (t.done ? ' is-done' : '') + enteringClass + '" data-open-drawer="' + t.id + '">' +
                '<div class="pulse-task-row-top">' +
                '<input type="checkbox" class="pulse-checkbox" data-task-check="' + t.id + '"' + (t.done ? ' checked' : '') + '>' +
                '<span class="pulse-task-title">' + escapeHtml(t.name) + '</span>' +
                '</div>' +
                '<div class="pulse-task-meta">' + taskMetaHtml(t) + '</div>' +
                '</div>';
        }).join('');

        if (enteringId) {
            var enteringRow = tasksPanelBody.querySelector('[data-open-drawer="' + enteringId + '"]');
            if (enteringRow) {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        enteringRow.classList.remove('is-entering');
                    });
                });
            }
        }
    }

    function dealProductsSegment(products) {
        if (!products) return null;
        if (Array.isArray(products)) {
            if (!products.length) return null;
            var p = products[0];
            return { icon: 'icon-cart', text: escapeHtml(p.name) + ' - ' + p.price + ' ' + p.currency };
        }
        if (!products.count) return null;
        return { icon: 'icon-cart', text: products.count + ' товара, сума: ' + products.total + ' ' + products.currency };
    }

    function dealMetaHtml(d) {
        var segments = [];
        segments.push({ boardColor: boardColors[d.board.color] || '#9ca3af', text: escapeHtml(d.board.name) });
        segments.push({ icon: 'icon-pay-wallet', text: d.amount });
        segments.push({ icon: 'icon-alarm-clock', text: d.dateLabel });

        var productSeg = dealProductsSegment(d.products);
        if (productSeg) segments.push(productSeg);

        return segments.map(function (seg, index) {
            var dot = index > 0 ? '<span class="pulse-meta-dot"></span>' : '';
            var marker = seg.boardColor
                ? '<span class="pulse-board-dot" style="background:' + seg.boardColor + '"></span>'
                : '<span class="sp-icon ' + seg.icon + '"></span>';
            return dot + '<span class="pulse-meta-value">' + marker + seg.text + '</span>';
        }).join('');
    }

    function renderDeals() {
        if (!deadlineDeals.length) {
            dealsPanelBody.innerHTML = emptyState('assets/illustrations/ic-empty-deal.svg', 'У вас немає угод з дедлайном');
            return;
        }
        var sorted = sortByField(deadlineDeals, 'dateSort').slice(0, 8);
        dealsPanelBody.innerHTML = sorted.map(function (d) {
            return '<div class="pulse-row pulse-row-deal" data-open-drawer="' + d.id + '">' +
                '<span class="pulse-task-title">' + escapeHtml(d.name) + '</span>' +
                '<div class="pulse-task-meta">' + dealMetaHtml(d) + '</div>' +
                '</div>';
        }).join('');
    }

    function emptyState(illustration, text) {
        return '<div class="pulse-empty"><img src="' + illustration + '" alt="" width="200" height="200"><span class="pulse-empty-text">' + text + '</span></div>';
    }

    /* ── ANNOUNCEMENT DETAIL MODAL ── */
    function openAnnDetail(id) {
        var a = announcements.filter(function (item) { return item.id === Number(id); })[0];
        if (!a) return;
        state.currentAnnId = a.id;

        var card = document.getElementById('annDetailCard');
        card.className = 'crm-modal-page pulse-ann-modal prio-' + a.priority;

        document.getElementById('annDetailBadge').textContent = prioLabel[a.priority];
        document.getElementById('annDetailBadge').className = 'pulse-prio-badge prio-' + a.priority;
        document.getElementById('annDetailMeta').innerHTML = '<strong>' + escapeHtml(a.author) + '</strong> · <span class="pulse-ann-modal-date">' + a.date + '</span>';
        document.getElementById('annDetailText').textContent = a.text;

        var imgBlock = document.getElementById('annDetailImg');
        if (a.hasImage && a.image) {
            imgBlock.style.display = 'block';
            imgBlock.innerHTML = '<img src="' + a.image + '" alt="">';
        } else {
            imgBlock.style.display = 'none';
            imgBlock.innerHTML = '';
        }

        var canManage = a.author === currentUser;
        document.getElementById('annDetailAuthorActions').classList.toggle('hide', !canManage);

        hideAnnConfirmPopover();
        openModal('#annDetailModal');
    }

    function editAnn() {
        var a = announcements.filter(function (item) { return item.id === state.currentAnnId; })[0];
        if (!a) return;
        state.editingAnnId = a.id;
        closeModals();
        document.getElementById('annFormTitle').textContent = 'Редагувати анонс';
        document.getElementById('annText').value = a.text;
        document.getElementById('annPriority').value = a.priority;
        document.getElementById('annExpiry').value = '';
        var submitBtn = document.getElementById('annSubmitBtn');
        submitBtn.textContent = 'Зберегти';
        submitBtn.classList.remove('btn-create');
        submitBtn.classList.add('btn-save');
        document.getElementById('annCancelBtn').textContent = 'Скасувати редагування';
        openModal('#annFormModal');
    }

    function cancelAnnForm() {
        var backId = state.editingAnnId;
        state.editingAnnId = null;
        if (backId) {
            openAnnDetail(backId);
        } else {
            closeModals();
        }
    }

    function deleteAnn() {
        var a = announcements.filter(function (item) { return item.id === state.currentAnnId; })[0];
        if (!a) return;
        showAnnConfirmPopover();
    }

    function showAnnConfirmPopover() {
        var anchor = document.querySelector('#annDetailAuthorActions .pulse-actions-btn');
        var popover = document.getElementById('annConfirmBlock');
        popover.classList.remove('hide');
        if (anchor) {
            var rect = anchor.getBoundingClientRect();
            popover.style.top = (rect.bottom + 8) + 'px';
            popover.style.left = rect.left + 'px';
        }
    }

    function hideAnnConfirmPopover() {
        document.getElementById('annConfirmBlock').classList.add('hide');
    }

    function confirmAnnDelete() {
        var a = announcements.filter(function (item) { return item.id === state.currentAnnId; })[0];
        hideAnnConfirmPopover();
        if (!a) return;
        a.status = 'deleted';
        closeModals();
        renderAnnouncements();
        renderFeed();
    }

    /* ── ANNOUNCEMENT FORM ── */
    function openAnnForm() {
        state.editingAnnId = null;
        document.getElementById('annFormTitle').textContent = 'Новий анонс';
        resetAnnForm();
        var submitBtn = document.getElementById('annSubmitBtn');
        submitBtn.textContent = 'Опублікувати';
        submitBtn.classList.remove('btn-save');
        submitBtn.classList.add('btn-create');
        document.getElementById('annCancelBtn').textContent = 'Скасувати';
        openModal('#annFormModal');
    }

    function resetAnnForm() {
        document.getElementById('annForm').classList.remove('has-error');
        document.getElementById('annText').value = '';
        document.getElementById('annPriority').value = 'normal';
        document.getElementById('annExpiry').value = '';
        removeAnnImagePreview();
    }

    function submitAnnForm() {
        var textEl = document.getElementById('annText');
        var text = textEl.value.trim();
        if (!text) {
            document.getElementById('annForm').classList.add('has-error');
            textEl.focus();
            return;
        }

        var priority = document.getElementById('annPriority').value;
        var hasImage = document.getElementById('annImagePreview').style.display !== 'none';
        var image = hasImage ? document.getElementById('annImageThumb').src : null;
        var nowLabel = 'сьогодні ' + new Date().toTimeString().slice(0, 5);

        if (state.editingAnnId) {
            var existing = announcements.filter(function (item) { return item.id === state.editingAnnId; })[0];
            existing.text = text;
            existing.priority = priority;
            existing.hasImage = hasImage;
            existing.image = image;
        } else {
            var nextId = announcements.reduce(function (max, item) { return Math.max(max, item.id); }, 0) + 1;
            announcements.unshift({ id: nextId, priority: priority, author: currentUser, date: nowLabel, text: text, hasImage: hasImage, image: image, status: 'active' });
        }

        closeModals();
        renderAnnouncements();
        renderFeed();
    }

    function previewAnnImage(file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('annImageThumb').src = event.target.result;
            document.getElementById('annImagePreview').style.display = 'block';
            document.getElementById('annImageZone').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    function removeAnnImagePreview() {
        document.getElementById('annImageInput').value = '';
        document.getElementById('annImagePreview').style.display = 'none';
        document.getElementById('annImageZone').style.display = 'flex';
    }

    /* ── MODAL HELPERS (manual — matches CRM_History-Event-Page pattern) ── */
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
        hideAnnConfirmPopover();
    }

    function openModal(selector) {
        var modal = document.querySelector(selector);
        if (!modal) return;
        closeModals();
        var backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade in';
        document.body.appendChild(backdrop);
        document.body.classList.add('modal-open');
        modal.style.display = 'block';
        modal.removeAttribute('aria-hidden');
        modal.classList.add('in');
    }

    /* ── OBJECT DRAWER ── */
    function showObjectDrawer(typeLabel, title, rows, comments) {
        document.getElementById('objectDrawerType').textContent = typeLabel;
        document.getElementById('objectDrawerTitle').textContent = title;

        var rowsHtml = rows.map(function (row) {
            return '<div class="pulse-drawer-row"><span class="label">' + row[0] + '</span><span class="value">' + row[1] + '</span></div>';
        }).join('');

        var commentsHtml = '';
        if (comments && comments.length) {
            commentsHtml = '<div class="pulse-drawer-section-title">Коментарі</div>' + comments.map(function (comment) {
                return '<div class="pulse-drawer-comment">' + escapeHtml(comment) + '<div class="pulse-drawer-comment-meta">' + currentUser + '</div></div>';
            }).join('');
        }

        document.getElementById('objectDrawerBody').innerHTML = rowsHtml + commentsHtml;
        document.getElementById('objectDrawer').classList.add('is-open');
        document.getElementById('objectDrawer').setAttribute('aria-hidden', 'false');
    }

    function openDrawer(key) {
        var data = drawerData[key];
        if (!data) return;
        showObjectDrawer(data.type, data.title, data.rows, data.comments);
    }

    function openFeedDrawer(id) {
        var event = feedEvents.filter(function (item) { return item._id === id; })[0];
        if (!event || !event.detail) return;
        showObjectDrawer(event.typeLabel, event.title, event.detail, null);
    }

    function closeDrawer() {
        document.getElementById('objectDrawer').classList.remove('is-open');
        document.getElementById('objectDrawer').setAttribute('aria-hidden', 'true');
    }

    /* ── EVENT DELEGATION ── */
    document.addEventListener('click', function (event) {
        var dropdownTrigger = event.target.closest('[data-toggle="dropdown"]');
        var modalDismiss = event.target.closest('[data-dismiss="modal"]');
        var annCard = event.target.closest('[data-open-ann]');
        var drawerTrigger = event.target.closest('[data-open-drawer]');
        var feedDrawerTrigger = event.target.closest('[data-feed-drawer]');
        var mailTrigger = event.target.closest('[data-open-mail]');
        var drawerClose = event.target.closest('.activity-drawer-close');
        var taskCheck = event.target.closest('[data-task-check]');
        var periodTrigger = event.target.closest('#feedPeriodMenu [data-period]');
        var openDropdown = document.querySelector('.dropdown.open, .btn-group.open');

        if (periodTrigger) {
            event.preventDefault();
            selectFeedPeriod(periodTrigger.getAttribute('data-period'));
            return;
        }
        if (dropdownTrigger) {
            event.preventDefault();
            var dropdown = dropdownTrigger.closest('.dropdown');
            if (openDropdown && openDropdown !== dropdown) openDropdown.classList.remove('open');
            if (dropdown) dropdown.classList.toggle('open');
            return;
        }
        if (event.target.id === 'openAnnFormBtn') {
            event.preventDefault();
            if (openDropdown) openDropdown.classList.remove('open');
            openAnnForm();
            return;
        }
        if (event.target.closest('[data-add="deal"]')) { event.preventDefault(); alert('Відкриється форма створення угоди.'); return; }
        if (event.target.closest('[data-add="contact"]')) { event.preventDefault(); alert('Відкриється форма створення контакту.'); return; }
        if (event.target.closest('[data-add="task"]')) { event.preventDefault(); alert('Відкриється форма створення задачі.'); return; }
        if (event.target.closest('[data-add="pipeline"]')) { event.preventDefault(); alert('Відкриється форма створення воронки для угод.'); return; }
        if (event.target.closest('[data-add="board"]')) { event.preventDefault(); alert('Відкриється форма створення дошки для задач.'); return; }

        if (event.target.closest('#annEditBtn')) { event.preventDefault(); if (openDropdown) openDropdown.classList.remove('open'); editAnn(); return; }
        if (event.target.closest('#annDeleteBtn')) { event.preventDefault(); if (openDropdown) openDropdown.classList.remove('open'); deleteAnn(); return; }
        if (event.target.closest('#annConfirmYes')) { confirmAnnDelete(); return; }
        if (event.target.closest('#annConfirmNo')) { hideAnnConfirmPopover(); return; }
        if (event.target.closest('#annCancelBtn')) { cancelAnnForm(); return; }
        if (event.target.id === 'annSubmitBtn') { submitAnnForm(); return; }

        if (modalDismiss || event.target.classList.contains('modal')) {
            event.preventDefault();
            closeModals();
            return;
        }
        if (annCard) {
            event.preventDefault();
            openAnnDetail(annCard.getAttribute('data-open-ann'));
            return;
        }
        if (taskCheck) {
            var taskId = taskCheck.getAttribute('data-task-check');
            var t = tasks.filter(function (item) { return item.id === taskId; })[0];
            if (t) {
                t.done = taskCheck.checked;
                var row = taskCheck.closest('.pulse-row');
                row.classList.toggle('is-done', t.done);
                if (t.done) {
                    row.classList.add('is-leaving');
                    setTimeout(function () {
                        tasks = tasks.filter(function (item) { return item.id !== taskId; });
                        var nextTask = taskQueue.length ? taskQueue.shift() : null;
                        if (nextTask) tasks.push(nextTask);
                        renderTasks(nextTask && nextTask.id);
                    }, 300);
                }
            }
            return;
        }
        if (drawerTrigger && drawerTrigger.getAttribute('data-open-drawer')) {
            event.preventDefault();
            openDrawer(drawerTrigger.getAttribute('data-open-drawer'));
            return;
        }
        if (feedDrawerTrigger) {
            event.preventDefault();
            openFeedDrawer(Number(feedDrawerTrigger.getAttribute('data-feed-drawer')));
            return;
        }
        if (mailTrigger) {
            event.preventDefault();
            alert('Відкриється перегляд листа в розділі «Пошта».');
            return;
        }
        if (drawerClose || event.target.id === 'objectDrawer') {
            closeDrawer();
            return;
        }
        if (event.target.id === 'annImageZone' || event.target.closest('#annImageZone')) {
            document.getElementById('annImageInput').click();
            return;
        }
        if (event.target.id === 'annImageRemoveBtn') {
            removeAnnImagePreview();
            return;
        }
        if (openDropdown && !event.target.closest('.dropdown')) openDropdown.classList.remove('open');

        var confirmPopover = document.getElementById('annConfirmBlock');
        if (!confirmPopover.classList.contains('hide') && !event.target.closest('#annConfirmBlock') && !event.target.closest('#annDeleteBtn')) {
            hideAnnConfirmPopover();
        }
    });

    document.getElementById('annImageInput').addEventListener('change', function (event) {
        var file = event.target.files[0];
        if (file) previewAnnImage(file);
    });

    document.getElementById('loadMoreBtn').addEventListener('click', loadMoreFeed);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeModals();
            closeDrawer();
        }
    });

    /* ── ACCESS CONTROL: announcement publishing permission ── */
    if (!state.canPublishAnnouncements) {
        addAnnItem.classList.add('hide');
        addAnnDivider.classList.add('hide');
    }

    /* ── PROTOTYPE-ONLY: STATE SWITCHER (full mock data ⇄ empty states) ── */
    function applyProtoState(mode) {
        if (mode === 'empty') {
            announcements = [];
            tasks = [];
            taskQueue = [];
            deadlineDeals = [];
            feedEvents = [];
        } else {
            announcements = JSON.parse(JSON.stringify(protoInitialState.announcements));
            tasks = JSON.parse(JSON.stringify(protoInitialState.tasks));
            taskQueue = JSON.parse(JSON.stringify(protoInitialState.taskQueue));
            deadlineDeals = JSON.parse(JSON.stringify(protoInitialState.deadlineDeals));
            feedEvents = JSON.parse(JSON.stringify(protoInitialState.feedEvents));
        }
        state.feedVisible = state.feedPageSize;
        state.feedPeriod = 'сьогодні';
        feedPeriodMenu.querySelectorAll('[data-period]').forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('data-period') === state.feedPeriod);
        });
        renderAnnouncements();
        renderTasks();
        renderDeals();
        renderFeed();
    }

    document.querySelectorAll('#protoStatePanel [data-proto-state]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('#protoStatePanel [data-proto-state]').forEach(function (b) {
                b.classList.toggle('active', b === btn);
            });
            applyProtoState(btn.getAttribute('data-proto-state'));
        });
    });

    /* ── INIT ── */
    renderAnnouncements();
    renderFeed();
    renderTasks();
    renderDeals();
}());
