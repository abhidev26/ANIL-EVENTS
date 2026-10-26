
"use strict";

/* =========================================================
   ANIL EVENTS — PREMIUM WEBSITE
   Main JavaScript
   =========================================================

   Files expected in the same project folder:
   index.html
   style.css
   script.js
   manifest.json
   sw.js
   icon.svg

   IMPORTANT:
   - Admin dashboard is a local browser demo, NOT secure.
   - Date checker cannot confirm real business availability.
   - Booking enquiries open WhatsApp; the customer must press Send.
   - Update DEMO_ADMIN_CODE before testing the demo panel.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initHeader();
  initMobileNavigation();
  initLanguageToggle();
  initGalleryFilters();
  initGalleryLightbox();
  initCardEffects();
  initCostEstimator();
  initDateAvailability();
  initBookingForm();
  initPackageButtons();
  initAdminDashboard();
  initInstallableWebsite();
  initServiceWorker();
  initCurrentYear();
  initDateMinimums();
  initSmoothNavigation();
});


/* =========================================================
   CONFIGURATION
   ========================================================= */

const ANIL_EVENTS_CONFIG = {
  // WhatsApp number in international format, without + or spaces.
  whatsappNumber: "919740767446",

  // Demo-only access code for the local admin panel.
  // Change this to a code you choose before using the demo.
  // This is NOT secure authentication.
  demoAdminCode: "ANIL2026",

  // localStorage keys used by this browser demo.
  enquiriesKey: "anilEventsDemoEnquiries",
  dateRequestsKey: "anilEventsDateRequests",
  languageKey: "anilEventsLanguage",

  // Cost estimator placeholders. Change these to match
  // your actual packages and services before publishing.
  packages: {
    essential: 15000,
    premium: 35000,
    signature: 75000
  },

  decoration: {
    basic: 0,
    standard: 5000,
    luxury: 15000
  },

  extraServices: {
    none: 0,
    photo: 12000,
    sound: 10000,
    both: 22000
  },

  // Illustrative per-guest estimate, not a quotation.
  perGuestEstimate: {
    wedding: 150,
    engagement: 100,
    birthday: 60,
    traditional: 80,
    corporate: 120,
    other: 80
  }
};


/* =========================================================
   SMALL HELPERS
   ========================================================= */

function getElement(selector, parent = document) {
  return parent.querySelector(selector);
}

function getElements(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

function setText(selector, value) {
  const element = getElement(selector);

  if (element) {
    element.textContent = String(value);
  }
}

function showElement(element) {
  if (!element) return;

  element.classList.remove("hidden");
  element.setAttribute("aria-hidden", "false");
}

function hideElement(element) {
  if (!element) return;

  element.classList.add("hidden");
  element.setAttribute("aria-hidden", "true");
}

function formatINR(amount) {
  const safeAmount = Math.max(0, Math.round(Number(amount) || 0));

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(safeAmount);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return replacements[character];
  });
}

function readLocalArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");

    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn(`Could not read local data for "${key}".`, error);
    return [];
  }
}

function writeLocalArray(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error("Could not save browser demo data.", error);
    return false;
  }
}

function setMessage(element, message, type = "info") {
  if (!element) return;

  element.textContent = message;
  element.dataset.type = type;
  element.classList.remove("hidden");
}

function normalisePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function isValidPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");

  return digits.length >= 10 && digits.length <= 15;
}

function openWhatsApp(message) {
  const number = ANIL_EVENTS_CONFIG.whatsappNumber;
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  // Open a user-initiated WhatsApp action in a separate tab.
  const openedWindow = window.open(url, "_blank", "noopener,noreferrer");

  // Some browsers block new windows. Provide a normal-link fallback.
  if (!openedWindow) {
    window.location.href = url;
  }
}

function getSelectedText(selectElement) {
  if (!selectElement) return "";

  const option = selectElement.options[selectElement.selectedIndex];

  return option ? option.textContent.trim() : "";
}


/* =========================================================
   LOADING SCREEN
   ========================================================= */

function initLoader() {
  const loader = getElement("#loader");

  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add("loader-hidden");

    // Keep the loader from blocking clicks after the animation.
    window.setTimeout(() => {
      if (loader.isConnected) {
        loader.style.display = "none";
      }
    }, 700);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });

    // Safety fallback if an external image takes too long.
    window.setTimeout(hideLoader, 3500);
  }
}


/* =========================================================
   HEADER SCROLL EFFECT
   ========================================================= */

function initHeader() {
  const header = getElement("#site-header");

  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("scrolled", window.scrollY > 30);
  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });
}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initMobileNavigation() {
  const menuButton = getElement("#menu-toggle");
  const nav = getElement("#nav-links");

  if (!menuButton || !nav) return;

  function closeMenu() {
    nav.classList.remove("active");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    menuButton.textContent = "☰";
  }

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );

    menuButton.textContent = isOpen ? "×" : "☰";
  });

  getElements("#nav-links a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      nav.classList.contains("active") &&
      !nav.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  });
}


/* =========================================================
   ENGLISH / KANNADA LANGUAGE TOGGLE
   ========================================================= */

function initLanguageToggle() {
  const languageButtons = getElements("[data-lang]");

  if (!languageButtons.length) return;

  let currentLanguage = "en";

  try {
    const savedLanguage = localStorage.getItem(
      ANIL_EVENTS_CONFIG.languageKey
    );

    if (savedLanguage === "en" || savedLanguage === "kn") {
      currentLanguage = savedLanguage;
    }
  } catch (error) {
    // Continue with English if browser storage is unavailable.
  }

  function applyLanguage(language) {
    currentLanguage = language === "kn" ? "kn" : "en";

    document.documentElement.lang = currentLanguage;

    getElements("[data-en][data-kn]").forEach((element) => {
      const translatedText = element.getAttribute(
        currentLanguage === "kn" ? "data-kn" : "data-en"
      );

      if (translatedText !== null) {
        element.textContent = translatedText;
      }
    });

    languageButtons.forEach((button) => {
      const isActive = button.dataset.lang === currentLanguage;

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    try {
      localStorage.setItem(
        ANIL_EVENTS_CONFIG.languageKey,
        currentLanguage
      );
    } catch (error) {
      // The toggle still works for the current page.
    }
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.lang);
    });
  });

  applyLanguage(currentLanguage);
}


/* =========================================================
   GALLERY FILTERS
   ========================================================= */

function initGalleryFilters() {
  const filterButtons = getElements(".filter-btn");
  const galleryItems = getElements(".gallery-item");

  if (!filterButtons.length || !galleryItems.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";

      filterButtons.forEach((item) => {
        const active = item === button;

        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      galleryItems.forEach((item) => {
        const category = item.dataset.category || "";
        const matches = filter === "all" || category === filter;

        item.classList.toggle("hidden", !matches);
        item.setAttribute("aria-hidden", String(!matches));
      });
    });
  });
}


/* =========================================================
   GALLERY LIGHTBOX
   ========================================================= */

function initGalleryLightbox() {
  const lightbox = getElement("#lightbox");
  const lightboxImage = getElement("#lightbox-image");
  const closeButton = getElement("#lightbox-close");
  const galleryItems = getElements(".gallery-item");

  if (!lightbox || !lightboxImage || !galleryItems.length) return;

  let lastFocusedElement = null;

  function openLightbox(item) {
    const image = item.dataset.image ||
      getElement("img", item)?.src;

    if (!image) return;

    lastFocusedElement = document.activeElement;

    lightboxImage.src = image;

    const thumbnail = getElement("img", item);

    lightboxImage.alt = thumbnail
      ? thumbnail.alt
      : "Event inspiration photograph";

    lightbox.classList.remove("hidden");
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");

    document.body.classList.add("lightbox-open");

    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightbox.classList.add("hidden");
    lightbox.setAttribute("aria-hidden", "true");

    lightboxImage.removeAttribute("src");
    document.body.classList.remove("lightbox-open");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => openLightbox(item));
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeLightbox);
  }

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.classList.contains("hidden")) {
      closeLightbox();
    }
  });
}


/* =========================================================
   3D TILT EFFECTS
   ========================================================= */

function initCardEffects() {
  const cards = getElements(".tilt-card, .gallery-item, .package-card");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const supportsFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  if (reducedMotion || !supportsFinePointer) return;

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 5;
      const rotateX = (0.5 - y) * 5;

      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}


/* =========================================================
   COST ESTIMATOR
   ========================================================= */

function initCostEstimator() {
  const eventType = getElement("#estimator-event");
  const packageSelect = getElement("#estimator-package");
  const guestSlider = getElement("#estimator-guests");
  const guestLabel = getElement("#guest-count-label");
  const decorationSelect = getElement("#estimator-decor");
  const extraSelect = getElement("#estimator-extra");

  const totalOutput = getElement("#estimate-total");
  const packageOutput = getElement("#estimate-package-cost");
  const decorationOutput = getElement("#estimate-decor-cost");
  const extraOutput = getElement("#estimate-extra-cost");
  const bookingLink = getElement("#estimate-book");

  if (
    !eventType ||
    !packageSelect ||
    !guestSlider ||
    !decorationSelect ||
    !extraSelect ||
    !totalOutput
  ) {
    return;
  }

  let currentEstimate = 0;

  function calculateEstimate() {
    const selectedEvent = eventType.value;
    const selectedPackage = packageSelect.value;
    const guestCount = Math.max(0, Number(guestSlider.value) || 0);
    const decoration = decorationSelect.value;
    const extras = extraSelect.value;

    const packagePrice =
      ANIL_EVENTS_CONFIG.packages[selectedPackage] ??
      ANIL_EVENTS_CONFIG.packages.essential;

    const decorationPrice =
      ANIL_EVENTS_CONFIG.decoration[decoration] ?? 0;

    const extraPrice =
      ANIL_EVENTS_CONFIG.extraServices[extras] ?? 0;

    const perGuest =
      ANIL_EVENTS_CONFIG.perGuestEstimate[selectedEvent] ?? 80;

    // Illustrative guest-count component.
    const guestCost = guestCount * perGuest;

    currentEstimate = packagePrice +
      decorationPrice +
      extraPrice +
      guestCost;

    if (guestLabel) {
      guestLabel.textContent = String(guestCount);
    }

    totalOutput.textContent = formatINR(currentEstimate);

    if (packageOutput) {
      packageOutput.textContent = formatINR(packagePrice);
    }

    if (decorationOutput) {
      decorationOutput.textContent = formatINR(decorationPrice);
    }

    if (extraOutput) {
      extraOutput.textContent = formatINR(extraPrice);
    }

    if (bookingLink) {
      bookingLink.dataset.estimate = String(currentEstimate);
      bookingLink.dataset.event = selectedEvent;
      bookingLink.dataset.package = selectedPackage;
      bookingLink.dataset.guests = String(guestCount);
    }
  }

  [
    eventType,
    packageSelect,
    guestSlider,
    decorationSelect,
    extraSelect
  ].forEach((control) => {
    control.addEventListener("input", calculateEstimate);
    control.addEventListener("change", calculateEstimate);
  });

  calculateEstimate();
}


/* =========================================================
   DATE INPUT MINIMUMS
   ========================================================= */

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function initDateMinimums() {
  const today = getLocalDateString();

  [
    "#availability-date",
    "#booking-date"
  ].forEach((selector) => {
    const input = getElement(selector);

    if (input) {
      input.min = today;
    }
  });
}


/* =========================================================
   DATE AVAILABILITY CHECKER
   ========================================================= */

function initDateAvailability() {
  const form = getElement("#availability-form");
  const dateInput = getElement("#availability-date");
  const typeInput = getElement("#availability-type");
  const result = getElement("#availability-result");

  if (!form || !dateInput || !result) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const date = dateInput.value;
    const eventType = typeInput
      ? typeInput.value
      : "Event";

    if (!date) {
      setMessage(
        result,
        "Please select your preferred event date.",
        "error"
      );

      return;
    }

    const today = getLocalDateString();

    if (date < today) {
      setMessage(
        result,
        "Please choose today or a future date.",
        "error"
      );

      return;
    }

    // This only checks local demo requests in this browser.
    // It cannot determine the actual business calendar.
    const requests = readLocalArray(
      ANIL_EVENTS_CONFIG.dateRequestsKey
    );

    const alreadyRequested = requests.some(
      (request) => request.date === date
    );

    if (!alreadyRequested) {
      requests.push({
        date,
        eventType,
        createdAt: new Date().toISOString()
      });

      writeLocalArray(
        ANIL_EVENTS_CONFIG.dateRequestsKey,
        requests
      );
    }

    setMessage(
      result,
      `Your preferred date is ${date}. This website cannot verify live availability. Please contact Anil Events to confirm the date and discuss your ${eventType.toLowerCase()}.`,
      "info"
    );

    // Populate the booking form when available.
    const bookingDate = getElement("#booking-date");
    const bookingEvent = getElement("#booking-event");

    if (bookingDate) {
      bookingDate.value = date;
    }

    if (bookingEvent) {
      const matchingOption = Array.from(
        bookingEvent.options
      ).find((option) => option.value === eventType);

      if (matchingOption) {
        bookingEvent.value = eventType;
      }
    }
  });
}


/* =========================================================
   PACKAGE BUTTONS
   ========================================================= */

function initPackageButtons() {
  const packageButtons = getElements("[data-package].package-book");
  const packageSelect = getElement("#booking-package");

  packageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!packageSelect) return;

      const packageName = button.dataset.package;

      const matchingOption = Array.from(
        packageSelect.options
      ).find(
        (option) =>
          option.value.toLowerCase() ===
          String(packageName).toLowerCase()
      );

      if (matchingOption) {
        packageSelect.value = matchingOption.value;
      }
    });
  });

  const estimateBook = getElement("#estimate-book");

  if (estimateBook) {
    estimateBook.addEventListener("click", () => {
      const packageKey = estimateBook.dataset.package;
      const eventKey = estimateBook.dataset.event;
      const guestCount = estimateBook.dataset.guests;
      const estimate = estimateBook.dataset.estimate;

      if (packageSelect && packageKey) {
        const matchingPackage = Array.from(
          packageSelect.options
        ).find(
          (option) =>
            option.value.toLowerCase() === packageKey.toLowerCase()
        );

        if (matchingPackage) {
          packageSelect.value = matchingPackage.value;
        }
      }

      const bookingEvent = getElement("#booking-event");
      const estimatorEvent = getElement("#estimator-event");

      if (bookingEvent && estimatorEvent && eventKey) {
        const eventNames = {
          wedding: "Wedding",
          engagement: "Engagement",
          birthday: "Birthday",
          traditional: "Traditional function",
          corporate: "Corporate event",
          other: "Other celebration"
        };

        const desiredEvent = eventNames[eventKey];

        const option = Array.from(
          bookingEvent.options
        ).find((item) => item.value === desiredEvent);

        if (option) {
          bookingEvent.value = desiredEvent;
        }
      }

      const messageField = getElement("#booking-message-text");

      if (messageField && estimate) {
        const estimateText =
          `Website budget estimate: ${formatINR(Number(estimate))}. ` +
          `Estimated guests: ${guestCount || "Not specified"}.`;

        if (!messageField.value.includes("Website budget estimate:")) {
          messageField.value = messageField.value.trim()
            ? `${messageField.value.trim()}\n${estimateText}`
            : estimateText;
        }
      }
    });
  }
}


/* =========================================================
   WHATSAPP BOOKING FORM
   ========================================================= */

function initBookingForm() {
  const form = getElement("#booking-form");
  const messageOutput = getElement("#booking-message");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const name = getElement("#booking-name")?.value.trim() || "";
    const phone = getElement("#booking-phone")?.value.trim() || "";
    const eventType = getElement("#booking-event")?.value || "";
    const eventDate = getElement("#booking-date")?.value || "";
    const guests = getElement("#booking-guests")?.value || "Not specified";
    const packageName = getElement("#booking-package")?.value || "Not decided";
    const budget = getElement("#booking-budget")?.value || "Not specified";
    const location = getElement("#booking-location")?.value.trim() || "Not specified";
    const message = getElement("#booking-message-text")?.value.trim() || "No additional details";
    const consent = getElement("#booking-consent")?.checked || false;

    if (!name || !phone || !eventType || !eventDate) {
      setMessage(
        messageOutput,
        "Please complete your name, phone number, event type and date.",
        "error"
      );

      return;
    }

    if (!isValidPhone(phone)) {
      setMessage(
        messageOutput,
        "Please enter a valid contact number.",
        "error"
      );

      return;
    }

    if (!consent) {
      setMessage(
        messageOutput,
        "Please confirm that you want to open WhatsApp to send your enquiry.",
        "error"
      );

      return;
    }

    if (eventDate < getLocalDateString()) {
      setMessage(
        messageOutput,
        "Please choose today or a future event date.",
        "error"
      );

      return;
    }

    const enquiry = {
      id: `AE-${Date.now()}`,
      name,
      phone: normalisePhone(phone),
      eventType,
      eventDate,
      guests,
      packageName,
      budget,
      location,
      message,
      createdAt: new Date().toISOString()
    };

    // Save only to this browser for the admin demo.
    // This is not a central database and may contain personal data.
    // Do not use this local demo as a production CRM.
    const enquiries = readLocalArray(
      ANIL_EVENTS_CONFIG.enquiriesKey
    );

    enquiries.push(enquiry);

    const saved = writeLocalArray(
      ANIL_EVENTS_CONFIG.enquiriesKey,
      enquiries
    );

    const whatsappMessage = [
      "Hello Anil Events!",
      "",
      "I would like to enquire about an event.",
      "",
      `Name: ${name}`,
      `Contact number: ${phone}`,
      `Event type: ${eventType}`,
      `Preferred date: ${eventDate}`,
      `Expected guests: ${guests}`,
      `Preferred package: ${packageName}`,
      `Approximate budget: ${budget}`,
      `Venue / location: ${location}`,
      "",
      "Additional details:",
      message,
      "",
      "Please let me know your availability and quotation.",
      "",
      "This is an enquiry, not a confirmed booking."
    ].join("\n");

    setMessage(
      messageOutput,
      saved
        ? "Your enquiry is ready. WhatsApp will open so you can review and send it."
        : "WhatsApp will open with your enquiry. Local demo data could not be saved in this browser.",
      "success"
    );

    openWhatsApp(whatsappMessage);

    // Update the admin view if it is currently open.
    refreshAdminDashboard();
  });
}


/* =========================================================
   ADMIN DASHBOARD — LOCAL DEMO ONLY
   ========================================================= */

let adminDemoUnlocked = false;

function initAdminDashboard() {
  const openButton = getElement("#admin-open");
  const closeButton = getElement("#admin-close");
  const overlay = getElement("#admin-overlay");
  const loginButton = getElement("#admin-login-button");
  const codeInput = getElement("#admin-demo-code");
  const loginMessage = getElement("#admin-login-message");

  const exportButton = getElement("#admin-export");
  const refreshButton = getElement("#admin-refresh");
  const clearButton = getElement("#admin-clear");
  const logoutButton = getElement("#admin-logout");

  if (!overlay) return;

  function openAdmin() {
    showElement(overlay);

    overlay.classList.add("active");

    document.body.classList.add("admin-open");

    if (adminDemoUnlocked) {
      showAdminContent();
    } else {
      showAdminLogin();

      if (codeInput) {
        codeInput.value = "";
        codeInput.focus();
      }
    }
  }

  function closeAdmin() {
    overlay.classList.remove("active");
    hideElement(overlay);

    document.body.classList.remove("admin-open");
  }

  function showAdminLogin() {
    showElement(getElement("#admin-login"));
    hideElement(getElement("#admin-content"));
  }

  function showAdminContent() {
    hideElement(getElement("#admin-login"));
    showElement(getElement("#admin-content"));

    refreshAdminDashboard();
  }

  if (openButton) {
    openButton.addEventListener("click", openAdmin);
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeAdmin);
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeAdmin();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !overlay.classList.contains("hidden")
    ) {
      closeAdmin();
    }
  });

  if (loginButton) {
    loginButton.addEventListener("click", () => {
      const enteredCode = codeInput?.value || "";

      if (enteredCode === ANIL_EVENTS_CONFIG.demoAdminCode) {
        adminDemoUnlocked = true;

        setMessage(
          loginMessage,
          "Demo dashboard opened. Remember: this is not secure authentication.",
          "success"
        );

        showAdminContent();
      } else {
        setMessage(
          loginMessage,
          "Incorrect demo code. Check demoAdminCode in script.js.",
          "error"
        );
      }
    });
  }

  if (codeInput) {
    codeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        loginButton?.click();
      }
    });
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", refreshAdminDashboard);
  }

  if (exportButton) {
    exportButton.addEventListener("click", exportEnquiriesCSV);
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        "Clear all Anil Events demo enquiries saved in this browser? This cannot be undone."
      );

      if (!confirmed) return;

      try {
        localStorage.removeItem(
          ANIL_EVENTS_CONFIG.enquiriesKey
        );

        localStorage.removeItem(
          ANIL_EVENTS_CONFIG.dateRequestsKey
        );
      } catch (error) {
        console.error("Could not clear local demo data.", error);
      }

      refreshAdminDashboard();

      window.alert("Local demo data cleared from this browser.");
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      adminDemoUnlocked = false;

      if (codeInput) {
        codeInput.value = "";
      }

      showAdminLogin();
    });
  }
}


function refreshAdminDashboard() {
  const tableBody = getElement("#admin-table-body");

  if (!tableBody) return;

  const enquiries = readLocalArray(
    ANIL_EVENTS_CONFIG.enquiriesKey
  );

  const dateRequests = readLocalArray(
    ANIL_EVENTS_CONFIG.dateRequestsKey
  );

  const today = getLocalDateString();

  const upcomingDates = dateRequests.filter(
    (request) => request.date >= today
  ).length;

  setText("#admin-total", enquiries.length);
  setText("#admin-upcoming", upcomingDates);
  setText("#admin-bookings", enquiries.length);

  tableBody.replaceChildren();

  if (!enquiries.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.textContent = "No demo enquiries saved yet.";

    row.appendChild(cell);
    tableBody.appendChild(row);

    return;
  }

  enquiries.slice().reverse().forEach((enquiry) => {
    const row = document.createElement("tr");

    const values = [
      enquiry.name,
      enquiry.phone,
      enquiry.eventType,
      enquiry.eventDate,
      enquiry.packageName
    ];

    values.forEach((value) => {
      const cell = document.createElement("td");

      // Use textContent rather than HTML to avoid injecting user input.
      cell.textContent = String(value || "—");

      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });
}


/* =========================================================
   CSV EXPORT FOR DEMO ENQUIRIES
   ========================================================= */

function exportEnquiriesCSV() {
  const enquiries = readLocalArray(
    ANIL_EVENTS_CONFIG.enquiriesKey
  );

  if (!enquiries.length) {
    window.alert("There are no demo enquiries to export yet.");
    return;
  }

  const columns = [
    ["id", "Enquiry ID"],
    ["name", "Name"],
    ["phone", "Phone"],
    ["eventType", "Event Type"],
    ["eventDate", "Event Date"],
    ["guests", "Guests"],
    ["packageName", "Package"],
    ["budget", "Budget"],
    ["location", "Location"],
    ["message", "Message"],
    ["createdAt", "Created At"]
  ];

  function escapeCSV(value) {
    let safeValue = String(value ?? "");

    // Reduce spreadsheet formula injection risk in exported text.
    if (/^[\s]*[=+\-@]/.test(safeValue)) {
      safeValue = "'" + safeValue;
    }

    return `"${safeValue.replace(/"/g, '""')}"`;
  }

  const rows = [
    columns.map((column) => escapeCSV(column[1])).join(",")
  ];

  enquiries.forEach((enquiry) => {
    rows.push(
      columns
        .map(([key]) => escapeCSV(enquiry[key]))
        .join(",")
    );
  });

  const csv = "\uFEFF" + rows.join("\r\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const objectURL = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectURL;
  link.download = `anil-events-demo-enquiries-${getLocalDateString()}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectURL);
}


/* =========================================================
   PWA INSTALL BUTTON
   ========================================================= */

function initInstallableWebsite() {
  const installButton = getElement("#install-button");

  if (!installButton) return;

  let installPrompt = null;

  // Supported mainly in Chromium browsers when install criteria
  // and HTTPS/localhost requirements are satisfied.
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();

    installPrompt = event;
    showElement(installButton);
  });

  installButton.addEventListener("click", async () => {
    if (!installPrompt) {
      window.alert(
        "If installation is supported, use your browser menu and choose Install app or Add to Home Screen. Make sure the website is served over HTTPS or localhost and has a valid manifest and service worker."
      );

      return;
    }

    try {
      installPrompt.prompt();

      await installPrompt.userChoice;

      installPrompt = null;
      hideElement(installButton);
    } catch (error) {
      console.warn("The installation prompt could not be completed.", error);
    }
  });

  window.addEventListener("appinstalled", () => {
    hideElement(installButton);
    installPrompt = null;
  });
}


/* =========================================================
   SERVICE WORKER
   ========================================================= */

function initServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  // Service workers require HTTPS or localhost.
  const allowedProtocol =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!allowedProtocol) {
    console.info(
      "PWA service worker skipped: use HTTPS or localhost."
    );

    return;
  }

  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
      console.info("Anil Events service worker registered.");
    } catch (error) {
      console.warn(
        "Service worker registration failed. Check sw.js and your hosting setup.",
        error
      );
    }
  });
}


/* =========================================================
   FOOTER YEAR
   ========================================================= */

function initCurrentYear() {
  const yearElement = getElement("#current-year");

  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
}


/* =========================================================
   SMOOTH NAVIGATION
   ========================================================= */

function initSmoothNavigation() {
  const anchorLinks = getElements('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = getElement(href);

      if (!target) return;

      // Respect reduced-motion accessibility settings.
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      event.preventDefault();

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });

      // Keep the URL anchor updated without causing another jump.
      if (window.location.hash !== href) {
        history.replaceState(null, "", href);
      }
    });
  });
}

/* ============================================
   ANIL EVENTS — INTERACTIVE FEATURES ADD-ON
   Append this to the bottom of script.js
============================================ */

(() => {
  "use strict";

  const initAnilExtras = () => {
    /* ---------- Gallery search + favourites ---------- */
    const gallery = document.querySelector(".gallery-grid");
    const search = document.getElementById("gallery-search");
    const favouritesToggle = document.getElementById("show-favourites");
    const favouriteCount = document.getElementById("favourite-count");
    const results = document.getElementById("gallery-results");

    const FAVOURITES_KEY = "anilEventsGalleryFavourites";
    let favourites = new Set();

    try {
      const saved = JSON.parse(localStorage.getItem(FAVOURITES_KEY) || "[]");
      if (Array.isArray(saved)) favourites = new Set(saved);
    } catch (error) {
      console.warn("Gallery favourites could not be loaded.");
    }

    let favouritesOnly = false;

    const getCardKey = (card, index) =>
      card.dataset.image ||
      card.querySelector("img")?.currentSrc ||
      card.querySelector("img")?.src ||
      `gallery-${index}`;

    if (gallery) {
      const cards = Array.from(gallery.querySelectorAll(".gallery-item"));

      cards.forEach((card, index) => {
        const key = getCardKey(card, index);
        card.dataset.favouriteKey = key;

        // Use a span instead of a nested button because each gallery card
        // is already a button in the supplied HTML.
        let favouriteControl = card.querySelector(".gallery-favourite");

        if (!favouriteControl) {
          favouriteControl = document.createElement("span");
          favouriteControl.className = "gallery-favourite";
          favouriteControl.setAttribute("role", "button");
          favouriteControl.setAttribute("tabindex", "0");
          favouriteControl.setAttribute(
            "aria-label",
            "Add this design to favourites"
          );
          favouriteControl.setAttribute("aria-pressed", "false");
          favouriteControl.textContent = "♡";
          card.appendChild(favouriteControl);
        }

        const updateFavouriteControl = () => {
          const isFavourite = favourites.has(key);
          favouriteControl.setAttribute(
            "aria-pressed",
            String(isFavourite)
          );
          favouriteControl.textContent = isFavourite ? "♥" : "♡";
          favouriteControl.setAttribute(
            "aria-label",
            isFavourite
              ? "Remove this design from favourites"
              : "Add this design to favourites"
          );
        };

        const toggleFavourite = (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (favourites.has(key)) {
            favourites.delete(key);
          } else {
            favourites.add(key);
          }

          try {
            localStorage.setItem(
              FAVOURITES_KEY,
              JSON.stringify(Array.from(favourites))
            );
          } catch (error) {
            console.warn("Browser storage is unavailable.");
          }

          updateFavouriteControl();
          updateFavouriteCount();
          applyGalleryExtras();
        };

        favouriteControl.addEventListener("click", toggleFavourite);
        favouriteControl.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            toggleFavourite(event);
          }
        });

        updateFavouriteControl();
      });

      function updateFavouriteCount() {
        if (favouriteCount) {
          favouriteCount.textContent = String(favourites.size);
        }
      }

      function applyGalleryExtras() {
        const query = (search?.value || "").trim().toLowerCase();
        const activeFilter =
          document.querySelector(".filter-btn.active")?.dataset.filter || "all";

        let visibleCount = 0;

        cards.forEach((card) => {
          const category = (card.dataset.category || "").toLowerCase();
          const imageAlt = card.querySelector("img")?.alt || "";
          const cardText = card.innerText || "";
          const searchable = `${category} ${imageAlt} ${cardText}`.toLowerCase();
          const categoryMatches =
            activeFilter === "all" || category === activeFilter;
          const searchMatches = !query || searchable.includes(query);
          const favouriteMatches =
            !favouritesOnly || favourites.has(card.dataset.favouriteKey);

          const visible =
            categoryMatches && searchMatches && favouriteMatches;

          card.classList.toggle("is-filtered-out", !visible);
          card.hidden = !visible;

          if (visible) visibleCount++;
        });

        if (results) {
          results.textContent =
            `${visibleCount} design${visibleCount === 1 ? "" : "s"} shown` +
            (favouritesOnly ? " in your favourites." : ".");
        }

        if (favouritesToggle) {
          favouritesToggle.setAttribute(
            "aria-pressed",
            String(favouritesOnly)
          );
        }
      }

      search?.addEventListener("input", applyGalleryExtras);

      favouritesToggle?.addEventListener("click", () => {
        favouritesOnly = !favouritesOnly;
        applyGalleryExtras();
      });

      // Existing category filter buttons are handled by the original script.
      document.querySelectorAll(".filter-btn[data-filter]").forEach((button) => {
        button.addEventListener("click", () => {
          window.setTimeout(applyGalleryExtras, 0);
        });
      });

      updateFavouriteCount();
      applyGalleryExtras();
    }

    /* ---------- Before / after comparison ---------- */
    const comparison = document.getElementById("comparison-frame");
    const comparisonRange = document.getElementById("comparison-range");

    if (comparison && comparisonRange) {
      const updateComparison = () => {
        const value = Math.max(
          0,
          Math.min(100, Number(comparisonRange.value) || 0)
        );

        comparison.style.setProperty("--comparison", `${value}%`);
      };

      comparisonRange.addEventListener("input", updateComparison);
      updateComparison();
    }

    /* ---------- Back-to-top control ---------- */
    const backToTop = document.getElementById("back-to-top");

    if (backToTop) {
      const updateBackToTop = () => {
        backToTop.classList.toggle(
          "is-visible",
          window.scrollY > 500
        );
      };

      window.addEventListener("scroll", updateBackToTop, { passive: true });

      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      updateBackToTop();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnilExtras, { once: true });
  } else {
    initAnilExtras();
  }
})();
```javascript
/* ==========================================
   ANIL EVENTS — COMMIT 3
   PREMIUM MOTION & INTERACTIONS
========================================== */

(() => {
  "use strict";

  function initLuxuryExperience() {
    if (document.documentElement.dataset.luxuryMotionReady === "true") {
      return;
    }

    document.documentElement.dataset.luxuryMotionReady = "true";

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1. Glass header reacts to scrolling
    const header = document.getElementById("site-header");

    function updateHeader() {
      if (!header) return;
      header.classList.toggle("scrolled", window.scrollY > 30);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    // 2. Subtle gold pointer glow on desktop
    if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
      let scheduled = false;

      window.addEventListener("pointermove", (event) => {
        if (scheduled) return;
        scheduled = true;

        window.requestAnimationFrame(() => {
          document.documentElement.style.setProperty(
            "--pointer-x",
            `${event.clientX}px`
          );
          document.documentElement.style.setProperty(
            "--pointer-y",
            `${event.clientY}px`
          );
          scheduled = false;
        });
      }, { passive: true });
    }

    // 3. Reveal sections as they enter the screen
    const revealTargets = document.querySelectorAll(
      ".section-heading, .intro-label, .intro-content, " +
      ".service-card, .package-card, .gallery-item, " +
      ".estimate-card, .booking-info, .booking-form, " +
      ".availability-form, .final-cta .container"
    );

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((element) => {
        element.classList.add("is-visible");
      });
    } else {
      const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      }, {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      });

      revealTargets.forEach((element, index) => {
        element.classList.add("js-reveal");

        if (element.matches(".service-card, .package-card, .gallery-item")) {
          element.classList.add(`js-reveal-delay-${(index % 3) + 1}`);
        }

        observer.observe(element);
      });
    }

    // 4. Subtle 3D card tilt on desktop only
    const canTilt =
      !reducedMotion &&
      window.matchMedia("(pointer: fine)").matches;

    if (canTilt) {
      const tiltCards = document.querySelectorAll(
        ".service-card, .package-card"
      );

      tiltCards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;

          const rotateY = (x - 0.5) * 4;
          const rotateX = (0.5 - y) * 4;

          card.style.transform =
            `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
        });

        card.addEventListener("pointerleave", () => {
          card.style.transform = "";
        });

        card.addEventListener("blur", () => {
          card.style.transform = "";
        });
      });
    }

    // 5. Elegant hero particle decoration
    const hero = document.querySelector(".hero-section");

    if (hero && !reducedMotion && !hero.querySelector(".luxury-particles")) {
      const particleLayer = document.createElement("div");
      particleLayer.className = "luxury-particles";
      particleLayer.setAttribute("aria-hidden", "true");

      Object.assign(particleLayer.style, {
        position: "absolute",
        inset: "0",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: "1"
      });

      for (let i = 0; i < 16; i++) {
        const particle = document.createElement("span");
        particle.className = "luxury-particle";

        const size = 2 + Math.random() * 3;

        Object.assign(particle.style, {
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `${25 + Math.random() * 70}%`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: "#d4af37",
          opacity: "0",
          boxShadow: "0 0 12px rgba(212, 175, 55, 0.65)",
          animation: `luxuryParticleFloat ${6 + Math.random() * 8}s ${Math.random() * 6}s infinite ease-in-out`
        });

        particleLayer.appendChild(particle);
      }

      hero.prepend(particleLayer);

      if (!document.getElementById("luxury-particle-styles")) {
        const style = document.createElement("style");
        style.id = "luxury-particle-styles";
        style.textContent = `
          @keyframes luxuryParticleFloat {
            0% {
              opacity: 0;
              transform: translate3d(0, 20px, 0);
            }
            20% { opacity: .65; }
            75% { opacity: .35; }
            100% {
              opacity: 0;
              transform: translate3d(12px, -70px, 0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .luxury-particles { display: none !important; }
          }
        `;
        document.head.appendChild(style);
      }
    }

    // 6. Smooth anchor navigation with sticky-header offset
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start"
        });

        // Close the mobile menu if it is open
        const nav = document.getElementById("nav-links");
        const menuToggle = document.getElementById("menu-toggle");

        if (nav && menuToggle) {
          nav.classList.remove("active");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    console.info("Anil Events luxury motion experience initialized.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLuxuryExperience, {
      once: true
    });
  } else {
    initLuxuryExperience();
  }
})();
```