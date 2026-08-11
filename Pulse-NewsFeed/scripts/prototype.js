(function () {
    'use strict';

    var currentUser = 'Юрій Кіслицин';

    /* item caps differ per Мій день layout variant (1: stacked panels / 2: tabs / 3: three columns) — see getFeedMax()/getMyDayMax() */
    var FEED_MAX_ITEMS_VARIANT1 = 11;
    var FEED_MAX_ITEMS_VARIANT2 = 9;
    var FEED_MAX_ITEMS_VARIANT3 = 12;
    var MY_DAY_MAX_ITEMS_VARIANT1 = 9;
    var MY_DAY_MAX_ITEMS_VARIANT2 = 13;
    var MY_DAY_MAX_ITEMS_VARIANT3 = 12;

    function currentLayoutVariant() {
        return pulseZoneLayout ? pulseZoneLayout.getAttribute('data-layout') : '1';
    }

    function getFeedMax() {
        var variant = currentLayoutVariant();
        if (variant === '2') return FEED_MAX_ITEMS_VARIANT2;
        if (variant === '3') return FEED_MAX_ITEMS_VARIANT3;
        return FEED_MAX_ITEMS_VARIANT1;
    }

    function getMyDayMax() {
        var variant = currentLayoutVariant();
        if (variant === '2') return MY_DAY_MAX_ITEMS_VARIANT2;
        if (variant === '3') return MY_DAY_MAX_ITEMS_VARIANT3;
        return MY_DAY_MAX_ITEMS_VARIANT1;
    }

    var state = {
        canPublishAnnouncements: true,
        feedVisible: FEED_MAX_ITEMS_VARIANT1,
        feedPageSize: FEED_MAX_ITEMS_VARIANT1,
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
            true, 'assets/illustrations/ann-sample-image.svg', 'сьогодні'),
        ann(2, 'important', 'Максим Литвин', '20.07.2026 10:15',
            'Оновлення CRM: додано інтеграцію з Telegram-ботом. Тепер менеджери можуть отримувати сповіщення про нові угоди та завдання прямо у Telegram. Деталі у базі знань.',
            false, null, 'вчора'),
        ann(3, 'normal', currentUser, '19.07.2026 09:00',
            'Нагадуємо: до кінця липня необхідно заповнити анкету самооцінки. Посилання надіслано на корпоративну пошту.',
            false, null, 'тиждень')
    ];

    function ann(id, priority, author, date, text, hasImage, image, period) {
        return { id: id, priority: priority, author: author, date: date, text: text, hasImage: hasImage, image: image || null, status: 'active', period: period || 'сьогодні' };
    }

    /* ── MOCK DATA: DRAWER FILLER ANNOUNCEMENTS (pads each period to 10 items for the "Усі анонси" drawer) ── */
    var fillerAnnAuthors = ['Олена Коваль', 'Максим Литвин', currentUser, 'Ігор Мельник', 'Марина Савченко', 'Юрій Коваленко'];
    var fillerAnnTexts = [
        'Оновлення регламенту обробки заявок клієнтів.',
        'Планове технічне обслуговування серверів у вихідні.',
        'Нагадування про дедлайн подачі звітів по кварталу.',
        'Запрошуємо на демо нової функції CRM у четвер.',
        'Зміни у графіку роботи служби підтримки.',
        'Оновлено шаблони листів для email-розсилок.'
    ];
    var fillerAnnPriorities = ['normal', 'important', 'urgent'];
    var fillerAnnPeriods = ['сьогодні', 'вчора', 'тиждень'];
    var FILLER_ANN_PER_PERIOD = 9;

    var fillerAnnouncements = [];
    (function buildFillerAnnouncements() {
        var id = 1000;
        fillerAnnPeriods.forEach(function (period, periodIndex) {
            for (var i = 0; i < FILLER_ANN_PER_PERIOD; i++) {
                id++;
                var author = fillerAnnAuthors[(i + periodIndex) % fillerAnnAuthors.length];
                var text = fillerAnnTexts[(i + periodIndex) % fillerAnnTexts.length];
                var priority = fillerAnnPriorities[i % fillerAnnPriorities.length];
                var day = Math.max(1, 21 - periodIndex - Math.floor(i / 6));
                var hour = 8 + (i % 10);
                var dateLabel = (day < 10 ? '0' : '') + day + '.07.2026 ' + (hour < 10 ? '0' : '') + hour + ':00';
                var item = ann(id, priority, author, dateLabel, text, false, null, period);
                item.synthetic = true;
                fillerAnnouncements.push(item);
            }
        });
    })();

    function findAnnById(id) {
        var numId = Number(id);
        var found = announcements.filter(function (item) { return item.id === numId; })[0];
        if (found) return found;
        return fillerAnnouncements.filter(function (item) { return item.id === numId; })[0];
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
        serviceEvent('smtp', 'Олена Петренко', 'підтвердила домен', 'mail.mediagroup.ua', 'SPF і DKIM активні', 'вчора', '10:15'),
        serviceEvent('crm', 'Максим Литвин', 'додав контакт', 'Ростислав Кравченко', 'Компанія: «ВеломаркетПлюс», джерело: запит через форму', 'сьогодні', '15:45')
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

    var tasks = [
        {
            id: 't1', name: 'Зателефонувати клієнту «Бета Трейд»', done: false, priority: 'high',
            dateStart: '11 серпня, 17:00', dateEnd: null, dateSort: 1, dueDateSort: 20260811,
            board: { name: 'Продажі Q3', color: '02-Blue' },
            links: []
        },
        {
            id: 't2', name: 'Узгодити договір з юристами', done: false, priority: 'medium',
            dateStart: '12 серпня, 16:00', dateEnd: null, dateSort: 2, dueDateSort: 20260812,
            board: { name: 'Продажі Q3', color: '02-Blue' },
            links: []
        },
        {
            id: 't3', name: 'Підготувати комерційну пропозицію', done: false, priority: 'high',
            dateStart: '13 серпня, 14:00', dateEnd: null, dateSort: 3, dueDateSort: 20260813,
            board: { name: 'Постачання', color: '04-Mint/Turquoise' },
            links: [{ type: 'deal', name: 'Постачання обладнання для «Агро-Тех»', drawerKey: 'deal-1' }]
        },
        {
            id: 't4', name: 'Провести демо для «Медіа Груп»', done: false, priority: 'low',
            dateStart: '15 серпня, 16:00', dateEnd: null, dateSort: 4, dueDateSort: 20260815,
            board: { name: 'Маркетинг', color: '09-Coral/Salmon' },
            links: [{ type: 'contact', name: 'Оксана Терещенко' }]
        },
        {
            id: 't6', name: 'Оновити прайс-лист для дилерів', done: false, priority: 'medium',
            dateStart: '17 серпня, 11:00', dateEnd: null, dateSort: 5, dueDateSort: 20260817,
            board: { name: 'Продажі Q3', color: '02-Blue' },
            links: []
        },
        {
            id: 't7', name: 'Погодити знижку для «Агро-Тех»', done: false, priority: 'high',
            dateStart: '18 серпня, 15:00', dateEnd: null, dateSort: 6, dueDateSort: 20260818,
            board: { name: 'Постачання', color: '04-Mint/Turquoise' },
            links: [{ type: 'deal', name: 'Постачання обладнання для «Агро-Тех»', drawerKey: 'deal-1' }]
        },
        {
            id: 't5', name: 'Надіслати рахунок ТОВ «Прогрес»', done: false, priority: 'medium',
            dateStart: null, dateEnd: null, dateSort: 7,
            board: { name: 'Задачі на літо', color: '03-Cyan/Light Blue' },
            links: { deal: 2, contact: 1, task: 3 }
        },
        {
            id: 't8', name: 'Заповнити звіт по воронці за тиждень', done: false, priority: 'low',
            dateStart: null, dateEnd: null, dateSort: 8,
            board: { name: 'Задачі на літо', color: '03-Cyan/Light Blue' },
            links: []
        },
        {
            id: 't9', name: 'Провести співбесіду з кандидатом', done: false, priority: 'medium',
            dateStart: null, dateEnd: null, dateSort: 9,
            board: { name: 'Продажі Q3', color: '02-Blue' },
            links: []
        },
        {
            id: 't10', name: 'Підготувати звіт по маркетингу', done: false, priority: 'low',
            dateStart: null, dateEnd: null, dateSort: 10,
            board: { name: 'Маркетинг', color: '09-Coral/Salmon' },
            links: []
        },
        {
            id: 't11', name: 'Узгодити терміни постачання з «Дата Хаб»', done: false, priority: 'high',
            dateStart: null, dateEnd: null, dateSort: 11,
            board: { name: 'Постачання', color: '04-Mint/Turquoise' },
            links: [{ type: 'deal', name: 'Постачання серверів «Дата Хаб»', drawerKey: 'deal-7' }]
        },
        {
            id: 't12', name: 'Оновити CRM-профіль клієнта', done: false, priority: 'medium',
            dateStart: null, dateEnd: null, dateSort: 12,
            board: { name: 'Задачі на літо', color: '03-Cyan/Light Blue' },
            links: []
        },
        {
            id: 't19', name: 'Погодити рекламний бюджет на серпень', done: false, priority: 'high',
            dateStart: null, dateEnd: null, dateSort: 13,
            board: { name: 'Маркетинг', color: '09-Coral/Salmon' },
            links: []
        },
        {
            id: 't20', name: 'Підготувати матеріали для вебінару', done: false, priority: 'medium',
            dateStart: null, dateEnd: null, dateSort: 14,
            board: { name: 'Маркетинг', color: '09-Coral/Salmon' },
            links: []
        }
    ];

    /* ── RESERVE QUEUE: backfills the Мій день task list as items are completed,
       so the panel keeps showing 13 tasks until the queue runs dry — then it shortens. ── */
    var taskQueue = [
        {
            id: 't13', name: 'Узгодити акційні умови з «Технопром»', done: false, priority: 'medium',
            dateStart: null, dateEnd: null, dateSort: 15,
            board: { name: 'Продажі Q3', color: '02-Blue' },
            links: [{ type: 'deal', name: 'Оновлення ліцензії «Технопром»', drawerKey: 'deal-6' }]
        },
        {
            id: 't14', name: 'Підготувати кейс для «Дата Хаб»', done: false, priority: 'low',
            dateStart: null, dateEnd: null, dateSort: 16,
            board: { name: 'Маркетинг', color: '09-Coral/Salmon' },
            links: []
        },
        {
            id: 't15', name: 'Перевірити оплату «Нова Пошта Софт»', done: false, priority: 'high',
            dateStart: null, dateEnd: null, dateSort: 17,
            board: { name: 'Постачання', color: '04-Mint/Turquoise' },
            links: [{ type: 'deal', name: 'Продовження підписки «Нова Пошта Софт»', drawerKey: 'deal-8' }]
        },
        {
            id: 't16', name: 'Оновити чек-лист онбордингу клієнтів', done: false, priority: 'medium',
            dateStart: null, dateEnd: null, dateSort: 18,
            board: { name: 'Задачі на літо', color: '03-Cyan/Light Blue' },
            links: []
        },
        {
            id: 't17', name: 'Верифікувати контакти нових клієнтів', done: false, priority: 'low',
            dateStart: null, dateEnd: null, dateSort: 19,
            board: { name: 'Маркетинг', color: '09-Coral/Salmon' },
            links: []
        },
        {
            id: 't18', name: 'Оновити звіт про виконання квартального плану', done: false, priority: 'high',
            dateStart: null, dateEnd: null, dateSort: 20,
            board: { name: 'Продажі Q3', color: '02-Blue' },
            links: []
        }
    ];

    var deadlineDeals = [
        {
            id: 'deal-3', name: 'Пілотний проєкт «Digital Solutions»',
            board: { name: 'Продажі', color: '10-Pink' }, amount: '400 000 UAH',
            dateLabel: 'До 9 Серпня, 12:00', dateSort: 20260809,
            products: null
        },
        {
            id: 'deal-2', name: 'Річний контракт ТОВ «Бета Трейд»',
            board: { name: 'Продажі', color: '02-Blue' }, amount: '840 000 UAH',
            dateLabel: 'До 10 Серпня, 17:00', dateSort: 20260810,
            products: null
        },
        {
            id: 'deal-1', name: 'Постачання обладнання для «Агро-Тех»',
            board: { name: 'Постачання', color: '04-Mint/Turquoise' }, amount: '1 200 000 UAH',
            dateLabel: 'До 11 Серпня, 15:30', dateSort: 20260811,
            products: [{ name: 'Лінія розливу L-2000', price: '1 200 000', currency: 'UAH' }]
        },
        {
            id: 'deal-4', name: 'Постачання меблів «Офіс Комфорт»',
            board: { name: 'Постачання', color: '04-Mint/Turquoise' }, amount: '280 000 UAH',
            dateLabel: 'До 12 Серпня, 10:00', dateSort: 20260812,
            products: { count: 5, total: '280 000', currency: 'UAH' }
        },
        {
            id: 'deal-5', name: 'Розширення ліцензії «Медіа Груп»',
            board: { name: 'Продажі', color: '12-Purple' }, amount: '620 000 UAH',
            dateLabel: 'До 14 Серпня, 14:00', dateSort: 20260814,
            products: [{ name: 'Розширена ліцензія CRM x50', price: '620 000', currency: 'UAH' }]
        },
        {
            id: 'deal-6', name: 'Оновлення ліцензії «Технопром»',
            board: { name: 'Продажі', color: '06-Mustard/Gold' }, amount: '150 000 UAH',
            dateLabel: 'До 15 Серпня, 12:00', dateSort: 20260815,
            products: { count: 1, total: '150 000', currency: 'UAH' }
        },
        {
            id: 'deal-7', name: 'Постачання серверів «Дата Хаб»',
            board: { name: 'Постачання', color: '08-Orange' }, amount: '2 100 000 UAH',
            dateLabel: 'До 17 Серпня, 09:00', dateSort: 20260817,
            products: [{ name: 'Сервери Dell PowerEdge x6', price: '2 100 000', currency: 'UAH' }]
        },
        {
            id: 'deal-8', name: 'Продовження підписки «Нова Пошта Софт»',
            board: { name: 'Продажі', color: '11-Lavender' }, amount: '95 000 UAH',
            dateLabel: 'До 18 Серпня, 16:00', dateSort: 20260818,
            products: { count: 2, total: '95 000', currency: 'UAH' }
        },
        {
            id: 'deal-9', name: 'Впровадження CRM для «Смарт Логістика»',
            board: { name: 'Продажі', color: '07-Yellow' }, amount: '360 000 UAH',
            dateLabel: 'До 19 Серпня, 10:00', dateSort: 20260819,
            products: [{ name: 'Ліцензія CRM Business x10', price: '360 000', currency: 'UAH' }]
        },
        {
            id: 'deal-10', name: 'Розширення парку принтерів «Офіс Плюс»',
            board: { name: 'Постачання', color: '01-Gray' }, amount: '210 000 UAH',
            dateLabel: 'До 20 Серпня, 15:00', dateSort: 20260820,
            products: { count: 3, total: '210 000', currency: 'UAH' }
        },
        {
            id: 'deal-11', name: 'Оновлення тарифу «Глобал Трейд»',
            board: { name: 'Продажі', color: '05-Light Green/Lime' }, amount: '480 000 UAH',
            dateLabel: 'До 21 Серпня, 12:00', dateSort: 20260821,
            products: [{ name: 'Розширена ліцензія CRM x30', price: '480 000', currency: 'UAH' }]
        },
        {
            id: 'deal-12', name: 'Постачання канцелярії «Освіта Плюс»',
            board: { name: 'Постачання', color: '08-Orange' }, amount: '75 000 UAH',
            dateLabel: 'До 22 Серпня, 09:00', dateSort: 20260822,
            products: { count: 4, total: '75 000', currency: 'UAH' }
        },
        {
            id: 'deal-13', name: 'Облік документів для «Юридич Консалт»',
            board: { name: 'Продажі', color: '11-Lavender' }, amount: '180 000 UAH',
            dateLabel: 'До 24 Серпня, 11:00', dateSort: 20260824,
            products: [{ name: 'Модуль управління документами', price: '180 000', currency: 'UAH' }]
        },
        {
            id: 'deal-14', name: 'Розширення серверних потужностей «БізнесТек»',
            board: { name: 'Постачання', color: '01-Gray' }, amount: '540 000 UAH',
            dateLabel: 'До 26 Серпня, 15:00', dateSort: 20260826,
            products: { count: 2, total: '540 000', currency: 'UAH' }
        },
        {
            id: 'deal-15', name: 'Оновлення обладнання «Ветеран Агро»',
            board: { name: 'Постачання', color: '02-Blue' }, amount: '320 000 UAH',
            dateLabel: 'До 28 Серпня, 13:00', dateSort: 20260828,
            products: [{ name: 'Комплект контрольно-вимірювального обладнання', price: '320 000', currency: 'UAH' }]
        },
        {
            id: 'deal-16', name: 'Продовження контракту «Агро-Сервіс»',
            board: { name: 'Продажі', color: '06-Mustard/Gold' }, amount: '265 000 UAH',
            dateLabel: 'До 30 Серпня, 10:00', dateSort: 20260830,
            products: { count: 1, total: '265 000', currency: 'UAH' }
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
                ['Дедлайн', '11.08.2026'],
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
                ['Дедлайн', '10.08.2026'],
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
                ['Дедлайн', '09.08.2026'],
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
                ['Дедлайн', '12.08.2026'],
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
                ['Дедлайн', '14.08.2026'],
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
                ['Дедлайн', '15.08.2026'],
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
                ['Дедлайн', '17.08.2026'],
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
                ['Дедлайн', '18.08.2026'],
                ['Контакт', 'Наталія Бойко']
            ],
            comments: []
        },
        'deal-9': {
            type: 'Угода',
            title: 'Впровадження CRM для «Смарт Логістика»',
            rows: [
                ['Сума', '<strong>360 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-blue"></span> КП відправлено'],
                ['Дедлайн', '19.08.2026'],
                ['Контакт', 'Владислав Гриценко']
            ],
            comments: []
        },
        'deal-10': {
            type: 'Угода',
            title: 'Розширення парку принтерів «Офіс Плюс»',
            rows: [
                ['Сума', '<strong>210 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-orange"></span> Рахунок виставлено'],
                ['Дедлайн', '20.08.2026'],
                ['Контакт', 'Тетяна Кравець']
            ],
            comments: []
        },
        'deal-11': {
            type: 'Угода',
            title: 'Оновлення тарифу «Глобал Трейд»',
            rows: [
                ['Сума', '<strong>480 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-green"></span> Переговори'],
                ['Дедлайн', '21.08.2026'],
                ['Контакт', 'Богдан Руденко']
            ],
            comments: []
        },
        'deal-12': {
            type: 'Угода',
            title: 'Постачання канцелярії «Освіта Плюс»',
            rows: [
                ['Сума', '<strong>75 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-blue"></span> Нова заявка'],
                ['Дедлайн', '22.08.2026'],
                ['Контакт', 'Ірина Бондаренко']
            ],
            comments: []
        },
        'deal-13': {
            type: 'Угода',
            title: 'Облік документів для «Юридич Консалт»',
            rows: [
                ['Сума', '<strong>180 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-orange"></span> Рахунок виставлено'],
                ['Дедлайн', '24.08.2026'],
                ['Контакт', 'Сергій Петренко']
            ],
            comments: []
        },
        'deal-14': {
            type: 'Угода',
            title: 'Розширення серверних потужностей «БізнесТек»',
            rows: [
                ['Сума', '<strong>540 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-green"></span> Переговори'],
                ['Дедлайн', '26.08.2026'],
                ['Контакт', 'Павло Шевчук']
            ],
            comments: []
        },
        'deal-15': {
            type: 'Угода',
            title: 'Оновлення обладнання «Ветеран Агро»',
            rows: [
                ['Сума', '<strong>320 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-blue"></span> КП відправлено'],
                ['Дедлайн', '28.08.2026'],
                ['Контакт', 'Олег Гриценко']
            ],
            comments: []
        },
        'deal-16': {
            type: 'Угода',
            title: 'Продовження контракту «Агро-Сервіс»',
            rows: [
                ['Сума', '<strong>265 000 ₴</strong>'],
                ['Етап', '<span class="badge badge-status status-green"></span> Переговори'],
                ['Дедлайн', '30.08.2026'],
                ['Контакт', 'Валентина Кравець']
            ],
            comments: []
        },
        't1': {
            type: 'Завдання',
            title: 'Зателефонувати клієнту «Бета Трейд»',
            rows: [
                ['Статус', '<span class="label label-danger">Прострочено</span>'],
                ['Дедлайн', '11.08.2026 17:00'],
                ['Контакт', 'Іван Мороз']
            ],
            comments: []
        },
        't2': {
            type: 'Завдання',
            title: 'Узгодити договір з юристами',
            rows: [
                ['Статус', '<span class="label label-danger">Прострочено</span>'],
                ['Дедлайн', '12.08.2026 16:00'],
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
                ['Дедлайн', '13.08.2026 14:00'],
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
                ['Дедлайн', '15.08.2026 16:00'],
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
                ['Дедлайн', '17.08.2026 11:00'],
                ['Відповідальний', currentUser]
            ],
            comments: []
        },
        't7': {
            type: 'Завдання',
            title: 'Погодити знижку для «Агро-Тех»',
            rows: [
                ['Статус', '<span class="label label-primary">В роботі</span>'],
                ['Дедлайн', '18.08.2026 15:00'],
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
        't13': {
            type: 'Завдання',
            title: 'Узгодити акційні умови з «Технопром»',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '26.07.2026 11:00'],
                ['Угода', '<a href="#" data-open-drawer="deal-6">Оновлення ліцензії «Технопром»</a>']
            ],
            comments: []
        },
        't14': {
            type: 'Завдання',
            title: 'Підготувати кейс для «Дата Хаб»',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '26.07.2026 14:00']
            ],
            comments: []
        },
        't15': {
            type: 'Завдання',
            title: 'Перевірити оплату «Нова Пошта Софт»',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '27.07.2026 09:00'],
                ['Угода', '<a href="#" data-open-drawer="deal-8">Продовження підписки «Нова Пошта Софт»</a>']
            ],
            comments: []
        },
        't16': {
            type: 'Завдання',
            title: 'Оновити чек-лист онбордингу клієнтів',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '27.07.2026 13:00']
            ],
            comments: []
        },
        't17': {
            type: 'Завдання',
            title: 'Верифікувати контакти нових клієнтів',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '28.07.2026 10:00']
            ],
            comments: []
        },
        't18': {
            type: 'Завдання',
            title: 'Оновити звіт про виконання квартального плану',
            rows: [
                ['Статус', '<span class="label label-primary">В роботі</span>'],
                ['Дедлайн', '28.07.2026 14:00'],
                ['Відповідальний', currentUser]
            ],
            comments: []
        },
        't19': {
            type: 'Завдання',
            title: 'Погодити рекламний бюджет на серпень',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '29.07.2026 11:00'],
                ['Відповідальний', currentUser]
            ],
            comments: []
        },
        't20': {
            type: 'Завдання',
            title: 'Підготувати матеріали для вебінару',
            rows: [
                ['Статус', '<span class="label label-default">Нове</span>'],
                ['Дедлайн', '29.07.2026 14:00']
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
    var feedListEl = document.getElementById('feedList');
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    var feedPeriodMenu = document.getElementById('feedPeriodMenu');
    var tasksPanelBody = document.getElementById('tasksPanelBody');
    var dealsPanelBody = document.getElementById('dealsPanelBody');
    var pulseZoneLayout = document.getElementById('pulseZoneLayout');
    var pulseMyDayPanels = document.getElementById('pulseMyDayPanels');
    var pulseZoneRight = document.getElementById('pulseZoneRight');
    var addAnnItem = document.getElementById('addAnnItem');
    var addAnnDivider = document.getElementById('addAnnDivider');

    /* ── RENDER: ANNOUNCEMENTS ── */
    function activeAnnouncements() {
        return announcements.filter(function (a) { return a.status === 'active'; });
    }

    function annCardMarkup(a, showViewedCheck) {
        var checkboxHtml = showViewedCheck
            ? '<input type="checkbox" class="pulse-checkbox pulse-ann-checkbox" data-ann-check="' + a.id + '" title="Позначити як переглянуте">'
            : '';
        return '<div class="pulse-ann-card prio-' + a.priority + '" data-open-ann="' + a.id + '">' +
            '<div class="pulse-ann-card-head">' +
            '<span class="pulse-ann-card-head-left">' +
            checkboxHtml +
            '<span class="pulse-prio-badge">' + prioLabel[a.priority] + '</span>' +
            '</span>' +
            '<span class="pulse-ann-card-date">' + a.date + '</span>' +
            '</div>' +
            '<div class="pulse-ann-card-body">' +
            '<div class="pulse-ann-card-author">' + escapeHtml(a.author) + '</div>' +
            '<div class="pulse-ann-card-text">' + escapeHtml(a.text) + '</div>' +
            '</div>' +
            '</div>';
    }

    function renderAnnouncements() {
        var active = activeAnnouncements();
        annGrid.classList.toggle('is-empty', active.length === 0);
        annGrid.innerHTML = active.length
            ? active.map(function (a) { return annCardMarkup(a, true); }).join('')
            : '<div class="pulse-ann-empty-row">Немає актуальних анонсів<a href="#" class="pulse-panel-link js-open-ann-list">Усі анонси →</a></div>';
    }

    var annListState = { period: 'сьогодні', filtered: [] };

    function renderAnnListDrawer() {
        var source = activeAnnouncements().concat(fillerAnnouncements);
        annListState.filtered = source.filter(function (a) { return a.period === annListState.period; });
        var body = document.getElementById('annListDrawerBody');
        body.innerHTML = annListState.filtered.length
            ? annListState.filtered.map(function (a) { return annCardMarkup(a); }).join('')
            : emptyState('assets/illustrations/ic-empty-task.svg', 'У вас немає анонсів');
    }

    function openAnnListDrawer() {
        annListState.period = 'сьогодні';
        document.querySelectorAll('#annListPeriodTabs [data-ann-period]').forEach(function (tab) {
            tab.classList.toggle('active', tab.getAttribute('data-ann-period') === 'сьогодні');
        });
        renderAnnListDrawer();
        closeDrawer();
        document.getElementById('annListDrawer').classList.add('is-open');
        document.getElementById('annListDrawer').setAttribute('aria-hidden', 'false');
        setProtoPanelVisible(false);
    }

    /* ── RENDER: FEED LIST (activity-feed components ported from ../CRM_History-Event-Page) ── */
    function renderFeed() {
        var isVariant3 = currentLayoutVariant() === '3';
        var feedMax = getFeedMax();
        var periodEvents = isVariant3 ? feedEvents : feedEvents.filter(function (event) { return event.dateLabel === state.feedPeriod; });
        var visibleCount = isVariant3 ? feedMax : Math.min(state.feedVisible, feedMax);
        var visible = periodEvents.slice(0, visibleCount);
        var rowRenderer = isVariant3 ? renderHistoryRow : renderEventRow;

        feedListEl.innerHTML = visible.map(rowRenderer).join('') || emptyState('assets/illustrations/ic-empty-history.svg', 'Немає даних для відображення');

        var hasMore = periodEvents.length > visibleCount && visibleCount < feedMax;
        loadMoreBtn.classList.toggle('hide', !hasMore || isVariant3);

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
            '</div>' +
            '<time class="activity-time">' + event.time + '</time>' +
            '</article>';
    }

    /* variant 3: Історія подій rows — same divider/hover as Завдання/Угоди rows (.pulse-row), but icon
       + title + time sit on one line (no .pulse-task-meta row underneath). ── */
    function renderHistoryRow(event) {
        var svc = serviceMeta[event.service];
        var clickAttr = event.type === 'email' ? ' data-open-mail="1"' : ' data-feed-drawer="' + event._id + '"';
        var title = '<span class="activity-event-author">' + escapeHtml(event.author) + '</span> ' + escapeHtml(event.action) + ' <strong>' + escapeHtml(event.entity) + '</strong>';
        return '<div class="pulse-row pulse-row-history"' + clickAttr + '>' +
            '<span class="activity-service-icon service-' + event.service + '"><img src="' + svc.icon + '" alt=""></span>' +
            '<span class="pulse-task-title">' + title + '</span>' +
            '<time class="activity-time">' + event.time + '</time>' +
            '</div>';
    }

    function loadMoreFeed() {
        state.feedVisible = Math.min(state.feedVisible + state.feedPageSize, getFeedMax());
        renderFeed();
    }

    /* ── RENDER: MY DAY ── */
    function metaSegmentHtml(seg, index) {
        var dot = index > 0 ? '<span class="pulse-meta-dot"></span>' : '';
        var iconStyleAttr = seg.color ? ' style="color:' + seg.color + '"' : '';
        var marker = seg.isBoard
            ? ''
            : '<span class="sp-icon ' + seg.icon + '"' + iconStyleAttr + '></span>';
        var valueClass = seg.isBoard ? 'pulse-meta-value pulse-meta-board' : 'pulse-meta-value';
        var valueStyleAttr = seg.color ? ' style="color:' + seg.color + '"' : '';
        var valueTitleAttr = seg.title ? ' title="' + escapeHtml(seg.title) + '"' : '';
        return dot + '<span class="' + valueClass + '"' + valueStyleAttr + valueTitleAttr + '>' + marker + seg.text + '</span>';
    }

    /* ── DUE DATE URGENCY: "today" is fixed for this prototype (mock dates aren't relative to the
       real system clock) — within 3 days = soon (AE7F1C), already past = overdue (D94B4D). ── */
    var PROTO_TODAY_YMD = 20260813;

    function ymdToDate(ymd) {
        var y = Math.floor(ymd / 10000);
        var m = Math.floor((ymd % 10000) / 100) - 1;
        var d = ymd % 100;
        return new Date(y, m, d);
    }

    function dueUrgencyInfo(ymd) {
        if (!ymd) return null;
        var diffDays = Math.round((ymdToDate(ymd) - ymdToDate(PROTO_TODAY_YMD)) / 86400000);
        if (diffDays < 0) return { color: '#D94B4D', title: 'Термін виконання закінчився' };
        if (diffDays <= 3) return { color: '#AE7F1C', title: 'Термін виконання скоро закінчиться' };
        return null;
    }

    function taskMetaHtml(t) {
        var segments = [];

        if (t.board) {
            segments.push({ isBoard: true, text: escapeHtml(t.board.name) });
        }

        var prio = taskPriorityMeta[t.priority];
        segments.push({ icon: prio.icon, text: '', color: prio.color, title: 'Пріоритет: ' + prio.label });

        if (t.dateStart) {
            var taskUrgency = dueUrgencyInfo(t.dueDateSort);
            segments.push({
                icon: 'icon-calendar',
                text: t.dateEnd ? (t.dateStart + ' - ' + t.dateEnd) : t.dateStart,
                color: taskUrgency && taskUrgency.color,
                title: taskUrgency && taskUrgency.title
            });
        }

        return segments.map(metaSegmentHtml).join('');
    }

    function renderTasks(enteringId) {
        if (!tasks.length) {
            tasksPanelBody.innerHTML = emptyState('assets/illustrations/ic-empty-task.svg', 'У вас немає завдань');
            return;
        }
        var sorted = sortByField(tasks, 'dateSort').slice(0, getMyDayMax());
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

    function dealMetaHtml(d) {
        var segments = [];
        var dealUrgency = dueUrgencyInfo(d.dateSort);
        segments.push({ isBoard: true, text: escapeHtml(d.board.name) });
        segments.push({ icon: 'icon-pay-wallet', text: d.amount });
        segments.push({
            icon: 'icon-alarm-clock',
            text: d.dateLabel.replace(/^До\s+/i, ''),
            color: dealUrgency && dealUrgency.color,
            title: dealUrgency && dealUrgency.title
        });

        return segments.map(metaSegmentHtml).join('');
    }

    function renderDeals() {
        if (!deadlineDeals.length) {
            dealsPanelBody.innerHTML = emptyState('assets/illustrations/ic-empty-deal.svg', 'У вас немає угод з дедлайном');
            return;
        }
        var sorted = sortByField(deadlineDeals, 'dateSort').slice(0, getMyDayMax());
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
        var a = findAnnById(id);
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

        var canManage = !a.synthetic && a.author === currentUser;
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
        setProtoPanelVisible(false);
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
        document.querySelectorAll('.activity-drawer.is-open').forEach(function (drawer) {
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
        });
        setProtoPanelVisible(true);
    }

    function setProtoPanelVisible(visible) {
        var panel = document.getElementById('protoStatePanel');
        if (panel) panel.style.display = visible ? '' : 'none';
    }

    /* ── EVENT DELEGATION ── */
    document.addEventListener('click', function (event) {
        var dropdownTrigger = event.target.closest('[data-toggle="dropdown"]');
        var modalDismiss = event.target.closest('[data-dismiss="modal"]');
        var annCard = event.target.closest('[data-open-ann]');
        var annCheck = event.target.closest('[data-ann-check]');
        var drawerTrigger = event.target.closest('[data-open-drawer]');
        var feedDrawerTrigger = event.target.closest('[data-feed-drawer]');
        var mailTrigger = event.target.closest('[data-open-mail]');
        var drawerClose = event.target.closest('.activity-drawer-close');
        var taskCheck = event.target.closest('[data-task-check]');
        var periodTrigger = event.target.closest('#feedPeriodMenu [data-period]');
        var myDayTabTrigger = event.target.closest('.pulse-myday-tabs [data-myday-tab]');
        var openDropdown = document.querySelector('.dropdown.open, .btn-group.open');

        if (periodTrigger) {
            event.preventDefault();
            selectFeedPeriod(periodTrigger.getAttribute('data-period'));
            return;
        }
        if (myDayTabTrigger) {
            event.preventDefault();
            selectMyDayTab(myDayTabTrigger.getAttribute('data-myday-tab'));
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
        if (event.target.closest('.js-open-ann-list')) {
            event.preventDefault();
            openAnnListDrawer();
            return;
        }
        if (event.target.closest('#annListPeriodTabs [data-ann-period]')) {
            event.preventDefault();
            var periodTab = event.target.closest('[data-ann-period]');
            annListState.period = periodTab.getAttribute('data-ann-period');
            document.querySelectorAll('#annListPeriodTabs [data-ann-period]').forEach(function (tab) {
                tab.classList.toggle('active', tab === periodTab);
            });
            renderAnnListDrawer();
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
        if (annCheck) {
            var annId = Number(annCheck.getAttribute('data-ann-check'));
            var a = announcements.filter(function (item) { return item.id === annId; })[0];
            if (a) {
                var leavingCard = annCheck.closest('.pulse-ann-card');
                var otherCards = Array.prototype.filter.call(annGrid.querySelectorAll('.pulse-ann-card'), function (c) { return c !== leavingCard; });
                var firstRects = otherCards.map(function (c) { return c.getBoundingClientRect(); });

                leavingCard.classList.add('is-leaving');
                setTimeout(function () {
                    a.status = 'viewed';
                    renderAnnouncements();

                    /* FLIP: remaining cards glide into their new grid position instead of snapping ── */
                    otherCards.forEach(function (oldCard, i) {
                        var newCard = annGrid.querySelector('[data-open-ann="' + oldCard.getAttribute('data-open-ann') + '"]');
                        if (!newCard) return;
                        var firstRect = firstRects[i];
                        var lastRect = newCard.getBoundingClientRect();
                        var dx = firstRect.left - lastRect.left;
                        var dy = firstRect.top - lastRect.top;
                        if (!dx && !dy) return;
                        newCard.style.transition = 'none';
                        newCard.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
                        newCard.offsetHeight; /* force reflow so the "no transition" state commits before we animate back */
                        newCard.style.transition = '';
                        newCard.style.transform = '';
                    });
                }, 180);
            }
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
        if (drawerClose || event.target.classList.contains('activity-drawer')) {
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

    /* ── PROTOTYPE-ONLY: LAYOUT VARIANT SWITCHER (1: Мій день stacked + feed / 2: tabs Завдання ⇄ Угоди) ── */
    function selectMyDayTab(tabKey) {
        document.querySelectorAll('.pulse-myday-tabs li').forEach(function (li) {
            li.classList.toggle('active', li.querySelector('[data-myday-tab="' + tabKey + '"]') !== null);
        });
        document.querySelectorAll('#pulseMyDayPanels [data-myday-panel]').forEach(function (panel) {
            panel.classList.toggle('active-tab', panel.getAttribute('data-myday-panel') === tabKey);
        });
    }

    function applyProtoLayout(variant) {
        pulseZoneLayout.setAttribute('data-layout', variant);
        document.getElementById('content-wrapper').setAttribute('data-layout', variant);
        if (variant === '2') {
            selectMyDayTab('tasks');
        }
        /* variant 3: Історія подій becomes a true 3rd sibling inside pulse-myday-panels (same flex row as
           Завдання/Угоди — guarantees identical top alignment) and gets real .panel.panel-default classes
           so it inherits their exact background/border/shadow. Moved back out for variant 1/2. */
        if (variant === '3') {
            pulseZoneRight.classList.add('panel', 'panel-default');
            pulseMyDayPanels.appendChild(pulseZoneRight);
        } else {
            pulseZoneRight.classList.remove('panel', 'panel-default');
            pulseZoneLayout.appendChild(pulseZoneRight);
        }
        /* item caps differ per variant (getMyDayMax/getFeedMax) — re-render so the new cap applies immediately */
        state.feedVisible = Math.min(state.feedVisible, getFeedMax());
        renderTasks();
        renderDeals();
        renderFeed();
    }

    document.querySelectorAll('#protoStatePanel [data-proto-layout]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('#protoStatePanel [data-proto-layout]').forEach(function (b) {
                b.classList.toggle('active', b === btn);
            });
            applyProtoLayout(btn.getAttribute('data-proto-layout'));
        });
    });

    /* ── INIT ── */
    renderAnnouncements();
    renderFeed();
    renderTasks();
    renderDeals();
}());
