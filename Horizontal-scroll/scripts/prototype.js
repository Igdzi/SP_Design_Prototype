(function () {
    const statuses = [
        { name: 'Нові', color: '#d5c1ff', width: 82, active: true },
        { name: 'Підтвердження', color: '#f5e8c4', width: 147 },
        { name: 'В роботі', color: '#fad0fa', width: 102 },
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

    const addStatuses = [
        { name: 'Нові', color: '#c2eef7', width: 78, active: true },
        { name: 'В роботі', color: '#f5e7c4', width: 102 },
        { name: 'На підпис', color: '#c8f0dd', width: 104 },
        { name: 'Очікує оплату', color: '#ffe1a8', width: 132 },
        { name: 'Погодження', color: '#ddc7ff', width: 118 },
        { name: 'Підготовка', color: '#d6f6c6', width: 114 },
        { name: 'Перевірка', color: '#b7e3ff', width: 108 },
        { name: 'Уточнення', color: '#ffd4c8', width: 112 },
        { name: 'Доставка', color: '#e4e4e4', width: 108 },
        { name: 'Закриття', color: '#d8e0f0', width: 104 },
        { name: 'Архів', color: '#d9d9d9', width: 82 }
    ];

    const carousel = document.querySelector('[data-status-carousel]');
    if (!carousel) {
        return;
    }

    const addDrawer = document.querySelector('[data-add-drawer]');
    const addedDrawer = document.querySelector('[data-added-drawer]');
    const addCarousel = document.querySelector('[data-add-status-carousel]');
    const addViewport = addCarousel?.querySelector('[data-add-status-viewport]');
    const addTrack = addCarousel?.querySelector('[data-add-status-track]');
    const addPrevButton = addCarousel?.querySelector('[data-add-scroll-prev]');
    const addNextButton = addCarousel?.querySelector('[data-add-scroll-next]');
    const viewport = carousel.querySelector('[data-status-viewport]');
    const track = carousel.querySelector('[data-status-track]');
    const prevButton = carousel.querySelector('[data-scroll-prev]');
    const nextButton = carousel.querySelector('[data-scroll-next]');
    const tabsCarousel = document.querySelector('[data-tabs-carousel]');
    const tabsViewport = tabsCarousel?.querySelector('[data-tabs-viewport]');
    const tabsTrack = tabsCarousel?.querySelector('[data-tabs-track]');
    const tabsPrevButton = tabsCarousel?.querySelector('[data-tabs-prev]');
    const tabsNextButton = tabsCarousel?.querySelector('[data-tabs-next]');
    const addDrawerButton = document.querySelector('[data-drawer-option="add"]');
    const addedDrawerButton = document.querySelector('[data-drawer-option="added"]');
    const scrollModeButton = document.querySelector('[data-scroll-mode="scroll"]');
    const noScrollModeButton = document.querySelector('[data-scroll-mode="no-scroll"]');
    const dragSelectThreshold = 8;
    const tabsDragSelectThreshold = 3;
    let addScrollAnimationId = null;
    let scrollAnimationId = null;
    let tabsScrollAnimationId = null;
    let suppressAddClickUntil = 0;
    let suppressClickUntil = 0;
    let suppressTabsClickUntil = 0;
    let activeDrawer = 'added';
    let addDrawerHasScroll = true;
    let addedDrawerHasScroll = true;

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
            item.style.setProperty('--status-hover-width', `${status.width}px`);
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

    function renderAddStatuses() {
        if (!addTrack) {
            return;
        }

        const fragment = document.createDocumentFragment();

        addStatuses.forEach((status, index) => {
            const item = document.createElement('button');
            item.className = status.active ? 'step add-status-pill active' : 'step add-status-pill';
            item.type = 'button';
            item.title = status.name;
            item.dataset.addStatusIndex = String(index);
            item.style.setProperty('--add-status-color', status.color);
            item.style.setProperty('--add-status-width', `${status.width}px`);
            item.setAttribute('aria-pressed', status.active ? 'true' : 'false');

            const dot = document.createElement('span');
            dot.className = 'add-status-dot';
            dot.setAttribute('aria-hidden', 'true');

            const name = document.createElement('span');
            name.className = 'add-status-name';
            name.textContent = status.name;

            item.append(dot, name);
            fragment.append(item);
        });

        addTrack.append(fragment);
    }

    function updateTruncatedHoverWidths() {
        track.querySelectorAll('.status-pill.is-truncated').forEach((item) => {
            const name = item.querySelector('.status-name');
            const dot = item.querySelector('.status-dot');
            const styles = window.getComputedStyle(item);
            const gap = parseFloat(styles.columnGap || styles.gap) || 0;
            const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
            const fullWidth = Math.ceil(name.scrollWidth + dot.offsetWidth + gap + padding);

            item.style.setProperty('--status-hover-width', `${fullWidth}px`);
        });
    }

    function getMaxScroll() {
        if (carousel.classList.contains('is-no-scroll')) {
            return 0;
        }

        return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function getAddMaxScroll() {
        if (!addCarousel || addCarousel.classList.contains('is-no-scroll')) {
            return 0;
        }

        return Math.max(0, addViewport.scrollWidth - addViewport.clientWidth);
    }

    function clampScroll(left) {
        return Math.min(getMaxScroll(), Math.max(0, left));
    }

    function clampAddScroll(left) {
        return Math.min(getAddMaxScroll(), Math.max(0, left));
    }

    function getItemLeft(item) {
        return item.offsetLeft - track.offsetLeft;
    }

    function getAddItemLeft(item) {
        return item.offsetLeft - addTrack.offsetLeft;
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

    function scrollAddToLeft(left) {
        const targetLeft = clampAddScroll(left);
        const startLeft = addViewport.scrollLeft;
        const distance = targetLeft - startLeft;
        const duration = Math.min(900, Math.max(420, Math.abs(distance) * .72));
        const startTime = window.performance.now();

        if (addScrollAnimationId) {
            window.cancelAnimationFrame(addScrollAnimationId);
        }

        function animate(now) {
            const progress = Math.min(1, (now - startTime) / duration);
            addViewport.scrollLeft = clampAddScroll(startLeft + distance * easeInOutCubic(progress));

            if (progress < 1) {
                addScrollAnimationId = window.requestAnimationFrame(animate);
                return;
            }

            addViewport.scrollLeft = targetLeft;
            addScrollAnimationId = null;
            updateAddArrowState();
        }

        addScrollAnimationId = window.requestAnimationFrame(animate);
    }

    function getTabsMaxScroll() {
        if (!tabsCarousel || tabsCarousel.classList.contains('is-no-scroll')) {
            return 0;
        }

        return Math.max(0, tabsViewport.scrollWidth - tabsViewport.clientWidth);
    }

    function clampTabsScroll(left) {
        return Math.min(getTabsMaxScroll(), Math.max(0, left));
    }

    function getTabLeft(item) {
        return item.offsetLeft - tabsTrack.offsetLeft;
    }

    function scrollTabsToLeft(left) {
        const targetLeft = clampTabsScroll(left);
        const startLeft = tabsViewport.scrollLeft;
        const distance = targetLeft - startLeft;
        const duration = Math.min(900, Math.max(420, Math.abs(distance) * .72));
        const startTime = window.performance.now();

        if (tabsScrollAnimationId) {
            window.cancelAnimationFrame(tabsScrollAnimationId);
        }

        function animate(now) {
            const progress = Math.min(1, (now - startTime) / duration);
            tabsViewport.scrollLeft = clampTabsScroll(startLeft + distance * easeInOutCubic(progress));

            if (progress < 1) {
                tabsScrollAnimationId = window.requestAnimationFrame(animate);
                return;
            }

            tabsViewport.scrollLeft = targetLeft;
            tabsScrollAnimationId = null;
            updateTabsArrowState();
        }

        tabsScrollAnimationId = window.requestAnimationFrame(animate);
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

    function updateAddArrowState() {
        if (!addPrevButton || !addNextButton) {
            return;
        }

        const maxScroll = getAddMaxScroll();
        const left = addViewport.scrollLeft;
        const hasOverflow = maxScroll > 1;
        const atStart = left <= 1;
        const atEnd = left >= maxScroll - 1;

        addPrevButton.disabled = !hasOverflow || atStart;
        addNextButton.disabled = !hasOverflow || atEnd;
        addPrevButton.classList.toggle('is-disabled', addPrevButton.disabled);
        addNextButton.classList.toggle('is-disabled', addNextButton.disabled);
    }

    function updateTabsArrowState() {
        if (!tabsPrevButton || !tabsNextButton) {
            return;
        }

        const maxScroll = getTabsMaxScroll();
        const left = tabsViewport.scrollLeft;
        const hasOverflow = maxScroll > 1;
        const atStart = left <= 1;
        const atEnd = left >= maxScroll - 1;

        tabsPrevButton.disabled = !hasOverflow || atStart;
        tabsNextButton.disabled = !hasOverflow || atEnd;
        tabsPrevButton.classList.toggle('is-disabled', tabsPrevButton.disabled);
        tabsNextButton.classList.toggle('is-disabled', tabsNextButton.disabled);
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

    function getVisibleAddItems() {
        const items = Array.from(addTrack.querySelectorAll('.add-status-pill'));
        const start = addViewport.scrollLeft;
        const end = start + addViewport.clientWidth;

        return items.filter((item) => {
            const itemStart = getAddItemLeft(item);
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

    function scrollAddBySection(direction) {
        const items = Array.from(addTrack.querySelectorAll('.add-status-pill'));
        const visibleItems = getVisibleAddItems();
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

        const target = items[targetIndex] ? getAddItemLeft(items[targetIndex]) : 0;
        scrollAddToLeft(target);
    }

    function getVisibleTabs() {
        const items = Array.from(tabsTrack.querySelectorAll('.drawer-tab'));
        const start = tabsViewport.scrollLeft;
        const end = start + tabsViewport.clientWidth;

        return items.filter((item) => {
            const itemStart = getTabLeft(item);
            const itemEnd = itemStart + item.offsetWidth;
            return itemStart < end - 2 && itemEnd > start + 2;
        });
    }

    function scrollTabsBySection(direction) {
        const items = Array.from(tabsTrack.querySelectorAll('.drawer-tab'));
        const visibleItems = getVisibleTabs();
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

        const target = items[targetIndex] ? getTabLeft(items[targetIndex]) : 0;
        scrollTabsToLeft(target);
    }

    function scrollSelectedIntoView(item) {
        if (carousel.classList.contains('is-no-scroll') || getMaxScroll() <= 1) {
            return;
        }

        const itemLeft = getItemLeft(item);
        const itemRight = itemLeft + item.offsetWidth;
        const viewportLeft = viewport.scrollLeft;
        const viewportRight = viewportLeft + viewport.clientWidth;
        const edgePadding = 8;

        if (itemLeft < viewportLeft + edgePadding) {
            scrollToLeft(itemLeft - edgePadding);
            return;
        }

        if (itemRight > viewportRight - edgePadding) {
            scrollToLeft(itemRight - viewport.clientWidth + edgePadding);
        }
    }

    function scrollSelectedAddIntoView(item) {
        if (!addCarousel || addCarousel.classList.contains('is-no-scroll') || getAddMaxScroll() <= 1) {
            return;
        }

        const itemLeft = getAddItemLeft(item);
        const itemRight = itemLeft + item.offsetWidth;
        const viewportLeft = addViewport.scrollLeft;
        const viewportRight = viewportLeft + addViewport.clientWidth;
        const edgePadding = 8;

        if (itemLeft < viewportLeft + edgePadding) {
            scrollAddToLeft(itemLeft - edgePadding);
            return;
        }

        if (itemRight > viewportRight - edgePadding) {
            scrollAddToLeft(itemRight - addViewport.clientWidth + edgePadding);
        }
    }

    function scrollSelectedTabIntoView(item) {
        if (!tabsCarousel || tabsCarousel.classList.contains('is-no-scroll') || getTabsMaxScroll() <= 1) {
            return;
        }

        const itemLeft = getTabLeft(item);
        const itemRight = itemLeft + item.offsetWidth;
        const viewportLeft = tabsViewport.scrollLeft;
        const viewportRight = viewportLeft + tabsViewport.clientWidth;
        const edgePadding = 8;

        if (itemLeft < viewportLeft + edgePadding) {
            scrollTabsToLeft(itemLeft - edgePadding);
            return;
        }

        if (itemRight > viewportRight - edgePadding) {
            scrollTabsToLeft(itemRight - tabsViewport.clientWidth + edgePadding);
        }
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

    function handleAddWheel(event) {
        const maxScroll = getAddMaxScroll();
        if (maxScroll <= 1) {
            return;
        }

        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (!delta) {
            return;
        }

        event.preventDefault();
        if (addScrollAnimationId) {
            window.cancelAnimationFrame(addScrollAnimationId);
            addScrollAnimationId = null;
        }

        addViewport.scrollLeft = clampAddScroll(addViewport.scrollLeft + delta);
    }

    function handleTabsWheel(event) {
        const maxScroll = getTabsMaxScroll();
        if (maxScroll <= 1) {
            return;
        }

        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (!delta) {
            return;
        }

        event.preventDefault();
        if (tabsScrollAnimationId) {
            window.cancelAnimationFrame(tabsScrollAnimationId);
            tabsScrollAnimationId = null;
        }

        tabsViewport.scrollLeft = clampTabsScroll(tabsViewport.scrollLeft + delta);
    }

    function bindDragScroll() {
        let pointerId = null;
        let startX = 0;
        let startScrollLeft = 0;
        let moved = false;
        let pressedPill = null;

        viewport.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || getMaxScroll() <= 1) {
                return;
            }

            pointerId = event.pointerId;
            startX = event.clientX;
            startScrollLeft = viewport.scrollLeft;
            moved = false;
            pressedPill = event.target.closest('.status-pill');
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
            if (Math.abs(distance) > dragSelectThreshold) {
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

            const scrollMoved = Math.abs(viewport.scrollLeft - startScrollLeft) > dragSelectThreshold;
            if (!moved && !scrollMoved && pressedPill) {
                activateStatus(pressedPill);
            } else if (moved || scrollMoved) {
                suppressClickUntil = window.performance.now() + 250;
            }

            pointerId = null;
            pressedPill = null;
            window.setTimeout(() => {
                moved = false;
            }, 0);
        }

        viewport.addEventListener('pointerup', endDrag);
        viewport.addEventListener('pointercancel', endDrag);

        track.addEventListener('click', (event) => {
            if (moved || window.performance.now() < suppressClickUntil) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        });
    }

    function bindAddDragScroll() {
        if (!addViewport || !addTrack) {
            return;
        }

        let pointerId = null;
        let startX = 0;
        let startScrollLeft = 0;
        let moved = false;
        let pressedPill = null;

        addViewport.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || getAddMaxScroll() <= 1) {
                return;
            }

            event.preventDefault();
            pointerId = event.pointerId;
            startX = event.clientX;
            startScrollLeft = addViewport.scrollLeft;
            moved = false;
            pressedPill = event.target.closest('.add-status-pill');

            if (addScrollAnimationId) {
                window.cancelAnimationFrame(addScrollAnimationId);
                addScrollAnimationId = null;
            }

            addViewport.classList.add('is-dragging');
            addViewport.setPointerCapture(pointerId);
        });

        addViewport.addEventListener('pointermove', (event) => {
            if (pointerId !== event.pointerId) {
                return;
            }

            const distance = event.clientX - startX;
            if (Math.abs(distance) > tabsDragSelectThreshold) {
                moved = true;
            }

            event.preventDefault();
            addViewport.scrollLeft = clampAddScroll(startScrollLeft - distance);
        });

        function endDrag(event) {
            if (pointerId !== event.pointerId) {
                return;
            }

            addViewport.classList.remove('is-dragging');
            addViewport.releasePointerCapture(pointerId);

            const scrollMoved = Math.abs(addViewport.scrollLeft - startScrollLeft) > tabsDragSelectThreshold;
            if (!moved && !scrollMoved && pressedPill) {
                activateAddStatus(pressedPill);
            } else if (moved || scrollMoved) {
                suppressAddClickUntil = window.performance.now() + 250;
            }

            pointerId = null;
            pressedPill = null;
            window.setTimeout(() => {
                moved = false;
            }, 0);
        }

        addViewport.addEventListener('pointerup', endDrag);
        addViewport.addEventListener('pointercancel', endDrag);

        addTrack.addEventListener('click', (event) => {
            if (moved || window.performance.now() < suppressAddClickUntil) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        });
    }

    function bindTabsDragScroll() {
        if (!tabsViewport || !tabsTrack) {
            return;
        }

        let pointerId = null;
        let startX = 0;
        let startScrollLeft = 0;
        let moved = false;
        let pressedTab = null;

        tabsViewport.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || getTabsMaxScroll() <= 1) {
                return;
            }

            event.preventDefault();
            pointerId = event.pointerId;
            startX = event.clientX;
            startScrollLeft = tabsViewport.scrollLeft;
            moved = false;
            pressedTab = event.target.closest('.drawer-tab');

            if (tabsScrollAnimationId) {
                window.cancelAnimationFrame(tabsScrollAnimationId);
                tabsScrollAnimationId = null;
            }

            tabsViewport.classList.add('is-dragging');
            tabsViewport.setPointerCapture(pointerId);
        });

        tabsViewport.addEventListener('pointermove', (event) => {
            if (pointerId !== event.pointerId) {
                return;
            }

            const distance = event.clientX - startX;
            if (Math.abs(distance) > tabsDragSelectThreshold) {
                moved = true;
            }

            event.preventDefault();
            tabsViewport.scrollLeft = clampTabsScroll(startScrollLeft - distance);
        });

        function endDrag(event) {
            if (pointerId !== event.pointerId) {
                return;
            }

            tabsViewport.classList.remove('is-dragging');
            tabsViewport.releasePointerCapture(pointerId);

            const scrollMoved = Math.abs(tabsViewport.scrollLeft - startScrollLeft) > tabsDragSelectThreshold;
            if (!moved && !scrollMoved && pressedTab) {
                activateTab(pressedTab);
            } else if (moved || scrollMoved) {
                suppressTabsClickUntil = window.performance.now() + 250;
            }

            pointerId = null;
            pressedTab = null;
            window.setTimeout(() => {
                moved = false;
            }, 0);
        }

        tabsViewport.addEventListener('pointerup', endDrag);
        tabsViewport.addEventListener('pointercancel', endDrag);

        tabsTrack.addEventListener('click', (event) => {
            if (moved || window.performance.now() < suppressTabsClickUntil) {
                event.preventDefault();
                event.stopImmediatePropagation();
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

        scrollSelectedIntoView(item);
    }

    function activateAddStatus(item) {
        if (!item) {
            return;
        }

        const items = Array.from(addTrack.querySelectorAll('.add-status-pill'));
        const status = addStatuses[Number(item.dataset.addStatusIndex)];
        if (!status) {
            return;
        }

        items.forEach((statusItem) => {
            const isActive = statusItem === item;
            const statusItemData = addStatuses[Number(statusItem.dataset.addStatusIndex)];
            const dot = statusItem.querySelector('.add-status-dot');
            statusItem.classList.toggle('active', isActive);
            statusItem.setAttribute('aria-pressed', isActive ? 'true' : 'false');

            if (isActive) {
                statusItem.style.setProperty('background', statusItemData.color, 'important');
                statusItem.style.setProperty('background-color', statusItemData.color, 'important');
                statusItem.style.setProperty('box-shadow', `inset 0 0 0 999px ${statusItemData.color}`, 'important');
                statusItem.style.setProperty('color', '#023346', 'important');
                statusItem.style.setProperty('font-weight', '700', 'important');
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
            dot.style.removeProperty('background');
            dot.style.removeProperty('background-color');
            dot.style.borderColor = '';
        });

        scrollSelectedAddIntoView(item);
    }

    function activateTab(item) {
        if (!item) {
            return;
        }

        tabsTrack.querySelectorAll('.drawer-tab').forEach((tab) => {
            tab.classList.toggle('is-active', tab === item);
        });

        scrollSelectedTabIntoView(item);
    }

    function expandTruncatedItem(item) {
        if (!item?.classList.contains('is-truncated')) {
            return;
        }

        const name = item.querySelector('.status-name');
        item.style.setProperty('width', item.style.getPropertyValue('--status-hover-width'), 'important');
        name.style.setProperty('max-width', 'none', 'important');
    }

    function collapseTruncatedItem(item) {
        if (!item?.classList.contains('is-truncated')) {
            return;
        }

        const status = statuses[Number(item.dataset.statusIndex)];
        const name = item.querySelector('.status-name');
        item.style.setProperty('width', `${status.width}px`);
        name.style.setProperty('max-width', `${status.truncateWidth}px`);
    }

    function setAddedDrawerScrollMode(hasScroll) {
        addedDrawerHasScroll = hasScroll;
        carousel.classList.toggle('is-no-scroll', !hasScroll);
        tabsCarousel?.classList.toggle('is-no-scroll', !hasScroll);
        viewport.scrollLeft = 0;
        if (tabsViewport) {
            tabsViewport.scrollLeft = 0;
        }

        if (scrollAnimationId) {
            window.cancelAnimationFrame(scrollAnimationId);
            scrollAnimationId = null;
        }
        if (tabsScrollAnimationId) {
            window.cancelAnimationFrame(tabsScrollAnimationId);
            tabsScrollAnimationId = null;
        }

        updateArrowState();
        updateTabsArrowState();
    }

    function setAddDrawerScrollMode(hasScroll) {
        if (!addCarousel) {
            return;
        }

        addDrawerHasScroll = hasScroll;
        addCarousel.classList.toggle('is-no-scroll', !hasScroll);
        addViewport.scrollLeft = 0;

        if (addScrollAnimationId) {
            window.cancelAnimationFrame(addScrollAnimationId);
            addScrollAnimationId = null;
        }

        updateAddArrowState();
    }

    function updateSwitcherButtons() {
        const currentHasScroll = activeDrawer === 'add' ? addDrawerHasScroll : addedDrawerHasScroll;

        addDrawerButton?.classList.toggle('btn-primary', activeDrawer === 'add');
        addDrawerButton?.classList.toggle('btn-default', activeDrawer !== 'add');
        addedDrawerButton?.classList.toggle('btn-primary', activeDrawer === 'added');
        addedDrawerButton?.classList.toggle('btn-default', activeDrawer !== 'added');
        scrollModeButton?.classList.toggle('btn-primary', currentHasScroll);
        scrollModeButton?.classList.toggle('btn-default', !currentHasScroll);
        noScrollModeButton?.classList.toggle('btn-primary', !currentHasScroll);
        noScrollModeButton?.classList.toggle('btn-default', currentHasScroll);
    }

    function showDrawer(drawerName) {
        activeDrawer = drawerName;
        addDrawer?.classList.toggle('is-hidden', drawerName !== 'add');
        addedDrawer?.classList.toggle('is-hidden', drawerName !== 'added');

        if (drawerName === 'add') {
            updateAddArrowState();
        } else {
            updateArrowState();
            updateTabsArrowState();
        }

        updateSwitcherButtons();
    }

    function setActiveDrawerScrollMode(hasScroll) {
        if (activeDrawer === 'add') {
            setAddDrawerScrollMode(hasScroll);
        } else {
            setAddedDrawerScrollMode(hasScroll);
        }

        updateSwitcherButtons();
    }

    renderStatuses();
    renderAddStatuses();
    tabsTrack?.querySelectorAll('.drawer-tab').forEach((tab) => {
        tab.draggable = false;
    });
    activateAddStatus(addTrack?.querySelector('.add-status-pill.active'));
    updateTruncatedHoverWidths();
    window.requestAnimationFrame(updateTruncatedHoverWidths);
    document.fonts?.ready?.then(updateTruncatedHoverWidths);
    activateStatus(track.querySelector('.status-pill.active'));
    bindAddDragScroll();
    bindDragScroll();
    bindTabsDragScroll();

    carousel.addEventListener('click', (event) => {
        const button = event.target.closest('[data-scroll-prev], [data-scroll-next]');
        if (!button || button.disabled) {
            return;
        }

        scrollBySection(button === prevButton ? -1 : 1);
    });

    addCarousel?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-add-scroll-prev], [data-add-scroll-next]');
        if (!button || button.disabled) {
            return;
        }

        scrollAddBySection(button === addPrevButton ? -1 : 1);
    });

    tabsCarousel?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-tabs-prev], [data-tabs-next]');
        if (!button || button.disabled) {
            return;
        }

        scrollTabsBySection(button === tabsPrevButton ? -1 : 1);
    });

    track.addEventListener('click', (event) => {
        if (window.performance.now() < suppressClickUntil) {
            event.preventDefault();
            return;
        }

        const item = event.target.closest('.status-pill');
        if (!item) {
            return;
        }

        activateStatus(item);
    });

    addTrack?.addEventListener('click', (event) => {
        if (window.performance.now() < suppressAddClickUntil) {
            event.preventDefault();
            return;
        }

        const item = event.target.closest('.add-status-pill');
        if (!item) {
            return;
        }

        activateAddStatus(item);
    });

    tabsTrack?.addEventListener('click', (event) => {
        event.preventDefault();

        if (window.performance.now() < suppressTabsClickUntil) {
            return;
        }

        const item = event.target.closest('.drawer-tab');
        if (!item) {
            return;
        }

        activateTab(item);
    });

    track.addEventListener('pointerover', (event) => {
        expandTruncatedItem(event.target.closest('.status-pill'));
    });

    track.addEventListener('pointerout', (event) => {
        const item = event.target.closest('.status-pill');
        if (!item || item.contains(event.relatedTarget)) {
            return;
        }

        collapseTruncatedItem(item);
    });

    addDrawerButton?.addEventListener('click', () => showDrawer('add'));
    addedDrawerButton?.addEventListener('click', () => showDrawer('added'));
    scrollModeButton?.addEventListener('click', () => setActiveDrawerScrollMode(true));
    noScrollModeButton?.addEventListener('click', () => setActiveDrawerScrollMode(false));

    addViewport?.addEventListener('wheel', handleAddWheel, { passive: false });
    addViewport?.addEventListener('scroll', updateAddArrowState, { passive: true });
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('scroll', updateArrowState, { passive: true });
    tabsViewport?.addEventListener('wheel', handleTabsWheel, { passive: false });
    tabsViewport?.addEventListener('scroll', updateTabsArrowState, { passive: true });
    window.addEventListener('resize', updateAddArrowState);
    window.addEventListener('resize', updateArrowState);
    window.addEventListener('resize', updateTabsArrowState);

    updateAddArrowState();
    updateArrowState();
    updateTabsArrowState();
    updateSwitcherButtons();

    window.horizontalScrollPrototype = {
        viewport,
        scrollNext: () => scrollBySection(1),
        scrollPrev: () => scrollBySection(-1),
        statuses
    };
}());
