
(() => {
  "use strict";

  const C = window.APP_CONFIG;
  if (!C) { console.error("config.js est introuvable ou n'est pas chargé avant script.js"); return; }

  const form = document.getElementById("signup-form");
  const alertBox = document.getElementById("form-alert");
  const submitBtn = document.getElementById("submit-btn");
  const successBox = document.getElementById("success");

  /* ---------- Références aux champs (via data-key) ---------- */
  const els = {};
  form.querySelectorAll("[data-key]").forEach((el) => { els[el.dataset.key] = el; });

  const fieldBox = (key) => form.querySelector(`[data-field="${key}"]`);
  const errorEl = (key) => fieldBox(key).querySelector(".error");

  const NAME_RE = /^[\p{L}][\p{L}\s'’.-]*$/u;

  /* ==========================================================================
     Validation
     ========================================================================== */
  const validators = {
    nom: () => validateName(els.nom.value, "ton nom"),
    prenom: () => validateName(els.prenom.value, "ton prénom"),

    telephone: () => {
      const raw = els.telephone.value.trim();
      if (!raw) return "Saisis ton numéro de téléphone.";
      if (!C.rules.phonePattern.test(normalizePhone(raw))) return "Numéro invalide. Vérifie les chiffres saisis.";
      return "";
    },

    photo: () => {
      const file = els.photo.files[0];
      if (!file) return C.rules.photoRequired ? "Ajoute une photo de profil." : "";
      if (!C.rules.photoTypes.includes(file.type)) return "Format non accepté. Utilise une image JPG, PNG ou WebP.";
      if (file.size > C.rules.photoMaxMB * 1024 * 1024) return `La photo est trop lourde (${C.rules.photoMaxMB} Mo maximum).`;
      return "";
    },

    password: () => {
      const v = els.password.value;
      if (!v) return "Choisis un mot de passe.";
      if (v.length < C.rules.passwordMin) return `Le mot de passe doit contenir au moins ${C.rules.passwordMin} caractères.`;
      if (v.length > C.rules.passwordMax) return `Le mot de passe est trop long (${C.rules.passwordMax} caractères maximum).`;
      return "";
    },

    passwordConfirm: () => {
      const v = els.passwordConfirm.value;
      if (!v) return "Confirme ton mot de passe.";
      if (v !== els.password.value) return "Les deux mots de passe ne sont pas identiques.";
      return "";
    }
  };

  function validateName(value, label) {
    const v = value.trim();
    if (!v) return `Saisis ${label}.`;
    if (v.length < C.rules.nameMin) return `Minimum ${C.rules.nameMin} caractères.`;
    if (v.length > C.rules.nameMax) return `Maximum ${C.rules.nameMax} caractères.`;
    if (!NAME_RE.test(v)) return "Utilise uniquement des lettres, espaces, apostrophes ou tirets.";
    return "";
  }

  function normalizePhone(value) {
    return value.replace(/[\s.\-()]/g, "");
  }

  function setError(key, message) {
    const box = fieldBox(key);
    const input = els[key];
    errorEl(key).textContent = message || "";
    box.classList.toggle("is-invalid", Boolean(message));
    if (input) {
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  }

  function validateField(key) {
    const message = validators[key]();
    setError(key, message);
    return !message;
  }

  function validateAll() {
    let firstInvalid = null;
    Object.keys(validators).forEach((key) => {
      if (!validateField(key) && !firstInvalid) firstInvalid = els[key];
    });
    return firstInvalid;
  }

  /* Validation en direct : au blur, puis à chaque frappe une fois en erreur */
  Object.keys(validators).forEach((key) => {
    const input = els[key];
    if (key === "photo") return;
    input.addEventListener("blur", () => { if (input.value !== "") validateField(key); });
    input.addEventListener("input", () => {
      if (fieldBox(key).classList.contains("is-invalid")) validateField(key);
      if (key === "password" && els.passwordConfirm.value) validateField("passwordConfirm");
    });
  });

  /* ==========================================================================
     Photo : aperçu, glisser-déposer, retrait
     ========================================================================== */
  const dropzone = document.getElementById("dropzone");
  const photoImg = document.getElementById("photo-img");
  const photoIcon = dropzone.querySelector(".photo__icon");
  const photoTitle = document.getElementById("photo-title");
  const photoHint = document.getElementById("photo-hint");
  const photoRemove = document.getElementById("photo-remove");
  const defaultTitle = photoTitle.textContent;
  let previewUrl = null;

  photoHint.textContent = `JPG, PNG ou WebP · ${C.rules.photoMaxMB} Mo maximum`;
  els.photo.accept = C.rules.photoTypes.join(",");

  function renderPhoto() {
    const file = els.photo.files[0];
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }

    if (file && C.rules.photoTypes.includes(file.type)) {
      previewUrl = URL.createObjectURL(file);
      photoImg.src = previewUrl;
      photoImg.hidden = false;
      photoIcon.style.display = "none";
    } else {
      photoImg.removeAttribute("src");
      photoImg.hidden = true;
      photoIcon.style.display = "";
    }

    photoTitle.textContent = file ? file.name : defaultTitle;
    photoRemove.hidden = !file;
  }

  els.photo.addEventListener("change", () => { renderPhoto(); validateField("photo"); });

  photoRemove.addEventListener("click", () => {
    els.photo.value = "";
    renderPhoto();
    setError("photo", "");
    els.photo.focus();
  });

  ["dragenter", "dragover"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("is-drag"); })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("is-drag"); })
  );
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer && e.dataTransfer.files[0];
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    els.photo.files = dt.files;
    renderPhoto();
    validateField("photo");
  });

  /* ==========================================================================
     Mot de passe : afficher/masquer + indicateur de force
     ========================================================================== */
  form.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.toggle);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", String(show));
      btn.setAttribute("aria-label", show ? "Masquer le mot de passe" : "Afficher le mot de passe");
      btn.querySelector(".eye__on").hidden = show;
      btn.querySelector(".eye__off").hidden = !show;
    });
  });

  const strengthBox = document.getElementById("password-strength");
  const strengthLabel = strengthBox.querySelector(".strength__label");
  const strengthText = { 1: "Faible", 2: "Moyen", 3: "Fort" };

  els.password.addEventListener("input", () => {
    const v = els.password.value;
    if (!v) { strengthBox.hidden = true; return; }

    let score = 0;
    if (v.length >= C.rules.passwordMin) score++;
    if (v.length >= 12 || (/[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v))) score++;
    if (v.length >= 10 && /[A-Z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
    const level = Math.max(1, score);

    strengthBox.hidden = false;
    strengthBox.dataset.level = String(level);
    strengthLabel.textContent = strengthText[level];
  });

  /* ==========================================================================
     Construction de la requête (selon config.js)
     ========================================================================== */
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }

  async function buildRequest() {
    const f = C.fields;
    const file = els.photo.files[0];
    const values = {
      [f.nom]: els.nom.value.trim(),
      [f.prenom]: els.prenom.value.trim(),
      [f.telephone]: normalizePhone(els.telephone.value.trim()),
      [f.password]: els.password.value
    };
    if (C.sendPasswordConfirm) values[f.passwordConfirm] = els.passwordConfirm.value;

    const headers = Object.assign({}, C.api.headers);
    let body;

    if (C.api.sendAs === "json") {
      if (file) values[f.photo] = await fileToDataURL(file);
      body = JSON.stringify(values);
      headers["Content-Type"] = "application/json";
    } else {
      body = new FormData();
      Object.entries(values).forEach(([k, v]) => body.append(k, v));
      if (file) body.append(f.photo, file, file.name);
      // Pas de Content-Type : le navigateur ajoute le boundary multipart
    }
    return { body, headers };
  }

  /* ==========================================================================
     Envoi + gestion des réponses
     ========================================================================== */
  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.dataset.type = type || "error";
    alertBox.hidden = false;
  }
  function hideAlert() { alertBox.hidden = true; alertBox.textContent = ""; }

  function setLoading(loading) {
    submitBtn.classList.toggle("is-loading", loading);
    submitBtn.disabled = loading;
    submitBtn.setAttribute("aria-busy", String(loading));
  }

  // Associe un nom de champ backend à la clé interne correspondante
  function keyFromServerName(serverName) {
    return Object.keys(C.fields).find((k) => C.fields[k] === serverName) || (els[serverName] ? serverName : null);
  }

  function applyServerErrors(errors) {
    let first = null;
    Object.entries(errors).forEach(([name, msg]) => {
      const key = keyFromServerName(name);
      const text = Array.isArray(msg) ? msg[0] : String(msg);
      if (key && fieldBox(key)) {
        setError(key, text);
        if (!first) first = els[key];
      }
    });
    if (first) first.focus();
    return Boolean(first);
  }

  function showSuccess(redirectUrl) {
    document.getElementById("success-title").textContent = C.messages.successTitle;
    document.getElementById("success-text").textContent = C.messages.successText;
    form.hidden = true;
    document.querySelector(".head").hidden = true;
    successBox.hidden = false;
    form.dispatchEvent(new CustomEvent("signup:success", { bubbles: true }));

    const target = redirectUrl || C.redirectOnSuccess;
    if (target) setTimeout(() => { window.location.href = target; }, C.redirectDelayMs || 0);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const firstInvalid = validateAll();
    if (firstInvalid) { firstInvalid.focus(); return; }

    setLoading(true);
    try {
      const { body, headers } = await buildRequest();

      /* --- Mode démo : aucun endpoint configuré --- */
      if (!C.api.endpoint) {
        await new Promise((r) => setTimeout(r, 900));
        console.info("[Mode démo] Requête qui serait envoyée :", {
          method: C.api.method,
          sendAs: C.api.sendAs,
          body: body instanceof FormData ? Object.fromEntries(body.entries()) : JSON.parse(body)
        });
        showSuccess();
        return;
      }

      /* --- Envoi réel --- */
      const res = await fetch(C.api.endpoint, {
        method: C.api.method,
        headers,
        body,
        credentials: C.api.credentials
      });

      let data = null;
      try { data = await res.json(); } catch (_) { /* réponse sans JSON */ }

      if (res.ok) {
        showSuccess(data && data.redirect);
        return;
      }

      const hasFieldErrors = data && data.errors && typeof data.errors === "object" && applyServerErrors(data.errors);
      if (data && data.message) showAlert(data.message);
      else if (!hasFieldErrors) showAlert(C.messages.serverError);

    } catch (err) {
      console.error(err);
      showAlert(C.messages.networkError);
    } finally {
      setLoading(false);
    }
  });
})();
