(function () {
    const statuses = [
        { name: 'Нові', color: '#d5c1ff', width: 82, active: true },
        { name: 'Підтвердження', color: '#f5e8c4', width: 147 },
        { name: 'В роботі', color: '#fad0fa', width: 102 },
        {
            name: 'Для передачі на бухгалтера та фінансиста',
            color: '#f29f8a',
            width: 250,
            hoverWidth: 326,
            truncateWidth: 204
        },
        { name: 'Завершено', color: '#9fdcfe', width: 122 },
        { name: 'Виконано', color: '#f5e8c4', width: 111 },
        { name: 'Готово до наступного кроку', color: '#ffcccc', width: 236 },
        { name: 'Очікує підтвердження', color: '#e4e4e4', width: 194 },
        { name: 'В процесі апрува', color: '#c2eef7', width: 162 },
        { name: 'Відкладено', color: '#f5d19f', width: 123 },
        { name: 'Потребує уваги', color: '#c3d1e3', width: 153 },
        { name: 'Завершено успішно', color: '#c8f0dd', width: 180 },
        { name: 'Перевірка документів', color: '#b7e3ff', width: 182 },
        { name: 'Очікує оплату', color: '#ffe1a8', width: 138 },
        { name: 'Погодження умов', color: '#ddc7ff', width: 156 },
        { name: 'Уточнення деталей', color: '#ffd4c8', width: 158 },
        { name: 'Підготовка рахунку', color: '#d6f6c6', width: 174 },
        { name: 'Фінальна перевірка', color: '#d8e0f0', width: 166 },
        { name: 'Архівовано', color: '#d9d9d9', width: 120 }
    ];

    const carousel = document.querySelector('[data-status-carousel]');
    if (!carousel) {
        return;
    }

    const viewport = carousel.querySelector('[data-status-viewport]');
    const track = carousel.querySelector('[data-status-track]');
    const prevButton = carousel.querySelector('[data-scroll-prev]');
    const nextButton = carousel.querySelector('[data-scroll-next]');
    const addedScrollButton = document.querySelector('[data-switcher-option="added-scroll"]');
    const addedNoScrollButton = document.querySelector('[data-switcher-option="added-no-scroll"]');
    let scrollAnimationId = null;

    function renderStatuses() {
        const fragment = document.createDocumentFragment();

        statuses.forEach((status, index) => {
            const item = document.createElement('button');
            item.className = status.active ? 'step status-pill active' : 'step status-pill';
            item.classList.toggle('is-truncated', Boolean(status.truncateWidth));
            item.type = 'button';
            item.title = status.name;
            item.dataset.statusIndex = String(index);
            item.style.setProperty('--status-color', status.color);
            item.style.setProperty('--status-hover-width', `${status.hoverWidth || status.width}px`);
            if (status.truncateWidth) {
                item.style.width = `${status.width}px`;
            } else {
                item.style.minWidth = `${status.width}px`;
            }

            item.setAttribute('aria-pressed', status.active ? 'true' : 'false');

            const dot = document.createElement('span');
            dot.className = 'status-dot';
            dot.setAttribute('aria-hidden', 'true');

            const name = document.createElement('span');
            name.className = 'status-name';
            if (status.truncateWidth) {
                name.style.maxWidth = `${status.truncateWidth}px`;
            }

            name.textContent = status.name;

            item.append(dot, name);
            fragment.append(item);
        });

        track.append(fragment);
    }

    function getMaxScroll() {
        if (carousel.classList.contains('is-no-scroll')) {
            return 0;
        }

        return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function clampScroll(left) {
        return Math.min(getMaxScroll(), Math.max(0, left));
    }

    function getItemLeft(item) {
        return item.offsetLeft - track.offsetLeft;
    }

    function easeInOutCubic(progress) {
        return progress < .5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    }

    function scrollToLeft(left) {
        const targetLeft = clampScroll(left);
        const startLeft = viewport.scrollLeft;
        const distance = targetLeft - startLeft;
        const duration = Math.min(900, Math.max(420, Math.abs(distance) * .72));
        const startTime = window.performance.now();

        if (scrollAnimationId) {
            window.cancelAnimationFrame(scrollAnimationId);
        }

        function animate(now) {
            const progress = Math.min(1, (now - startTime) / duration);
            viewport.scrollLeft = clampScroll(startLeft + distance * easeInOutCubic(progress));

            if (progress < 1) {
                scrollAnimationId = window.requestAnimationFrame(animate);
                return;
            }

            viewport.scrollLeft = targetLeft;
            scrollAnimationId = null;
            updateArrowState();
        }

        scrollAnimationId = window.requestAnimationFrame(animate);
    }

    function updateArrowState() {
        const maxScroll = getMaxScroll();
        const left = viewport.scrollLeft;
        const hasOverflow = maxScroll > 1;
        const atStart = left <= 1;
        const atEnd = left >= maxScroll - 1;

        prevButton.disabled = !hasOverflow || atStart;
        nextButton.disabled = !hasOverflow || atEnd;
        prevButton.classList.toggle('is-disabled', prevButton.disabled);
        nextButton.classList.toggle('is-disabled', nextButton.disabled);
    }

    function getVisibleItems() {
        const items = Array.from(track.querySelectorAll('.status-pill'));
        const start = viewport.scrollLeft;
        const end = start + viewport.clientWidth;

        return items.filter((item) => {
            const itemStart = getItemLeft(item);
            const itemEnd = itemStart + item.offsetWidth;
            return itemStart < end - 2 && itemEnd > start + 2;
        });
    }

    function scrollBySection(direction) {
        const items = Array.from(track.querySelectorAll('.status-pill'));
        const visibleItems = getVisibleItems();
        const visibleCount = Math.max(1, visibleItems.length);
        let targetIndex = 0;

        if (direction > 0) {
            const lastVisible = visibleItems[visibleItems.length - 1];
            const lastIndex = items.indexOf(lastVisible);
            targetIndex = Math.min(items.length - 1, lastIndex + 1);
        } else {
            const firstVisible = visibleItems[0];
            const firstIndex = items.indexOf(firstVisible);
            targetIndex = Math.max(0, firstIndex - visibleCount);
        }

        const target = items[targetIndex] ? getItemLeft(items[targetIndex]) : 0;
        scrollToLeft(target);
    }

    function handleWheel(event) {
        const maxScroll = getMaxScroll();
        if (maxScroll <= 1) {
            return;
        }

        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (!delta) {
            return;
        }

        event.preventDefault();
        if (scrollAnimationId) {
            window.cancelAnimationFrame(scrollAnimationId);
            scrollAnimationId = null;
        }

        viewport.scrollLeft = clampScroll(viewport.scrollLeft + delta);
    }

    function bindDragScroll() {
        let pointerId = null;
        let startX = 0;
        let startScrollLeft = 0;
        let moved = false;

        viewport.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || getMaxScroll() <= 1) {
                return;
            }

            pointerId = event.pointerId;
            startX = event.clientX;
            startScrollLeft = viewport.scrollLeft;
            moved = false;
            if (scrollAnimationId) {
                window.cancelAnimationFrame(scrollAnimationId);
                scrollAnimationId = null;
            }

            viewport.classList.add('is-dragging');
            viewport.setPointerCapture(pointerId);
        });

        viewport.addEventListener('pointermove', (event) => {
            if (pointerId !== event.pointerId) {
                return;
            }

            const distance = event.clientX - startX;
            if (Math.abs(distance) > 3) {
                moved = true;
            }

            viewport.scrollLeft = clampScroll(startScrollLeft - distance);
        });

        function endDrag(event) {
            if (pointerId !== event.pointerId) {
                return;
            }

            viewport.classList.remove('is-dragging');
            viewport.releasePointerCapture(pointerId);
            pointerId = null;
            window.setTimeout(() => {
                moved = false;
            }, 0);
        }

        viewport.addEventListener('pointerup', endDrag);
        viewport.addEventListener('pointercancel', endDrag);

        track.addEventListener('click', (event) => {
            if (moved) {
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }

    function activateStatus(item) {
        if (!item) {
            return;
        }

        const items = Array.from(track.querySelectorAll('.status-pill'));
        const status = statuses[Number(item.dataset.statusIndex)];
        if (!status) {
            return;
        }

        items.forEach((statusItem) => {
            const isActive = statusItem === item;
            const statusItemData = statuses[Number(statusItem.dataset.statusIndex)];
            const dot = statusItem.querySelector('.status-dot');
            const name = statusItem.querySelector('.status-name');
            statusItem.classList.toggle('active', isActive);
            statusItem.setAttribute('aria-pressed', isActive ? 'true' : 'false');

            if (isActive) {
                statusItem.style.setProperty('background', statusItemData.color, 'important');
                statusItem.style.setProperty('background-color', statusItemData.color, 'important');
                statusItem.style.setProperty('box-shadow', `inset 0 0 0 999px ${statusItemData.color}`, 'important');
                statusItem.style.setProperty('color', '#023346', 'important');
                statusItem.style.setProperty('font-weight', '700', 'important');
                name.style.setProperty('color', '#023346', 'important');
                name.style.setProperty('font-weight', '700', 'important');
                dot.style.setProperty('background', '#fff', 'important');
                dot.style.setProperty('background-color', '#fff', 'important');
                dot.style.borderColor = statusItemData.color;
                return;
            }

            statusItem.style.removeProperty('background');
            statusItem.style.removeProperty('background-color');
            statusItem.style.removeProperty('box-shadow');
            statusItem.style.removeProperty('color');
            statusItem.style.removeProperty('font-weight');
            name.style.removeProperty('color');
            name.style.removeProperty('font-weight');
            dot.style.removeProperty('background');
            dot.style.removeProperty('background-color');
            dot.style.borderColor = '';
        });
    }

    function setAddedDrawerScrollMode(hasScroll) {
        carousel.classList.toggle('is-no-scroll', !hasScroll);
        viewport.scrollLeft = 0;

        if (scrollAnimationId) {
            window.cancelAnimationFrame(scrollAnimationId);
            scrollAnimationId = null;
        }

        if (addedScrollButton && addedNoScrollButton) {
            addedScrollButton.classList.toggle('btn-primary', hasScroll);
            addedScrollButton.classList.toggle('btn-default', !hasScroll);
            addedNoScrollButton.classList.toggle('btn-primary', !hasScroll);
            addedNoScrollButton.classList.toggle('btn-default', hasScroll);
        }

        updateArrowState();
    }

    renderStatuses();
    activateStatus(track.querySelector('.status-pill.active'));
    bindDragScroll();

    carousel.addEventListener('click', (event) => {
        const button = event.target.closest('[data-scroll-prev], [data-scroll-next]');
        if (!button || button.disabled) {
            return;
        }

        scrollBySection(button === prevButton ? -1 : 1);
    });

    track.addEventListener('click', (event) => {
        const item = event.target.closest('.status-pill');
        if (!item) {
            return;
        }

        activateStatus(item);
    });

    addedScrollButton?.addEventListener('click', () => setAddedDrawerScrollMode(true));
    addedNoScrollButton?.addEventListener('click', () => setAddedDrawerScrollMode(false));

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('scroll', updateArrowState, { passive: true });
    window.addEventListener('resize', updateArrowState);

    updateArrowState();

    window.horizontalScrollPrototype = {
        viewport,
        scrollNext: () => scrollBySection(1),
        scrollPrev: () => scrollBySection(-1),
        statuses
    };
}());
