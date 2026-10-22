
"use strict";

const BUSINESS = {
  name: "Anil Events",
  whatsapp: "919740767446",
  phone1: "+91 97407 67446",
  phone2: "+91 63604 53032",
  location: "Barya Piligoodu, Uppinangady, Karnataka",
  instagram: "https://www.instagram.com/anil_events_?xtok=OXRkazdjenZ0eHFo&utm_source=qr",
  facebook: "https://www.facebook.com/share/19JYerGLTe/?mibextid=wwXIfr"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// Loading screen
window.addEventListener("load", () => {
  window.setTimeout(() => {
    $("#loader")?.classList.add("hidden");
  }, 650);
});

// Current year
$("#year").textContent = new Date().getFullYear();

// Theme switching
const savedTheme = (() => {
  try {
    return localStorage.getItem("anil-events-theme");
  } catch {
    return null;
  }
})();

function setTheme(theme) {
  const dark = theme === "dark";

  document.documentElement.dataset.theme = dark ? "dark" : "light";
  $("#themeIcon").textContent = dark ? "☾" : "☼";
  $("#themeToggle").setAttribute(
    "aria-label",
    dark ? "Switch to light theme" : "Switch to dark theme"
  );

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = dark ? "#101010" : "#faf8f2";

  try {
    localStorage.setItem("anil-events-theme", theme);
  } catch {
    // The theme still works for this page session.
  }
}

setTheme(savedTheme === "dark" ? "dark" : "light");

$("#themeToggle").addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";

  setTheme(nextTheme);
});

// Mobile navigation
const nav = $("#nav");
const menuToggle = $("#menuToggle");

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "✕" : "☰";
});

$$(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

// Gallery filtering
$$(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".filter-btn").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    const filter = button.dataset.filter;

    $$(".gallery-item").forEach((item) => {
      const visible =
        filter === "all" || item.dataset.category === filter;

      item.classList.toggle("is-hidden", !visible);
    });
  });
});

// Preselect the event when a service card is clicked.
$$("[data-event]").forEach((link) => {
  link.addEventListener("click", () => {
    const select = $("#eventType");
    const wanted = link.dataset.event;

    const option = [...select.options].find(
      (item) => item.value === wanted || item.textContent === wanted
    );

    if (option) select.value = option.value;
  });
});

// Prevent selecting a date in the past.
const eventDate = $("#eventDate");

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

eventDate.min = getLocalDateString();

// Booking enquiry: compose a WhatsApp message.
$("#bookingForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const status = $("#bookingStatus");

  if (!form.reportValidity()) return;

  const data = new FormData(form);

  const dateValue = data.get("date");
  const formattedDate = dateValue
    ? new Date(`${dateValue}T12:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : "Not specified";

  const details = [
    `Hello ${BUSINESS.name}!`,
    "",
    "I would like to enquire about booking an event.",
    "",
    `Name: ${data.get("name")}`,
    `Phone: ${data.get("phone")}`,
    `Event: ${data.get("event")}`,
    `Preferred Date: ${formattedDate}`,
    `Estimated Guests: ${data.get("guests") || "Not specified"}`,
    `Budget: ${data.get("budget") || "Not specified"}`,
    `Event Location: ${data.get("location") || "Not specified"}`,
    `Requirements: ${data.get("message") || "No additional details"}`,
    "",
    `Business location: ${BUSINESS.location}`,
    "Please let me know about availability and pricing."
  ].join("\n");

  const whatsappURL =
    `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(details)}`;

  status.textContent =
    "Your enquiry is ready. WhatsApp will open so you can review and send it.";

  window.open(whatsappURL, "_blank", "noopener,noreferrer");
});

// Star rating interaction
let selectedRating = 0;

const starButtons = $$("#starRating button");

function updateStars(rating) {
  starButtons.forEach((button) => {
    const selected = Number(button.dataset.rating) <= rating;

    button.textContent = selected ? "★" : "☆";
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

starButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedRating = Number(button.dataset.rating);
    updateStars(selectedRating);
  });
});

// Feedback storage.
// This is a local browser demonstration, not a shared online review database.
const FEEDBACK_KEY = "anil-events-feedback";

function readFeedback() {
  try {
    const saved = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
    return Array.isArray(saved) ? saved.slice(0, 20) : [];
  } catch {
    return [];
  }
}

function renderFeedback() {
  const container = $("#feedbackList");
  container.replaceChildren();

  readFeedback().forEach((review) => {
    const card = document.createElement("article");
    card.className = "feedback-card";

    const name = document.createElement("strong");
    name.textContent = review.name;

    const stars = document.createElement("div");
    stars.className = "stars";
    stars.textContent =
      "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);

    const message = document.createElement("p");
    message.textContent = review.message;

    card.append(name, stars, message);
    container.append(card);
  });
}

renderFeedback();

$("#feedbackForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const status = $("#feedbackStatus");

  if (!form.reportValidity()) return;

  if (selectedRating < 1 || selectedRating > 5) {
    status.textContent = "Please select a star rating before submitting.";
    return;
  }

  const data = new FormData(form);

  const review = {
    name: String(data.get("reviewer")).trim().slice(0, 80),
    rating: selectedRating,
    message: String(data.get("review")).trim().slice(0, 1000)
  };

  if (!review.name || !review.message) {
    status.textContent = "Please complete all feedback fields.";
    return;
  }

  try {
    const reviews = readFeedback();
    reviews.unshift(review);

    // Keep only the 20 most recent browser-local entries.
    localStorage.setItem(
      FEEDBACK_KEY,
      JSON.stringify(reviews.slice(0, 20))
    );

    renderFeedback();
    form.reset();
    selectedRating = 0;
    updateStars(0);

    status.textContent =
      "Thank you! Your feedback has been saved in this browser.";
  } catch {
    status.textContent =
      "Feedback could not be saved. Your browser storage may be unavailable or full.";
  }
});

// Scroll reveal animation
const revealElements = $$(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

// Back-to-top button
const backToTop = $("#backToTop");

window.addEventListener(
  "scroll",
  () => {
    backToTop.classList.toggle("visible", window.scrollY > 450);
  },
  { passive: true }
);

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Floating WhatsApp contact
const whatsappMessage =
  `Hello ${BUSINESS.name}! I would like to enquire about your event management and decoration services.`;

$("#whatsappFloat").href =
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
