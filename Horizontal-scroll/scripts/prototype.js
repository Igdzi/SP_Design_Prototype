(function () {
    const statuses = [
        { name: 'Нові', color: '#d5c1ff', width: 73, active: true },
        { name: 'Підтвердження', color: '#f5e8c4', width: 147 },
        { name: 'В роботі', color: '#fad0fa', width: 102 },
        { name: 'Для передачі на бухгалтера та', color: '#f29f8a', width: 250 },
        { name: 'Завершено', color: '#9fdcfe', width: 122 },
        { name: 'Виконано', color: '#f5e8c4', width: 111 },
        { name: 'Готово до наступного кроку', color: '#ffcccc', width: 236 },
        { name: 'Очікує підтвердження', color: '#e4e4e4', width: 194 },
        { name: 'В процесі апрува', color: '#c2eef7', width: 162 },
        { name: 'Відкладено', color: '#f5d19f', width: 123 },
        { name: 'Потребує уваги', color: '#c3d1e3', width: 153 },
        { name: 'Завершено успішно', color: '#c8f0dd', width: 180 }
    ];

    const carousel = document.querySelector('[data-status-carousel]');
    if (!carousel) {
        return;
    }

    const viewport = carousel.querySelector('[data-status-viewport]');
    const track = carousel.querySelector('[data-status-track]');
    const prevButton = carousel.querySelector('[data-scroll-prev]');
    const nextButton = carousel.querySelector('[data-scroll-next]');

    function renderStatuses() {
        const fragment = document.createDocumentFragment();

        statuses.forEach((status) => {
            const item = document.createElement('button');
            item.className = status.active ? 'step status-pill active' : 'step status-pill';
            item.type = 'button';
            item.title = status.name;
            item.style.setProperty('--status-color', status.color);
            item.style.width = `${status.width}px`;
            item.setAttribute('aria-pressed', status.active ? 'true' : 'false');

            const dot = document.createElement('span');
            dot.className = 'status-dot';
            dot.setAttribute('aria-hidden', 'true');

            const name = document.createElement('span');
            name.className = 'status-name';
            name.textContent = status.name;

            item.append(dot, name);
            fragment.append(item);
        });

        track.append(fragment);
    }

    function getMaxScroll() {
        return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function clampScroll(left) {
        return Math.min(getMaxScroll(), Math.max(0, left));
    }

    function getItemLeft(item) {
        return item.offsetLeft - track.offsetLeft;
    }

    function scrollToLeft(left) {
        const targetLeft = clampScroll(left);

        viewport.scrollTo({
            left: targetLeft,
            behavior: 'smooth'
        });

        window.setTimeout(() => {
            if (Math.abs(viewport.scrollLeft - targetLeft) > 2) {
                viewport.scrollLeft = targetLeft;
            }

            updateArrowState();
        }, 120);
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

    renderStatuses();
    bindDragScroll();

    carousel.addEventListener('click', (event) => {
        const button = event.target.closest('[data-scroll-prev], [data-scroll-next]');
        if (!button || button.disabled) {
            return;
        }

        scrollBySection(button === prevButton ? -1 : 1);
    });

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
