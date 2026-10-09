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
     Google Ads Test #2 — shared event tracking + attribution capture

     ANALYTICS SETUP AS FOUND (read before editing this block):
       - Only a Google Ads tag is installed (gtag.js, AW-18384514901,
         wired up in index.html's <head>). There is no GA4 property
         (no gtag('config', 'G-XXXXXXXXXX')) and no GTM container
         anywhere in this repo.
       - That means GA4's automatic `page_view` and `user_engagement`
         events are NOT available yet — those come from a GA4 property
         specifically, and inventing a measurement ID here would send
         data nowhere (or into someone else's property by mistake).
         MANUAL SETUP REQUIRED: create a GA4 property, get its
         G-XXXXXXXXXX ID, and add one `gtag('config', 'G-...')` call
         next to the existing Ads config in index.html.
       - trackEvent() below is written to be forward-compatible with
         that: it just calls the existing shared gtag() function with
         no `send_to`, so once a GA4 config is added, every event
         already being fired will start flowing into GA4 with zero
         further code changes. Today, with only the Ads tag configured,
         these calls are inert from a GA4 reporting standpoint but are
         still a real, visible DevTools/dataLayer trail for debugging.
       - Do not add a second <script src="...gtag/js..."> tag or a
         second gtag('config', 'AW-18384514901') call — one of each
         already exists in index.html.
  ------------------------------------------------------------------ */
  function trackEvent(name, params) {
    if (typeof gtag === 'function') {
      gtag('event', name, params || {});
    }
  }

  // A stable, non-PII identifier per form per page load, carried in the
  // Formspree submission (as a hidden field) and in the generate_lead
  // event, so the same confirmed inquiry can be matched across the
  // Formspree record, GA4, and Google Ads instead of being double-
  // counted if something retries or re-renders.
  function makeLeadId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "lead-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  // Reads attribution params from the CURRENT URL only — nothing here
  // ever calls history.pushState/replaceState or reassigns
  // location.href, so gclid/gbraid/wbraid/utm_* are never stripped
  // before this (or the Ads tag) reads them.
  function getAttributionSnapshot() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_term: params.get("utm_term") || "",
      utm_content: params.get("utm_content") || "",
      gclid: params.get("gclid") || "",
      gbraid: params.get("gbraid") || "",
      wbraid: params.get("wbraid") || "",
      landing_page: window.location.pathname
    };
  }

  // Fills a form's hidden attribution fields (utm_*, gclid/gbraid/wbraid,
  // landing_page) from a snapshot captured once at page load — not by
  // re-reading the URL each time — so the ORIGINAL arrival attribution
  // is what ends up on every inquiry from this visit, even after
  // form.reset() (which clears hidden fields back to their blank HTML
  // default) runs following a successful submission.
  function applyAttributionSnapshot(idPrefix, snapshot) {
    var fieldMap = {
      UtmSource: snapshot.utm_source,
      UtmMedium: snapshot.utm_medium,
      UtmCampaign: snapshot.utm_campaign,
      UtmTerm: snapshot.utm_term,
      UtmContent: snapshot.utm_content,
      Gclid: snapshot.gclid,
      Gbraid: snapshot.gbraid,
      Wbraid: snapshot.wbraid,
      LandingPage: snapshot.landing_page
    };
    Object.keys(fieldMap).forEach(function (suffix) {
      var field = document.getElementById(idPrefix + suffix);
      if (field) {
        field.value = fieldMap[suffix];
      }
    });
  }

  // Generates a fresh lead_id and writes it to the form's hidden field,
  // returning the new value. Called once at setup (for the first
  // inquiry) and again right after a successful submission (so the
  // *next* inquiry in the same session gets its own unique id) — never
  // while a submission is still in flight, and never on a failed
  // attempt, so a retry of the same inquiry keeps the id it started
  // with instead of being miscounted as two different leads.
  function generateFreshLeadId(idPrefix) {
    var leadIdField = document.getElementById(idPrefix + "LeadId");
    var id = makeLeadId();
    if (leadIdField) {
      leadIdField.value = id;
    }
    return id;
  }

  function stampSubmittedAt(idPrefix) {
    var field = document.getElementById(idPrefix + "SubmittedAt");
    if (field) {
      field.value = new Date().toISOString();
    }
  }

  // case_study_view — fires once, the first time the case study section
  // is at least 40% visible in the viewport, via IntersectionObserver
  // (no scroll-event polling). Not tied to any form, so it's safe for
  // this to run unconditionally.
  (function () {
    var caseStudySection = document.getElementById("case-study");
    if (!caseStudySection || typeof IntersectionObserver !== "function") {
      return;
    }
    var hasFired = false;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!hasFired && entry.isIntersecting) {
            hasFired = true;
            trackEvent("case_study_view", {});
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(caseStudySection);
  })();

  // fixture_cta_click — delegated listener so every primary inquiry CTA
  // (hero, offer, nav) reports which one was clicked, without needing a
  // separate handler wired to each button.
  document.addEventListener("click", function (event) {
    var cta = event.target.closest ? event.target.closest("[data-cta]") : null;
    if (cta) {
      trackEvent("fixture_cta_click", { cta_location: cta.getAttribute("data-cta") });
    }
  });

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

    var SUCCESS_MESSAGE = "Your tooling inquiry has been received. We’ll review it and follow up by email.";
    var ERROR_MESSAGE = "The form could not be submitted. Please try again or email us directly.";

    var requiredFields = [
      { id: "fullName", message: "Please enter your full name." },
      { id: "workEmail", message: "Please enter a valid work email." },
      { id: "companyName", message: "Please enter your company name." },
      { id: "problem", message: "Please describe your tooling problem." }
    ];

    // Attribution is captured once, at page load, so it reflects how
    // this visitor actually arrived — not whatever the URL happens to
    // look like several minutes later when they submit. The snapshot is
    // re-applied to the hidden fields after every successful submission
    // too, since form.reset() would otherwise blank them out.
    var contactAttribution = getAttributionSnapshot();
    applyAttributionSnapshot("attr", contactAttribution);
    var contactLeadId = generateFreshLeadId("attr");

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
        btnLabel.textContent = isLoading ? "Sending…" : "Send Tooling Inquiry";
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

    // form_start — fires once, on the visitor's first real interaction
    // with the form (not on page load, and not for the honeypot field).
    var hasFiredFormStart = false;
    form.addEventListener(
      "focusin",
      function (event) {
        if (hasFiredFormStart || event.target.name === "_gotcha") {
          return;
        }
        hasFiredFormStart = true;
        trackEvent("form_start", { form: "contact" });
      },
      true
    );

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
        trackEvent("form_error", { form: "contact", reason: "validation" });
        return;
      }

      // Honeypot check: if the hidden field has a value, silently drop the
      // submission without hitting the network (bots fill hidden fields).
      // This is not a real lead, so no conversion or generate_lead event
      // is tracked here.
      var honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        showStatus(SUCCESS_MESSAGE, "success");
        form.reset();
        return;
      }

      isSubmittingForm = true;
      setLoading(true);
      stampSubmittedAt("attr");

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
            // Conversion and generate_lead fire only after Formspree
            // confirms success, and before the success message is shown.
            // generate_lead carries the same lead_id submitted in the
            // hidden field, so this one confirmed inquiry isn't double-
            // counted against the Formspree record or the Ads conversion.
            trackGoogleAdsLead();
            trackEvent("generate_lead", { form: "contact", lead_id: contactLeadId });
            showStatus(SUCCESS_MESSAGE, "success");
            form.reset();
            // form.reset() blanks every field back to its HTML default,
            // including the hidden attribution inputs — restore the
            // ORIGINAL landing attribution and hand the next inquiry a
            // fresh lead_id, so a second submission this session is
            // correctly attributed and not mistaken for the first.
            applyAttributionSnapshot("attr", contactAttribution);
            contactLeadId = generateFreshLeadId("attr");
          } else {
            showStatus(ERROR_MESSAGE, "error");
            trackEvent("form_error", { form: "contact", reason: "server_error", status: response.status });
          }
        })
        .catch(function () {
          showStatus(ERROR_MESSAGE, "error");
          trackEvent("form_error", { form: "contact", reason: "network" });
        })
        .finally(function () {
          isSubmittingForm = false;
          setLoading(false);
        });
    });
  }

  // Google Ads Test #2: the paid-search popup that used to live here
  // (shown ~1.5s after load to gclid/utm_source=google traffic) has been
  // removed so all traffic lands on one consistent page with one
  // primary inquiry form — see git history for the prior implementation
  // if it's ever needed again. Its Google Ads conversion firing is now
  // fully covered by the main contact form above.

  /* ------------------------------------------------------------------
     Footer copyright year, generated automatically
     ------------------------------------------------------------------ */
  var yearEl = document.getElementById("copyrightYear");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
