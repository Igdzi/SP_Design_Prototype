/* CRM / Пошта — Inbox automation statuses prototype */
(function () {
    'use strict';

    var OWNERS = [
        { id: 'me', name: 'Андрій Антонов', short: 'Ви', initials: 'АА', color: '#009fc1' },
        { id: 'ok', name: 'Олена Коваль', initials: 'ОК', color: '#8e6bd8' },
        { id: 'mb', name: 'Максим Бондар', initials: 'МБ', color: '#e3a92d' }
    ];

    var PRESETS = {
        off:   { deals: false, contactsIn: false, contactsOut: false, dialogs: false },
        mixed: { deals: true,  contactsIn: true,  contactsOut: false, dialogs: false },
        on:    { deals: true,  contactsIn: true,  contactsOut: true,  dialogs: true }
    };

    var state = $.extend({
        pipeline: 'Продажі',
        stage: 'Новий лід',
        view: 'list',
        role: 'admin',          // 'admin' can change settings, 'viewer' sees statuses only
        dealOwner: 'ok',
        contactOwner: 'me'
    }, PRESETS.mixed);

    function owner(id) {
        for (var i = 0; i < OWNERS.length; i++) if (OWNERS[i].id === id) return OWNERS[i];
        return OWNERS[0];
    }

    function status(on, text) {
        return '<span class="mail-auto-status">' +
            '<span class="badge badge-status ' + (on ? 'status-green' : 'status-default') + '"> </span>' + text + '</span>';
    }

    function contactsStatusText() {
        if (state.contactsIn && state.contactsOut) return 'Увімкнено';
        if (state.contactsIn) return 'Вхідні';
        if (state.contactsOut) return 'Вихідні';
        return 'Вимкнено';
    }

    /* ── Sidebar "Налаштування" block: read-only statuses + entry to settings ── */
    function renderSidebar() {
        var isAdmin = state.role === 'admin';
        var contactsOn = state.contactsIn || state.contactsOut;
        var rows = [
            { section: 'deals',    name: 'Створення угод',      on: state.deals,    text: state.deals ? 'Увімкнено' : 'Вимкнено',
              title: state.deals ? 'Воронка: ' + state.pipeline + ' · ' + state.stage : '' },
            { section: 'contacts', name: 'Створення контактів', on: contactsOn,     text: contactsStatusText(),
              title: contactsOn ? 'Контакти створюються для ' + (state.contactsIn && state.contactsOut ? 'вхідних і вихідних' : state.contactsIn ? 'вхідних' : 'вихідних') + ' листів' : '' },
            { section: 'dialogs',  name: 'Відповіді на листи<sup class="color-active">NEW</sup>', plain: 'Відповіді на листи',
              on: state.dialogs, text: state.dialogs ? 'Увімкнено' : 'Вимкнено', title: '' }
        ];

        document.getElementById('mailAutoList').innerHTML = rows.map(function (r) {
            var inner = '<span class="mail-auto-name" title="' + (r.plain || r.name) + '">' + r.name + '</span>' + status(r.on, r.text);
            var tip = r.title ? ' title="' + r.title + '"' : '';
            return '<li>' + (isAdmin
                ? '<a href="#" class="mail-auto-row" data-section="' + r.section + '"' + tip + '>' + inner + '</a>'
                : '<div class="mail-auto-row"' + tip + '>' + inner + '</div>') + '</li>';
        }).join('');

        var enabled = (state.deals ? 1 : 0) + (contactsOn ? 1 : 0) + (state.dialogs ? 1 : 0);
        var counter = document.getElementById('mailAutoCounter');
        counter.textContent = enabled + ' з 3';
        counter.title = 'Увімкнено ' + enabled + ' з 3 автоматизацій';
        document.getElementById('mailAutoProgress').style.width = (enabled / 3 * 100) + '%';

        var block = document.getElementById('mailAuto');
        block.classList.toggle('is-readonly', !isAdmin);
        var head = document.getElementById('mailAutoHead');
        head.disabled = !isAdmin;
        head.setAttribute('aria-label', isAdmin ? 'Відкрити налаштування скриньки' : 'Налаштування скриньки (лише перегляд)');
    }

    /* ── Settings view (right column, like prod) ── */
    function fillOwners() {
        $('.js-owner').each(function () {
            this.innerHTML = OWNERS.map(function (o) {
                return '<option value="' + o.id + '">' + o.name + (o.short ? ' — ' + o.short.toLowerCase() : '') + '</option>';
            }).join('');
        });
    }

    function syncSubs() {
        $('[data-sub="deals"]').toggle($('#setDeals').prop('checked'));
        $('[data-sub="contacts"]').toggle($('#setContactsIn').prop('checked') || $('#setContactsOut').prop('checked'));
    }

    function syncSettings() {
        $('#setDeals').prop('checked', state.deals);
        $('#setContactsIn').prop('checked', state.contactsIn);
        $('#setContactsOut').prop('checked', state.contactsOut);
        $('#setDialogs').prop('checked', state.dialogs);
        $('#setPipeline').val(state.pipeline + '|' + state.stage);
        $('#setDealOwner').val(state.dealOwner);
        $('#setContactOwner').val(state.contactOwner);
        syncSubs();
    }

    function setView(view, section) {
        state.view = view;
        var isSettings = view === 'settings';
        $('#viewList').toggleClass('hidden', isSettings);
        $('#viewSettings').toggleClass('hidden', !isSettings);
        $('#mailAutoHead').toggleClass('active', isSettings);
        $('#mailFolders .folder-btn').toggleClass('active', false);
        $('#mailFolders .folder-btn[data-folder="' + view + '"]').addClass('active');
        if (isSettings && state.role !== 'admin') return setView('inbox');
        if (isSettings) {
            syncSettings();
            if (section) {
                var el = document.getElementById('sec-' + section);
                el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                el.classList.remove('is-target'); void el.offsetWidth; el.classList.add('is-target');
            }
        }
    }

    function readForm() {
        var pv = ($('#setPipeline').val() || '').split('|');
        return {
            deals: $('#setDeals').prop('checked'),
            contactsIn: $('#setContactsIn').prop('checked'),
            contactsOut: $('#setContactsOut').prop('checked'),
            dialogs: $('#setDialogs').prop('checked'),
            pipeline: pv[0], stage: pv[1],
            dealOwner: $('#setDealOwner').val(),
            contactOwner: $('#setContactOwner').val()
        };
    }

    var OFF_LABELS = {
        deals: 'Створення угод з нових листів',
        contactsIn: 'Створення контактів для вхідних листів',
        contactsOut: 'Створення контактів для вихідних листів',
        dialogs: 'Відповіді на листи: листи зникнуть з «Діалогів», чат-бот перестане відповідати'
    };

    var pending = null;

    function saveSettings() {
        var next = readForm();
        var turningOff = Object.keys(OFF_LABELS).filter(function (k) { return state[k] && !next[k]; });
        if (turningOff.length) {                       // conscious action: confirm before switching off
            pending = next;
            $('#confirmOffList').html(turningOff.map(function (k) { return '<li>' + OFF_LABELS[k] + '</li>'; }).join(''));
            $('#confirmOffModal').modal('show');
            return;
        }
        applySettings(next);
    }

    function applySettings(next) {
        $.extend(state, next);
        renderSidebar();
        toast('Налаштування скриньки збережено');
    }

    /* ── Feedback ── */
    /* Native SendPulse toast = Noty v3 markup + theme "bootstrap-v3" (styles live in template.min.css).
       Types: success | error | warning | info. Top-right, auto-close 3s, click to close. */
    function toast(text, type) {
        var layout = document.getElementById('noty_layout__topRight');
        if (!layout) {
            layout = document.createElement('div');
            layout.id = 'noty_layout__topRight';
            layout.className = 'noty_layout';
            layout.setAttribute('role', 'alert');
            layout.setAttribute('aria-live', 'polite');
            document.body.appendChild(layout);
        }
        var bar = document.createElement('div');
        bar.className = 'noty_bar noty_type__' + (type || 'success') + ' noty_theme__bootstrap-v3 noty_close_with_click noty_has_timeout noty_effects_open';
        bar.innerHTML = '<div class="noty_body"></div><div class="noty_progressbar"></div>';
        bar.firstChild.textContent = text;
        layout.appendChild(bar);
        var closed = false;
        function close() {
            if (closed) return; closed = true;
            bar.classList.remove('noty_effects_open');
            bar.classList.add('noty_effects_close');
            setTimeout(function () { bar.remove(); if (!layout.children.length) layout.remove(); }, 500);
        }
        bar.addEventListener('click', close);
        setTimeout(close, 3000);
    }

    /* ── Mail list mock ── */
    var MAILS = [
        ['SendPulse', 'Нове повідомлення в CRM', 'Привіт! У розділі «Пошта» вашої CRM з\'явився новий лист. Перейдіть за посиланням…', 28, '11 жовтня'],
        ['SendPulse CRM', 'Перегляньте прострочені угоди та завдання', 'Деталі в листі → Вітаємо! У вас є угоди, термін яких минув…', 1, '11 жовтня'],
        ['SendPulse CRM', 'Додайте першу угоду в CRM', 'Відстежуйте прогрес роботи з клієнтом. У попередньому листі ми…', 1, '11 жовтня'],
        ['SendPulse CRM', 'Наближається термін виконання завдання', 'Переглянути завдання → Ви нещодавно створили завдання…', 1, '11 жовтня'],
        ['Myawesomecompany', 'Комерційна пропозиція на IV квартал', 'Доброго дня! Надсилаємо оновлену пропозицію та умови співпраці…', 2, '10 жовтня'],
        ['Olena Koval', 'Re: Інтеграція з сайтом', 'Дякую, все працює. Підкажіть, будь ласка, як додати ще одну форму…', 3, '10 жовтня'],
        ['Example Store', 'Підтвердження замовлення #10482', 'Ваше замовлення прийнято в обробку. Очікуйте на повідомлення про доставку…', 1, '10 жовтня'],
        ['SendPulse CRM', 'Перегляньте прострочені угоди та завдання', 'Деталі в листі → Вітаємо! У вас є угоди, термін яких минув…', 1, '9 жовтня']
    ];

    function renderMails() {
        document.getElementById('mailRows').insertAdjacentHTML('beforeend', MAILS.map(function (m) {
            return '<tr class="contact-item-row">' +
                '<td class="checkbox-td"><input type="checkbox" aria-label="Вибрати лист"></td>' +
                '<td><div class="thread">' +
                    '<div class="thread__subject column">' +
                        '<span class="thread__subject-sender">' + m[0] + '</span>' +
                        '<span class="thread__subject-mail" title="' + m[1] + ' — ' + m[2] + '"><span class="bold">' + m[1] + '</span> - ' + m[2] + '</span>' +
                    '</div>' +
                    '<div class="thread__mail-count"><span class="sp-icon icon-reply"></span>' + m[3] + '</div>' +
                    '<div class="thread__mail-date column"><span class="thread__mail-date--value">' + m[4] + '</span><span class="sp-icon icon-star"></span></div>' +
                '</div></td>' +
            '</tr>';
        }).join(''));
    }

    /* ── Events ── */
    $(document)
        .on('change', '#viewSettings input[type="checkbox"]', syncSubs)
        .on('click', '.js-open-settings', function (e) { e.preventDefault(); if (state.role === 'admin') setView('settings'); })
        .on('click', 'a.mail-auto-row', function (e) { e.preventDefault(); setView('settings', this.getAttribute('data-section')); })
        .on('click', '#mailFolders .folder-btn', function () { setView(this.getAttribute('data-folder')); })
        .on('click', '#settingsSave', function () { saveSettings(); })
        .on('click', '#confirmOffYes', function () {
            $('#confirmOffModal').modal('hide');
            if (pending) { applySettings(pending); pending = null; }
        })
        .on('click', '.mailbox__list-select .dropdown-menu a, .mail-settings-delete', function (e) { e.preventDefault(); })
        .on('click', '[data-proto-state]', function () {
            $('[data-proto-state]').removeClass('active');
            $(this).addClass('active');
            $.extend(state, PRESETS[this.getAttribute('data-proto-state')]);
            renderSidebar();
            syncSettings();
        })
        .on('click', '[data-proto-role]', function () {
            $('[data-proto-role]').removeClass('active');
            $(this).addClass('active');
            state.role = this.getAttribute('data-proto-role');
            renderSidebar();
            if (state.role !== 'admin' && state.view === 'settings') setView('inbox');
        });

    fillOwners();
    renderSidebar();
    renderMails();
    syncSettings();
    $('[data-toggle="tooltip"]').tooltip({ container: 'body' });
})();
