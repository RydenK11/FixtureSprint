/* ==========================================================================
   FixtureSprint — script.js
   Plain vanilla JavaScript. No frameworks, no build step.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Mobile navigation toggle
     ------------------------------------------------------------------ */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the mobile menu after a nav link is clicked.
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------------------
     Smooth-scroll navigation for in-page anchor links
     (CSS `scroll-behavior: smooth` already handles most browsers;
     this JS fallback also accounts for the sticky header offset.)
     ------------------------------------------------------------------ */
  var header = document.querySelector(".site-header");

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }
      var target = document.querySelector(targetId);
      if (!target) {
        return;
      }
      event.preventDefault();
      var headerHeight = header ? header.offsetHeight : 0;
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
      window.scrollTo({
        top: targetPosition,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ------------------------------------------------------------------
     Contact form: client-side validation + fetch/AJAX submit to Formspree
     ------------------------------------------------------------------ */
  var form = document.getElementById("intakeForm");

  if (form) {
    var submitBtn = document.getElementById("submitBtn");
    var btnLabel = submitBtn ? submitBtn.querySelector(".btn__label") : null;
    var btnSpinner = submitBtn ? submitBtn.querySelector(".btn__spinner") : null;
    var statusEl = document.getElementById("formStatus");

    var SUCCESS_MESSAGE = "Your production problem has been received. We’ll review whether it is a good fit for rapid tooling.";
    var ERROR_MESSAGE = "The form could not be submitted. Please try again or email us directly.";

    var requiredFields = [
      { id: "fullName", message: "Please enter your full name." },
      { id: "workEmail", message: "Please enter a valid work email." },
      { id: "companyName", message: "Please enter your company name." },
      { id: "problem", message: "Please describe the production problem." },
      { id: "consent", message: "Please acknowledge before submitting." }
    ];

    function setFieldError(id, message) {
      var field = document.getElementById(id);
      var errorEl = document.getElementById(id + "-error");
      if (field) {
        field.classList.toggle("is-invalid", Boolean(message));
      }
      if (errorEl) {
        errorEl.textContent = message || "";
      }
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validateForm() {
      var isValid = true;

      requiredFields.forEach(function (fieldDef) {
        var field = document.getElementById(fieldDef.id);
        if (!field) {
          return;
        }

        var value = field.type === "checkbox" ? field.checked : field.value.trim();
        var hasValue = field.type === "checkbox" ? value === true : value.length > 0;

        if (!hasValue) {
          setFieldError(fieldDef.id, fieldDef.message);
          isValid = false;
          return;
        }

        if (fieldDef.id === "workEmail" && !isValidEmail(value)) {
          setFieldError(fieldDef.id, "Please enter a valid email address.");
          isValid = false;
          return;
        }

        setFieldError(fieldDef.id, "");
      });

      return isValid;
    }

    function setLoading(isLoading) {
      if (!submitBtn) {
        return;
      }
      submitBtn.disabled = isLoading;
      if (btnSpinner) {
        btnSpinner.hidden = !isLoading;
      }
      if (btnLabel) {
        btnLabel.textContent = isLoading ? "Sending…" : "Send Your Problem";
      }
    }

    function showStatus(message, type) {
      if (!statusEl) {
        return;
      }
      statusEl.textContent = message;
      statusEl.classList.remove("is-success", "is-error");
      if (type) {
        statusEl.classList.add(type === "success" ? "is-success" : "is-error");
      }
    }

    // Clear a field's inline error as soon as the visitor starts fixing it.
    requiredFields.forEach(function (fieldDef) {
      var field = document.getElementById(fieldDef.id);
      if (field) {
        field.addEventListener("input", function () {
          setFieldError(fieldDef.id, "");
        });
        field.addEventListener("change", function () {
          setFieldError(fieldDef.id, "");
        });
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      showStatus("", null);

      if (!validateForm()) {
        showStatus(ERROR_MESSAGE, "error");
        return;
      }

      // Honeypot check: if the hidden field has a value, silently drop the
      // submission without hitting the network (bots fill hidden fields).
      var honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        showStatus(SUCCESS_MESSAGE, "success");
        form.reset();
        return;
      }

      setLoading(true);

      var formData = new FormData(form);

      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      })
        .then(function (response) {
          if (response.ok) {
            showStatus(SUCCESS_MESSAGE, "success");
            form.reset();
          } else {
            showStatus(ERROR_MESSAGE, "error");
          }
        })
        .catch(function () {
          showStatus(ERROR_MESSAGE, "error");
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }

  /* ------------------------------------------------------------------
     Footer copyright year, generated automatically
     ------------------------------------------------------------------ */
  var yearEl = document.getElementById("copyrightYear");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
