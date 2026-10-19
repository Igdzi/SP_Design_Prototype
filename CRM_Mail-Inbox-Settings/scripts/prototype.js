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
        dealOwner: 'ok',
        contactOwner: 'me'
    }, PRESETS.mixed);

    function owner(id) {
        for (var i = 0; i < OWNERS.length; i++) if (OWNERS[i].id === id) return OWNERS[i];
        return OWNERS[0];
    }

    function avatar(o) {
        return '<span class="mail-avatar" style="background:' + o.color + '" aria-hidden="true">' + o.initials + '</span>';
    }

    function ownerLabel(o) {
        return o.name + (o.short ? ' <span class="text-muted">· ' + o.short + '</span>' : '');
    }

    function switcher(id, key, checked, label) {
        return '<span class="inline-block">' +
            '<input class="switcher-toggle js-auto-toggle" type="checkbox" id="' + id + '" data-key="' + key + '"' + (checked ? ' checked' : '') + ' aria-label="' + label + '">' +
            '<label for="' + id + '"></label></span>';
    }

    function status(on, textOn, textOff) {
        return '<div class="mail-auto-status">' +
            '<span class="badge badge-status ' + (on ? 'status-green' : 'status-default') + '"> </span>' +
            '<span>' + (on ? textOn : textOff) + '</span></div>';
    }

    function contactsStatusText() {
        if (state.contactsIn && state.contactsOut) return 'Для вхідних і вихідних';
        if (state.contactsIn) return 'Для вхідних';
        if (state.contactsOut) return 'Для вихідних';
        return 'Вимкнено';
    }

    /* ── Sidebar block ── */
    function row(o) {
        return '<div class="mail-auto-item' + (o.on ? ' is-on' : '') + '" data-item="' + o.item + '">' +
            '<span class="mail-auto-icon"><span class="sp-icon ' + o.icon + '"></span></span>' +
            '<div>' +
                '<div class="mail-auto-top"><span class="mail-auto-name">' + o.name + '</span>' + (o.switcher || '') + '</div>' +
                status(o.on, o.statusOn, 'Вимкнено') +
                '<p class="mail-auto-desc">' + o.desc + '</p>' +
                (o.subs || '') +
                (o.meta ? '<dl class="mail-auto-meta">' + o.meta + '</dl>' : '') +
                (o.on && o.link ? o.link : '') +
            '</div>' +
        '</div>';
    }

    function ownerDd(o) {
        return '<dd>' + avatar(o) + '<span class="mail-auto-meta-value" title="' + o.name + '">' + ownerLabel(o) + '</span></dd>';
    }

    function renderSidebar() {
        var dealO = owner(state.dealOwner);
        var contO = owner(state.contactOwner);
        var contactsOn = state.contactsIn || state.contactsOut;

        var html =
            row({
                item: 'deals', on: state.deals, icon: 'icon-deal', name: 'Створення угод',
                switcher: switcher('swDeals', 'deals', state.deals, 'Створення угод'),
                statusOn: 'Увімкнено',
                desc: 'Лист із нової адреси одразу стане угодою у воронці',
                meta: '<dt>Воронка та статус</dt><dd><span class="mail-auto-meta-value" title="' + state.pipeline + ' · ' + state.stage + '">' + state.pipeline + ' · ' + state.stage + '</span></dd>' +
                      '<dt>Відповідальний</dt>' + ownerDd(dealO),
                link: '<a href="#" class="mail-auto-edit" data-section="deals">Змінити</a>'
            }) +
            row({
                item: 'contacts', on: contactsOn, icon: 'icon-contact', name: 'Створення контактів',
                statusOn: contactsStatusText(),
                desc: 'Нові адреси з листування потраплять у контакти',
                subs: '<ul class="mail-auto-subs">' +
                        '<li><span>Вхідні листи</span>' + switcher('swContactsIn', 'contactsIn', state.contactsIn, 'Контакти для вхідних листів') + '</li>' +
                        '<li><span>Вихідні листи</span>' + switcher('swContactsOut', 'contactsOut', state.contactsOut, 'Контакти для вихідних листів') + '</li>' +
                      '</ul>',
                meta: '<dt>Відповідальний</dt>' + ownerDd(contO),
                link: '<a href="#" class="mail-auto-edit" data-section="contacts">Змінити</a>'
            }) +
            row({
                item: 'dialogs', on: state.dialogs, icon: 'icon-comment', name: 'Відповіді <span class="mail-auto-nowrap">на листи<sup class="color-active">NEW</sup></span>',
                switcher: switcher('swDialogs', 'dialogs', state.dialogs, 'Відповіді на листи'),
                statusOn: 'Увімкнено',
                desc: 'Додавання листів у розділ «Діалоги» та автоматизація через чат-бота',
                meta: '<dd><span class="mail-auto-meta-value is-wrap">Нові листи з\'являються в «Діалогах»</span></dd>',
                link: '<a href="#" class="mail-auto-edit js-goto-dialogs">Налаштувати чат-бота</a>'
            });

        document.getElementById('mailAutoList').innerHTML = html;

        var enabled = (state.deals ? 1 : 0) + (contactsOn ? 1 : 0) + (state.dialogs ? 1 : 0);
        var counter = document.getElementById('mailAutoCounter');
        counter.textContent = enabled + ' з 3';
        counter.title = 'Увімкнено ' + enabled + ' з 3 автоматизацій';
        document.getElementById('mailAutoProgress').style.width = (enabled / 3 * 100) + '%';
        document.getElementById('mailAuto').classList.toggle('is-empty', enabled === 0);
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
        $('.js-open-settings').toggleClass('active', isSettings);
        $('#mailFolders .folder-btn').toggleClass('active', false);
        $('#mailFolders .folder-btn[data-folder="' + view + '"]').addClass('active');
        if (isSettings) {
            syncSettings();
            if (section) {
                var el = document.getElementById('sec-' + section);
                el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                el.classList.remove('is-target'); void el.offsetWidth; el.classList.add('is-target');
            }
        }
    }

    function saveSettings() {
        var pv = ($('#setPipeline').val() || '').split('|');
        state.deals = $('#setDeals').prop('checked');
        state.contactsIn = $('#setContactsIn').prop('checked');
        state.contactsOut = $('#setContactsOut').prop('checked');
        state.dialogs = $('#setDialogs').prop('checked');
        state.pipeline = pv[0]; state.stage = pv[1];
        state.dealOwner = $('#setDealOwner').val();
        state.contactOwner = $('#setContactOwner').val();
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

    function flash(item) {
        var row = document.querySelector('[data-item="' + item + '"]');
        if (!row) return;
        row.classList.add('is-flash');
        setTimeout(function () { row.classList.remove('is-flash'); }, 600);
    }

    var LABELS = {
        deals: 'Створення угод',
        contactsIn: 'Контакти з вхідних листів',
        contactsOut: 'Контакти з вихідних листів',
        dialogs: 'Відповіді на листи'
    };

    function applyToggle(key, value) {
        state[key] = value;
        renderSidebar();
        syncSettings();
        flash(key.indexOf('contacts') === 0 ? 'contacts' : key);
        var msg = LABELS[key] + (value ? ' увімкнено' : ' вимкнено');
        toast(msg, value ? 'success' : 'info');   // off → neutral info alert
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
        .on('change', '.js-auto-toggle', function () {
            applyToggle(this.getAttribute('data-key'), this.checked);
        })
        .on('change', '#viewSettings input[type="checkbox"]', syncSubs)
        .on('click', '.js-open-settings', function (e) { e.preventDefault(); $(this).tooltip('hide'); setView('settings'); })
        .on('click', '.mail-auto-edit[data-section]', function (e) { e.preventDefault(); setView('settings', this.getAttribute('data-section')); })
        .on('click', '.js-goto-dialogs', function (e) { e.preventDefault(); })
        .on('click', '#mailFolders .folder-btn', function () { setView(this.getAttribute('data-folder')); })
        .on('click', '#settingsSave', function () { saveSettings(); })
        .on('click', '.mailbox__list-select .dropdown-menu a, .mail-settings-delete', function (e) { e.preventDefault(); })
        .on('click', '[data-proto-state]', function () {
            $('[data-proto-state]').removeClass('active');
            $(this).addClass('active');
            $.extend(state, PRESETS[this.getAttribute('data-proto-state')]);
            renderSidebar();
            syncSettings();
        });

    fillOwners();
    renderSidebar();
    renderMails();
    syncSettings();
    $('[data-toggle="tooltip"]').tooltip({ container: 'body' });
})();
