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
            image: 'assets/images/il-product-ukr.png?v=20260603-3',
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
            benefits: [
                'Переглядати всі події курсів без обмеження після 10 записів',
                'Знаходити уроки, домашні завдання та студентські дії за пошуком',
                'Бачити, хто оновлював навчальні матеріали та перевіряв завдання',
                'Аналізувати активність студентів і команди в одному журналі'
            ]
        }
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
    var banner = document.getElementById('freeServiceBanner');
    var hiddenCountText = document.getElementById('hiddenCountText');
    var drawerTitle = document.getElementById('upsellDrawerTitle');
    var drawerSubtitle = document.getElementById('upsellDrawerSubtitle');
    var drawerImage = document.getElementById('upsellDrawerImage');
    var drawerBenefits = document.getElementById('upsellDrawerBenefits');

    function item(service, author, action, entity, type, details, dateLabel, time, fullDate) {
        return { service: service, author: author, action: action, entity: entity, type: type, details: details, dateLabel: dateLabel, time: time, fullDate: fullDate };
    }

    function clonePrototypeEvent(event, index) {
        var authors = ['Юрій Коваленко', 'Марина Савченко', 'Олена Петренко', 'Ігор Мельник'];
        var dateLabels = ['Сьогодні', 'Вчора', '11 Травня', '10 Травня'];
        var hour = 17 - (index % 8);
        var minutes = String((index * 7) % 60).padStart(2, '0');
        var cloned = item(
            event.service,
            authors[index % authors.length],
            event.action,
            event.entity,
            event.type,
            event.details,
            dateLabels[index % dateLabels.length],
            String(hour).padStart(2, '0') + ':' + minutes,
            '2026-05-' + String(28 - (index % 18)).padStart(2, '0') + ' ' + String(hour).padStart(2, '0') + ':' + minutes
        );
        cloned.sourceId = events.indexOf(event);
        return cloned;
    }

    function ensurePrototypeRows(list) {
        var serviceList = list.slice();
        var shouldFill = state.service !== 'all' && !state.search && !state.filtersApplied;
        var source = serviceList.length ? serviceList : events.filter(function (event) { return event.service === state.service; });

        if (!shouldFill || serviceList.length >= 11 || !source.length) return serviceList;

        while (serviceList.length < 11) {
            serviceList.push(clonePrototypeEvent(source[serviceList.length % source.length], serviceList.length));
        }

        return serviceList;
    }

    function currentUpsellContent() {
        var content = upsellContent[state.service] || upsellContent.all;
        return {
            title: content.title,
            subtitle: content.subtitle,
            image: content.image || upsellContent.all.image,
            benefits: content.benefits || upsellContent.all.benefits
        };
    }

    function syncDrawerContent() {
        var content = currentUpsellContent();
        drawerTitle.textContent = content.title;
        drawerSubtitle.textContent = content.subtitle;
        drawerImage.setAttribute('src', content.image);
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

    function openDrawer() {
        syncDrawerContent();
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
            return '<li' + active + '><a data-service="' + key + '"><span class="activity-tab-label">' + services[key].label + '</span><span class="activity-tab-count">' + count + '</span></a></li>';
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
        return index === 10;
    }

    function filteredEvents() {
        return ensurePrototypeRows(events.filter(function (event) {
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
        }));
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
            return '<article class="activity-event is-locked" data-open-drawer>' +
                icon +
                '<div class="activity-event-main">' +
                '<div class="activity-event-text"><span class="activity-skeleton is-mid"></span></div>' +
                '<div class="activity-event-meta"><span class="activity-badge ' + service.className + '">' + service.label + '</span><span class="activity-details"><strong>Деталі:</strong> <span class="activity-skeleton is-mid"></span></span></div>' +
                '</div><time class="activity-time">' + event.time + '</time></article>';
        }
        return '<article class="activity-event" data-event-id="' + (events.indexOf(event) > -1 ? events.indexOf(event) : event.sourceId) + '">' +
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
        var hiddenFreeCount = 0;

        visibleList.forEach(function (event, index) {
            if (isLocked(event, index)) hiddenFreeCount += 1;
            if (!grouped[event.dateLabel]) grouped[event.dateLabel] = [];
            grouped[event.dateLabel].push({ event: event, locked: isLocked(event, index) });
        });

        feed.innerHTML = Object.keys(grouped).map(function (date) {
            var rows = grouped[date].map(function (row) { return eventMarkup(row.event, row.locked); }).join('');
            return '<section class="activity-date-group"><h3 class="activity-date-title">' + date + ' · ' + grouped[date].length + '</h3>' + rows + '</section>';
        }).join('') || '<div class="no-deals activity-empty">Немає даних для відображення</div>';
        activitySearchSummary.innerHTML = state.search ? 'Знайдено результатів: <strong>' + list.length + '</strong>' : '';
        activitySearchSummary.classList.toggle('is-visible', !!state.search);

        var totalHidden = Math.max(list.length - 10, hiddenFreeCount);
        banner.classList.toggle('is-visible', state.service !== 'all' && list.length > 10);
        hiddenCountText.textContent = 'Приховано ' + totalHidden + ' подій.';
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
        var event = events[id];
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
            openDrawer();
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
