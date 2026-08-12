/* ==========================================================================
   FixtureSprint — script.js
   Plain vanilla JavaScript. No frameworks, no build step.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Google Ads conversion tracking — "FixtureSprint - Form Submission"
     Shared by both the main contact form and the Google Ads popup form
     (see below), so it's defined once at the top of this file's shared
     scope rather than nested inside either form's own handler. Call
     this only after Formspree has confirmed a successful HTTP response
     for a real submission — never on page load, popup open, button
     click, validation, or a failed/error response.
     ------------------------------------------------------------------ */
  function trackGoogleAdsLead() {
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        'send_to': 'AW-18384514901/DvBmCPm6kuAcENXetb5E'
      });
    }
  }

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

    var isSubmittingForm = false;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Guard against double-clicks or an Enter-key resubmit firing a
      // second "submit" event while a request is already in flight —
      // this also protects against a duplicate Google Ads conversion.
      if (isSubmittingForm) {
        return;
      }

      showStatus("", null);

      if (!validateForm()) {
        showStatus(ERROR_MESSAGE, "error");
        return;
      }

      // Honeypot check: if the hidden field has a value, silently drop the
      // submission without hitting the network (bots fill hidden fields).
      // This is not a real lead, so no conversion is tracked here.
      var honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        showStatus(SUCCESS_MESSAGE, "success");
        form.reset();
        return;
      }

      isSubmittingForm = true;
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
            // Conversion fires only after Formspree confirms success,
            // and before the success message is shown.
            trackGoogleAdsLead();
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
          isSubmittingForm = false;
          setLoading(false);
        });
    });
  }

  /* ------------------------------------------------------------------
     Google Ads lead-capture modal
     Shown only to visitors who arrived via paid Google Ads traffic
     (a `gclid` URL parameter, or `utm_source=google`) — never to
     direct, organic, or cold-email visitors. Appears ~1.5s after load
     and, once dismissed, is not shown again for the rest of the
     browser session (tracked via sessionStorage, not a cookie).
     ------------------------------------------------------------------ */
  (function () {
    var SESSION_DISMISSED_KEY = "fsAdsModalDismissed";
    var SHOW_DELAY_MS = 1500;
    var AUTO_CLOSE_AFTER_SUCCESS_MS = 3000;

    var overlay = document.getElementById("adsModalOverlay");
    var modal = document.getElementById("adsModal");
    var closeBtn = document.getElementById("adsModalClose");
    var adsForm = document.getElementById("adsModalForm");

    if (!overlay || !modal || !closeBtn || !adsForm) {
      return;
    }

    function isGoogleAdsTraffic() {
      var params = new URLSearchParams(window.location.search);
      return params.has("gclid") || params.get("utm_source") === "google";
    }

    function wasDismissedThisSession() {
      try {
        return sessionStorage.getItem(SESSION_DISMISSED_KEY) === "true";
      } catch (e) {
        // sessionStorage can throw in some privacy modes — fail open
        // (treat as "not dismissed yet") rather than breaking the page.
        return false;
      }
    }

    function markDismissedThisSession() {
      try {
        sessionStorage.setItem(SESSION_DISMISSED_KEY, "true");
      } catch (e) {
        /* ignore — worst case the modal can show again this session */
      }
    }

    var lastFocusedElement = null;

    function getFocusableElements() {
      var nodes = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return Array.prototype.filter.call(nodes, function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
    }

    function onKeydown(event) {
      if (event.key === "Escape") {
        closeAdsModal();
        return;
      }

      if (event.key === "Tab") {
        var focusable = getFocusableElements();
        if (focusable.length === 0) {
          return;
        }
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    function openAdsModal() {
      overlay.hidden = false;
      lastFocusedElement = document.activeElement;
      var firstField = document.getElementById("adsFirstName");
      if (firstField) {
        firstField.focus();
      }
      document.addEventListener("keydown", onKeydown);
    }

    function closeAdsModal() {
      if (overlay.hidden) {
        return;
      }
      overlay.hidden = true;
      markDismissedThisSession();
      document.removeEventListener("keydown", onKeydown);
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    }

    closeBtn.addEventListener("click", closeAdsModal);

    // Clicking the dimmed backdrop (but not the modal card itself) closes it.
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeAdsModal();
      }
    });

    if (isGoogleAdsTraffic() && !wasDismissedThisSession()) {
      window.setTimeout(openAdsModal, SHOW_DELAY_MS);
    }

    // trackGoogleAdsLead() is defined once, shared across both forms —
    // see the top of this file.

    var adsSubmitBtn = document.getElementById("adsModalSubmitBtn");
    var adsBtnLabel = adsSubmitBtn ? adsSubmitBtn.querySelector(".btn__label") : null;
    var adsBtnSpinner = adsSubmitBtn ? adsSubmitBtn.querySelector(".btn__spinner") : null;
    var adsStatusEl = document.getElementById("adsModalStatus");
    var isSubmittingAdsForm = false;

    function setAdsFormLoading(isLoading) {
      if (!adsSubmitBtn) {
        return;
      }
      adsSubmitBtn.disabled = isLoading;
      if (adsBtnSpinner) {
        adsBtnSpinner.hidden = !isLoading;
      }
      if (adsBtnLabel) {
        adsBtnLabel.textContent = isLoading ? "Sending…" : "Get a Free Fit Assessment";
      }
    }

    function showAdsFormStatus(message, type) {
      if (!adsStatusEl) {
        return;
      }
      adsStatusEl.textContent = message;
      adsStatusEl.classList.remove("is-success", "is-error");
      if (type) {
        adsStatusEl.classList.add(type === "success" ? "is-success" : "is-error");
      }
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validateAdsForm() {
      var isValid = true;
      var fields = [
        { id: "adsFirstName", message: "Please enter your first name." },
        { id: "adsWorkEmail", message: "Please enter a valid work email." },
        { id: "adsCompany", message: "Please enter your company." },
        { id: "adsProblem", message: "Please describe the production problem." }
      ];

      fields.forEach(function (fieldDef) {
        var field = document.getElementById(fieldDef.id);
        var errorEl = document.getElementById(fieldDef.id + "-error");
        if (!field) {
          return;
        }

        var value = field.value.trim();
        var hasValue = value.length > 0;

        if (!hasValue) {
          isValid = false;
          field.classList.add("is-invalid");
          if (errorEl) {
            errorEl.textContent = fieldDef.message;
          }
          return;
        }

        if (fieldDef.id === "adsWorkEmail" && !isValidEmail(value)) {
          isValid = false;
          field.classList.add("is-invalid");
          if (errorEl) {
            errorEl.textContent = "Please enter a valid email address.";
          }
          return;
        }

        field.classList.remove("is-invalid");
        if (errorEl) {
          errorEl.textContent = "";
        }
      });

      return isValid;
    }

    adsForm.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("input", function () {
        field.classList.remove("is-invalid");
        var errorEl = document.getElementById(field.id + "-error");
        if (errorEl) {
          errorEl.textContent = "";
        }
      });
    });

    adsForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Guard against double-clicks / repeat submits while one is in flight.
      if (isSubmittingAdsForm) {
        return;
      }

      showAdsFormStatus("", null);

      if (!validateAdsForm()) {
        showAdsFormStatus("Please fill in the required fields.", "error");
        return;
      }

      // Honeypot check: if the hidden field has a value, silently drop the
      // submission without hitting the network (bots fill hidden fields).
      var honeypot = adsForm.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        return;
      }

      isSubmittingAdsForm = true;
      setAdsFormLoading(true);

      var formData = new FormData(adsForm);

      fetch(adsForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      })
        .then(function (response) {
          if (response.ok) {
            trackGoogleAdsLead();
            adsForm.innerHTML =
              '<p class="ads-modal__success">Thanks — we\'ll review the process and get back to you shortly.</p>';
            window.setTimeout(closeAdsModal, AUTO_CLOSE_AFTER_SUCCESS_MS);
          } else {
            showAdsFormStatus("The form could not be submitted. Please try again or email us directly.", "error");
            isSubmittingAdsForm = false;
            setAdsFormLoading(false);
          }
        })
        .catch(function () {
          showAdsFormStatus("The form could not be submitted. Please try again or email us directly.", "error");
          isSubmittingAdsForm = false;
          setAdsFormLoading(false);
        });
    });
  })();

  /* ------------------------------------------------------------------
     Footer copyright year, generated automatically
     ------------------------------------------------------------------ */
  var yearEl = document.getElementById("copyrightYear");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
