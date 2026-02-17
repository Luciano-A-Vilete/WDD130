document.documentElement.classList.add("js-enabled");

function setupMobileNav() {
    const navToggle = document.querySelector(".nav-toggle");
    const siteNav = document.getElementById("primary-navigation");

    if (!navToggle || !siteNav) {
        return;
    }

    const closeMenu = () => {
        siteNav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
        const isOpen = siteNav.classList.toggle("is-open");
        navToggle.classList.toggle("is-open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 680) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}

function setupFaqAccordion() {
    const questions = Array.from(document.querySelectorAll(".faq-question"));

    if (questions.length === 0) {
        return;
    }

    questions.forEach((question, index) => {
        const answer = question.nextElementSibling;
        if (!answer) {
            return;
        }

        if (!answer.id) {
            answer.id = `faq-answer-${index + 1}`;
        }

        question.setAttribute("aria-controls", answer.id);
        question.setAttribute("aria-expanded", "false");
        answer.hidden = false;
        answer.classList.remove("is-open");
        answer.setAttribute("aria-hidden", "true");

        question.addEventListener("click", () => {
            const isExpanded = question.getAttribute("aria-expanded") === "true";

            questions.forEach((otherQuestion) => {
                const otherAnswer = otherQuestion.nextElementSibling;
                if (!otherAnswer || otherQuestion === question) {
                    return;
                }
                otherQuestion.setAttribute("aria-expanded", "false");
                otherAnswer.classList.remove("is-open");
                otherAnswer.setAttribute("aria-hidden", "true");
            });

            question.setAttribute("aria-expanded", String(!isExpanded));
            answer.classList.toggle("is-open", !isExpanded);
            answer.setAttribute("aria-hidden", String(isExpanded));
        });
    });
}

function setupBackToTop() {
    const backToTop = document.querySelector(".back-to-top");

    if (!backToTop) {
        return;
    }

    const updateVisibility = () => {
        if (window.scrollY > 420) {
            backToTop.classList.add("visible");
        } else {
            backToTop.classList.remove("visible");
        }
    };

    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function setupSafetyAlert() {
    const alertBar = document.querySelector("[data-safety-alert]");
    if (!alertBar) {
        return;
    }

    const alertMessage = alertBar.querySelector("[data-alert-message]");
    const alertDate = alertBar.querySelector("[data-alert-date]");
    const dismissButton = alertBar.querySelector("[data-alert-dismiss]");

    const messages = [
        {
            tone: "alert-warning",
            text: "Helmets and life jackets are mandatory for every route today."
        },
        {
            tone: "alert-caution",
            text: "Morning water can run colder than expected. Bring quick-dry layers."
        },
        {
            tone: "alert-warning",
            text: "Route conditions can change quickly. Follow guide paddle commands at all times."
        }
    ];

    const now = new Date();
    const dayIndex = now.getDay() % messages.length;
    const selectedMessage = messages[dayIndex];
    const dateLabel = now.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
    });

    alertBar.classList.add(selectedMessage.tone);
    if (alertMessage) {
        alertMessage.textContent = selectedMessage.text;
    }
    if (alertDate) {
        alertDate.textContent = `(Updated ${dateLabel})`;
    }

    const storageKey = `wwr-alert-dismissed-${now.toISOString().slice(0, 10)}`;
    try {
        if (window.localStorage.getItem(storageKey) === "true") {
            alertBar.classList.add("is-hidden");
        }
    } catch {
        // Ignore localStorage failures in restricted browsing modes.
    }

    if (!dismissButton) {
        return;
    }

    dismissButton.addEventListener("click", () => {
        alertBar.classList.add("is-hidden");
        try {
            window.localStorage.setItem(storageKey, "true");
        } catch {
            // Ignore localStorage failures in restricted browsing modes.
        }
    });
}

function setupTestimonialCarousel() {
    const carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
    const prevButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");

    if (slides.length === 0) {
        return;
    }

    let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (activeIndex < 0) {
        activeIndex = 0;
    }

    const showSlide = (nextIndex) => {
        activeIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            const isActive = index === activeIndex;
            slide.classList.toggle("is-active", isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
        });

        dots.forEach((dot, index) => {
            const isActive = index === activeIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-selected", String(isActive));
        });
    };

    const nextSlide = () => showSlide(activeIndex + 1);
    const prevSlide = () => showSlide(activeIndex - 1);

    let timerId = window.setInterval(nextSlide, 6000);
    const restartTimer = () => {
        window.clearInterval(timerId);
        timerId = window.setInterval(nextSlide, 6000);
    };
    const stopTimer = () => {
        window.clearInterval(timerId);
    };

    if (prevButton) {
        prevButton.addEventListener("click", () => {
            prevSlide();
            restartTimer();
        });
    }
    if (nextButton) {
        nextButton.addEventListener("click", () => {
            nextSlide();
            restartTimer();
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const targetIndex = Number(dot.dataset.slideIndex);
            if (Number.isFinite(targetIndex)) {
                showSlide(targetIndex);
                restartTimer();
            }
        });
    });

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", restartTimer);
    carousel.addEventListener("focusin", stopTimer);
    carousel.addEventListener("focusout", () => {
        if (!carousel.contains(document.activeElement)) {
            restartTimer();
        }
    });

    carousel.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
            nextSlide();
            restartTimer();
        }
        if (event.key === "ArrowLeft") {
            prevSlide();
            restartTimer();
        }
    });

    showSlide(activeIndex);
}

function getWeatherLabel(code) {
    if (code === 0) {
        return "Clear";
    }
    if ([1, 2, 3].includes(code)) {
        return "Partly cloudy";
    }
    if ([45, 48].includes(code)) {
        return "Fog";
    }
    if ([51, 53, 55, 56, 57].includes(code)) {
        return "Drizzle";
    }
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return "Rain";
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return "Snow";
    }
    if ([95, 96, 99].includes(code)) {
        return "Thunderstorm";
    }
    return "Variable";
}

function setupWeatherWidget() {
    const widgets = Array.from(document.querySelectorAll("[data-weather-widget]"));
    if (widgets.length === 0) {
        return;
    }

    widgets.forEach(async (widget) => {
        const latitude = Number(widget.dataset.lat);
        const longitude = Number(widget.dataset.lon);
        const location = widget.dataset.location || "Launch area";

        const status = widget.querySelector("[data-weather-status]");
        const locationField = widget.querySelector("[data-weather-location]");
        const tempField = widget.querySelector("[data-weather-temp]");
        const windField = widget.querySelector("[data-weather-wind]");
        const codeField = widget.querySelector("[data-weather-code]");

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !status ||
            !locationField || !tempField || !windField || !codeField) {
            return;
        }

        locationField.textContent = location;
        status.textContent = "Loading current conditions...";

        const endpoint = new URL("https://api.open-meteo.com/v1/forecast");
        endpoint.searchParams.set("latitude", String(latitude));
        endpoint.searchParams.set("longitude", String(longitude));
        endpoint.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
        endpoint.searchParams.set("temperature_unit", "fahrenheit");
        endpoint.searchParams.set("wind_speed_unit", "mph");
        endpoint.searchParams.set("timezone", "auto");

        try {
            const response = await fetch(endpoint.toString());
            if (!response.ok) {
                throw new Error("Weather request failed");
            }

            const payload = await response.json();
            const current = payload.current || {};

            const temp = Number(current.temperature_2m);
            const wind = Number(current.wind_speed_10m);
            const code = Number(current.weather_code);
            const time = current.time ? new Date(current.time) : new Date();

            tempField.textContent = Number.isFinite(temp) ? `${temp.toFixed(1)} F` : "Unavailable";
            windField.textContent = Number.isFinite(wind) ? `${wind.toFixed(1)} mph` : "Unavailable";
            codeField.textContent = Number.isFinite(code) ? getWeatherLabel(code) : "Unavailable";
            status.textContent = `Updated at ${time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`;
        } catch {
            status.textContent = "Live weather is unavailable right now. Please check local forecast before launch.";
            tempField.textContent = "Unavailable";
            windField.textContent = "Unavailable";
            codeField.textContent = "Unavailable";
        }
    });
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getFieldError(field) {
    const value = field.value.trim();
    const fieldLabel = {
        "news-name": "name",
        "news-email": "email",
        user_name: "full name",
        user_email: "email",
        user_message: "message"
    };
    const name = fieldLabel[field.id] || "this field";

    if (field.required && value.length === 0) {
        if (field.id === "news-name" || field.id === "user_name") {
            return "Please tell us your name.";
        }
        if (field.id === "news-email" || field.id === "user_email") {
            return "Please share your email so we can contact you.";
        }
        if (field.id === "user_message") {
            return "Please add a short message so we can help.";
        }
        return `Please complete ${name}.`;
    }

    if (field.type === "email" && value.length > 0 && !emailPattern.test(value)) {
        return "That email looks incomplete. Use a format like name@example.com.";
    }

    if ((field.id === "user_name" || field.id === "news-name") && value.length > 0 && value.length < 2) {
        return "Name looks too short. Please enter at least 2 characters.";
    }

    if (field.id === "user_message" && value.length > 0 && value.length < 15) {
        return "Please add a bit more detail (at least 15 characters).";
    }

    return "";
}

function showFieldError(field, message) {
    const fieldKey = field.id || field.name;
    const errorId = `${fieldKey}-error`;
    let error = document.getElementById(errorId);
    if (!error) {
        error = document.createElement("p");
        error.className = "form-error";
        error.id = errorId;
        error.setAttribute("aria-live", "polite");
        field.insertAdjacentElement("afterend", error);
    }

    error.textContent = message;
    error.classList.toggle("is-visible", Boolean(message));

    if (message) {
        field.classList.add("field-invalid");
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", errorId);
    } else {
        field.classList.remove("field-invalid");
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
    }
}

function validateField(field) {
    const message = getFieldError(field);
    showFieldError(field, message);
    return message.length === 0;
}

function setupFormValidation() {
    const forms = document.querySelectorAll(".needs-validation");

    forms.forEach((form) => {
        const fields = Array.from(
            form.querySelectorAll("input:not([type='radio']):not([type='checkbox']), textarea")
        );

        fields.forEach((field) => {
            field.addEventListener("blur", () => validateField(field));
            field.addEventListener("input", () => {
                if (field.classList.contains("field-invalid")) {
                    validateField(field);
                }
            });
        });

        form.addEventListener("submit", (event) => {
            let isFormValid = true;
            fields.forEach((field) => {
                if (!validateField(field)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                event.preventDefault();
                const firstInvalid = form.querySelector(".field-invalid");
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            }
        });

        form.addEventListener("reset", () => {
            fields.forEach((field) => {
                showFieldError(field, "");
            });
        });
    });
}

function setupTripFilters() {
    const filterButtons = Array.from(document.querySelectorAll(".filter-chip[data-filter]"));
    const tripCards = Array.from(document.querySelectorAll("[data-trip-card]"));
    const resultsCount = document.getElementById("trip-results-count");

    if (filterButtons.length === 0 || tripCards.length === 0) {
        return;
    }

    const totalTrips = tripCards.length;

    const updateResultsText = (visibleTrips) => {
        if (!resultsCount) {
            return;
        }
        const label = visibleTrips === 1 ? "trip" : "trips";
        resultsCount.textContent = `Showing ${visibleTrips} of ${totalTrips} ${label}`;
    };

    const applyFilter = (filterValue) => {
        let visibleCount = 0;
        tripCards.forEach((card) => {
            const difficulty = (card.dataset.difficulty || "").toLowerCase();
            const shouldShow = filterValue === "all" || difficulty === filterValue;
            card.classList.toggle("is-hidden", !shouldShow);
            if (shouldShow) {
                visibleCount += 1;
            }
        });

        filterButtons.forEach((button) => {
            const isActive = button.dataset.filter === filterValue;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        updateResultsText(visibleCount);
    };

    filterButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
        button.addEventListener("click", () => {
            applyFilter(button.dataset.filter || "all");
        });
    });

    const activeFilterButton = filterButtons.find((button) => button.classList.contains("is-active"));
    const initialFilter = activeFilterButton ? activeFilterButton.dataset.filter || "all" : "all";
    applyFilter(initialFilter);
}

function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDateForSummary(rawDate) {
    if (!rawDate) {
        return "Not selected";
    }
    const date = new Date(`${rawDate}T12:00:00`);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function formatMoney(amount) {
    return `$${amount.toFixed(2)}`;
}

function parseDateKey(rawDate) {
    if (!rawDate) {
        return null;
    }

    const [year, month, day] = rawDate.split("-").map(Number);
    if (!year || !month || !day) {
        return null;
    }

    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month - 1 ||
        parsed.getDate() !== day
    ) {
        return null;
    }

    return parsed;
}

function getDateAvailability(date, todayStart) {
    if (date < todayStart) {
        return "past";
    }

    const weekday = date.getDay();
    const dayOfMonth = date.getDate();

    if (weekday === 0 || dayOfMonth % 13 === 0) {
        return "full";
    }

    if (weekday === 6 || dayOfMonth % 6 === 0 || dayOfMonth % 11 === 0) {
        return "limited";
    }

    return "open";
}

function setupAvailabilityCalendar() {
    const calendar = document.querySelector("[data-availability-calendar]");
    if (!calendar) {
        return;
    }

    const label = calendar.querySelector("[data-calendar-label]");
    const grid = calendar.querySelector("[data-calendar-grid]");
    const prevButton = calendar.querySelector("[data-calendar-prev]");
    const nextButton = calendar.querySelector("[data-calendar-next]");
    const selectedField = calendar.querySelector("[data-calendar-selected]");
    const dateInput = document.getElementById("calc-date");

    if (!label || !grid || !prevButton || !nextButton || !selectedField) {
        return;
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const minMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const maxMonth = new Date(todayStart.getFullYear(), todayStart.getMonth() + 2, 1);

    let viewMonth = new Date(minMonth);
    let selectedDateKey = "";

    const getMonthOrder = (date) => date.getFullYear() * 12 + date.getMonth();
    const minOrder = getMonthOrder(minMonth);
    const maxOrder = getMonthOrder(maxMonth);

    const setSelectedField = () => {
        selectedField.textContent = selectedDateKey ? formatDateForSummary(selectedDateKey) : "Not selected";
    };

    const renderCalendar = () => {
        label.textContent = viewMonth.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric"
        });

        prevButton.disabled = getMonthOrder(viewMonth) <= minOrder;
        nextButton.disabled = getMonthOrder(viewMonth) >= maxOrder;

        grid.innerHTML = "";

        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const firstOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstOfMonth.getDay(); i += 1) {
            const emptyCell = document.createElement("span");
            emptyCell.className = "calendar-empty";
            emptyCell.setAttribute("aria-hidden", "true");
            grid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            const dayDate = new Date(year, month, day);
            const dateKey = toDateKey(dayDate);
            const status = getDateAvailability(dayDate, todayStart);
            const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
            const isUnavailable = status === "full" || status === "past";

            const dayButton = document.createElement("button");
            dayButton.type = "button";
            dayButton.className = `calendar-day status-${status}`;
            dayButton.setAttribute("aria-label", `${formatDateForSummary(dateKey)} - ${statusLabel}`);
            dayButton.innerHTML =
                `<span class="calendar-day-number">${day}</span><span class="calendar-day-status">${statusLabel}</span>`;

            if (dateKey === toDateKey(todayStart)) {
                dayButton.classList.add("is-today");
            }
            if (dateKey === selectedDateKey) {
                dayButton.classList.add("is-selected");
            }

            if (isUnavailable) {
                dayButton.disabled = true;
            } else {
                dayButton.addEventListener("click", () => {
                    selectedDateKey = dateKey;
                    setSelectedField();
                    renderCalendar();

                    if (dateInput) {
                        dateInput.value = dateKey;
                        dateInput.dispatchEvent(new Event("input", { bubbles: true }));
                        dateInput.dispatchEvent(new Event("change", { bubbles: true }));
                    }
                });
            }

            grid.appendChild(dayButton);
        }

        const totalCells = firstOfMonth.getDay() + daysInMonth;
        const trailingCells = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < trailingCells; i += 1) {
            const emptyCell = document.createElement("span");
            emptyCell.className = "calendar-empty";
            emptyCell.setAttribute("aria-hidden", "true");
            grid.appendChild(emptyCell);
        }
    };

    const syncFromDateInput = () => {
        if (!dateInput || !dateInput.value) {
            selectedDateKey = "";
            setSelectedField();
            renderCalendar();
            return;
        }

        const parsedDate = parseDateKey(dateInput.value);
        if (!parsedDate) {
            return;
        }

        const parsedMonthOrder = getMonthOrder(parsedDate);
        if (parsedMonthOrder < minOrder || parsedMonthOrder > maxOrder) {
            dateInput.value = "";
            selectedDateKey = "";
            viewMonth = new Date(minMonth);
            setSelectedField();
            renderCalendar();
            dateInput.dispatchEvent(new Event("input", { bubbles: true }));
            return;
        }

        const availability = getDateAvailability(parsedDate, todayStart);
        if (availability === "full" || availability === "past") {
            dateInput.value = "";
            selectedDateKey = "";
            setSelectedField();
            renderCalendar();
            dateInput.dispatchEvent(new Event("input", { bubbles: true }));
            return;
        }

        selectedDateKey = toDateKey(parsedDate);
        viewMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
        setSelectedField();
        renderCalendar();
    };

    prevButton.addEventListener("click", () => {
        const candidate = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
        if (getMonthOrder(candidate) >= minOrder) {
            viewMonth = candidate;
            renderCalendar();
        }
    });

    nextButton.addEventListener("click", () => {
        const candidate = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
        if (getMonthOrder(candidate) <= maxOrder) {
            viewMonth = candidate;
            renderCalendar();
        }
    });

    if (dateInput) {
        dateInput.min = toDateKey(todayStart);
        dateInput.max = toDateKey(new Date(maxMonth.getFullYear(), maxMonth.getMonth() + 1, 0));
        dateInput.addEventListener("change", syncFromDateInput);
        dateInput.addEventListener("input", syncFromDateInput);
    }

    syncFromDateInput();
}

function setupTripCalculator() {
    const calculator = document.getElementById("trip-calculator");
    if (!calculator) {
        return;
    }

    const tripSelect = document.getElementById("calc-trip");
    const guestInput = document.getElementById("calc-guests");
    const dateInput = document.getElementById("calc-date");
    const addonInputs = Array.from(calculator.querySelectorAll(".addon-group input[type='checkbox']"));

    const summaryTrip = document.getElementById("summary-trip");
    const summaryGuests = document.getElementById("summary-guests");
    const summaryDate = document.getElementById("summary-date");
    const summaryBasePrice = document.getElementById("summary-base-price");
    const summaryAddons = document.getElementById("summary-addons");
    const summaryTotal = document.getElementById("summary-total");

    if (!tripSelect || !guestInput || !dateInput || !summaryTrip || !summaryGuests || !summaryDate ||
        !summaryBasePrice || !summaryAddons || !summaryTotal) {
        return;
    }

    const getCheckedAddons = () => addonInputs.filter((input) => input.checked);

    const updateSummary = () => {
        const selectedOption = tripSelect.options[tripSelect.selectedIndex];
        const tripName = selectedOption ? selectedOption.value : "Family Fun Run";
        const basePrice = Number(selectedOption ? selectedOption.dataset.price : 45);

        const parsedGuests = Number(guestInput.value);
        const guests = Number.isFinite(parsedGuests) ? Math.min(Math.max(parsedGuests, 1), 40) : 1;
        guestInput.value = String(guests);

        const checkedAddons = getCheckedAddons();
        const addonLabels = checkedAddons.map((addon) => {
            const label = addon.closest("label");
            return label ? label.textContent.trim() : "Add-on";
        });

        const perGuestAddonTotal = checkedAddons
            .filter((addon) => addon.id !== "addon-shuttle")
            .reduce((sum, addon) => sum + Number(addon.value), 0);
        const groupAddonTotal = checkedAddons
            .filter((addon) => addon.id === "addon-shuttle")
            .reduce((sum, addon) => sum + Number(addon.value), 0);

        const total = guests * (basePrice + perGuestAddonTotal) + groupAddonTotal;

        summaryTrip.textContent = tripName;
        summaryGuests.textContent = String(guests);
        summaryDate.textContent = formatDateForSummary(dateInput.value);
        summaryBasePrice.textContent = formatMoney(basePrice);
        summaryAddons.textContent = addonLabels.length > 0 ? addonLabels.join(", ") : "None";
        summaryTotal.textContent = formatMoney(total);
    };

    [tripSelect, guestInput, dateInput, ...addonInputs].forEach((element) => {
        element.addEventListener("input", updateSummary);
        element.addEventListener("change", updateSummary);
    });

    calculator.addEventListener("submit", (event) => {
        event.preventDefault();
    });

    updateSummary();
}

setupMobileNav();
setupSafetyAlert();
setupTestimonialCarousel();
setupFaqAccordion();
setupBackToTop();
setupFormValidation();
setupTripFilters();
setupTripCalculator();
setupAvailabilityCalendar();
setupWeatherWidget();
