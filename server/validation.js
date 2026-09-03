// Input validation & sanitization for public form submissions.
//
// Every value coming from a request body is treated as untrusted:
// wrong type, wrong shape, or deliberately malicious. Sanitize first,
// validate second, and never trust the shape of `req.body` itself.

const MAX_REASONABLE_INPUT_LENGTH = 5000;

function stripControlCharacters(input) {
  let result = "";

  for (const char of input) {
    const code = char.charCodeAt(0);
    if (code >= 0x20 && code !== 0x7f) {
      result += char;
    } else {
      result += " ";
    }
  }

  return result;
}

/**
 * Strips HTML tags and control characters, collapses whitespace, and
 * hard-caps length — in a single pass rather than several sequential
 * regex passes, since this runs on every field of every request.
 *
 * `maxLen` is also enforced as a pre-slice *before* the regex pass so a
 * caller can't force this function to run its regex against an
 * arbitrarily huge string (the express.json() body-size limit is the
 * first line of defense here; this is the second).
 */
export function sanitize(input, maxLen = 500) {
  if (typeof input !== "string" || input.length === 0) return "";

  const cappedLength = Math.min(maxLen, MAX_REASONABLE_INPUT_LENGTH);
  const truncated = input.slice(0, cappedLength * 4); // generous pre-slice
  const withoutControlChars = stripControlCharacters(truncated);

  return withoutControlChars
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, cappedLength);
}

export function validateEmail(email) {
  if (typeof email !== "string" || !email) return false;
  const clean = email.trim();
  return clean.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
}

export function validatePhone(phone) {
  if (typeof phone !== "string" || !phone) return false;
  return /^\+?\d[\d\s-]{8,15}$/.test(phone.trim());
}

export function validateGSTIN(gstin) {
  if (typeof gstin !== "string" || !gstin) return false;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gstin.trim().toUpperCase(),
  );
}

/**
 * Guards against payloads that aren't plain objects — arrays, strings,
 * numbers, null, or objects crafted to carry dangerous keys like
 * `__proto__` / `constructor` / `prototype` (prototype-pollution
 * attempts). Every validator below is called with a payload that has
 * already passed this check.
 */
export function isSafePlainObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const dangerousKeys = ["__proto__", "constructor", "prototype"];
  return !Object.keys(value).some((key) => dangerousKeys.includes(key));
}

export function validateContactPayload(payload) {
  if (!isSafePlainObject(payload)) {
    return {
      isValid: false,
      errors: ["Request body must be a JSON object."],
      data: null,
    };
  }

  const errors = [];
  const name = sanitize(payload.name, 100);
  const email = sanitize(payload.email, 150);
  const phone = sanitize(payload.phone, 20);
  const message = sanitize(payload.message, 1000);
  const consentGiven = payload.consent === true;

  if (!name) errors.push("Name is required.");
  if (!email || !validateEmail(email)) {
    errors.push("Valid email address is required.");
  }
  if (phone && !validatePhone(phone)) {
    errors.push("Invalid phone number format.");
  }
  if (!message) errors.push("Message body is required.");
  if (!consentGiven) {
    errors.push("Please confirm you agree to the Privacy Policy.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { name, email, phone, message, consentGiven },
  };
}

export function validateQuotePayload(payload) {
  if (!isSafePlainObject(payload)) {
    return {
      isValid: false,
      errors: ["Request body must be a JSON object."],
      data: null,
    };
  }

  const errors = [];
  const company = sanitize(payload.company, 150);
  const contactName = sanitize(payload.contactName, 100);
  const email = sanitize(payload.email, 150);
  const phone = sanitize(payload.phone, 20);
  const requirements = sanitize(payload.requirements, 2000);
  const gstin = sanitize(payload.gstin, 20);
  const consentGiven = payload.consent === true;

  if (!company) errors.push("Company name is required.");
  if (!contactName) errors.push("Contact person name is required.");
  if (!email || !validateEmail(email)) {
    errors.push("Valid email is required.");
  }
  if (!phone || !validatePhone(phone)) {
    errors.push("Valid phone number is required.");
  }
  if (!requirements) errors.push("Please describe your requirement.");
  if (gstin && !validateGSTIN(gstin)) errors.push("Invalid GSTIN format.");
  if (!consentGiven) {
    errors.push("Please confirm you agree to the Privacy Policy.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { company, contactName, email, phone, requirements, gstin, consentGiven },
  };
}

// Deliberately permissive on special characters (unlike names/messages,
// passwords are never rendered back to a page or stored unsanitized — they
// go straight into bcrypt), but bounded in length to avoid excessive-length
// hashing-cost abuse.
export function validatePassword(password) {
  if (typeof password !== "string") return false;
  if (password.length < 8 || password.length > 200) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

export function validateRegisterPayload(payload) {
  if (!isSafePlainObject(payload)) {
    return {
      isValid: false,
      errors: ["Request body must be a JSON object."],
      data: null,
    };
  }

  const errors = [];
  const name = sanitize(payload.name, 100);
  const email = sanitize(payload.email, 150).toLowerCase();
  const password = typeof payload.password === "string" ? payload.password : "";
  const termsAccepted = payload.termsAccepted === true;
  const age = Number(payload.age);
  const phone = payload.phone ? sanitize(payload.phone, 20) : null;

  if (!name) errors.push("Name is required.");
  if (!email || !validateEmail(email)) {
    errors.push("A valid email address is required.");
  }
  if (!validatePassword(password)) {
    errors.push(
      "Password must be at least 8 characters and include a letter and a number.",
    );
  }
  if (!Number.isInteger(age) || age < 18 || age > 120) {
    errors.push("You must be 18 or older to register (age 18–120).");
  }
  if (phone && !validatePhone(phone)) {
    errors.push("Invalid phone number format.");
  }
  if (!termsAccepted) {
    errors.push("Please accept the Terms of Service and Privacy Policy.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { name, email, password, termsAccepted, age, phone },
  };
}

export function validateLoginPayload(payload) {
  if (!isSafePlainObject(payload)) {
    return {
      isValid: false,
      errors: ["Request body must be a JSON object."],
      data: null,
    };
  }

  const errors = [];
  const email = sanitize(payload.email, 150).toLowerCase();
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!email || !validateEmail(email)) errors.push("Invalid email or password.");
  if (!password) errors.push("Invalid email or password.");

  return {
    isValid: errors.length === 0,
    errors: errors.slice(0, 1), // never reveal which field was the problem
    data: { email, password },
  };
}

export function validateForgotPasswordPayload(payload) {
  if (!isSafePlainObject(payload)) {
    return {
      isValid: false,
      errors: ["Request body must be a JSON object."],
      data: null,
    };
  }

  const email = sanitize(payload.email, 150).toLowerCase();
  if (!email || !validateEmail(email)) {
    return {
      isValid: false,
      errors: ["A valid email address is required."],
      data: null,
    };
  }

  return { isValid: true, errors: [], data: { email } };
}

export function validateResetPasswordPayload(payload) {
  if (!isSafePlainObject(payload)) {
    return {
      isValid: false,
      errors: ["Request body must be a JSON object."],
      data: null,
    };
  }

  const errors = [];
  const token =
    typeof payload.token === "string" ? payload.token.trim() : "";
  const password =
    typeof payload.password === "string" ? payload.password : "";

  if (!token) errors.push("Reset link is invalid or missing.");
  if (!validatePassword(password)) {
    errors.push(
      "Password must be at least 8 characters and include a letter and a number.",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { token, password },
  };
}

// Product identifiers come from the frontend's static catalog and are only
// ever slug-shaped strings — validate the shape rather than trusting
// arbitrary free text into cart rows.
export function validateSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9-]{1,80}$/.test(slug);
}

export function validateQuantity(qty) {
  const n = Number(qty);
  return Number.isInteger(n) && n >= 1 && n <= 999;
}

export function validateCartItemPayload(payload) {
  if (!isSafePlainObject(payload)) {
    return {
      isValid: false,
      errors: ["Request body must be a JSON object."],
      data: null,
    };
  }

  const errors = [];
  const slug = sanitize(payload.slug, 80).toLowerCase();
  const title = sanitize(payload.title, 150);
  const brand = payload.brand ? sanitize(payload.brand, 60) : null;
  const quantity = payload.quantity === undefined ? 1 : Number(payload.quantity);

  if (!validateSlug(slug)) errors.push("Invalid product identifier.");
  if (!title) errors.push("Product title is required.");
  if (!validateQuantity(quantity)) {
    errors.push("Quantity must be a whole number between 1 and 999.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { slug, title, brand, quantity },
  };
}

const VALID_DIVISIONS = ["wires", "switchgear"];
const VALID_ROLES = ["customer", "staff", "admin"];

export function validateProductPayload(payload, { partial = false } = {}) {
  if (!isSafePlainObject(payload)) {
    return {
      isValid: false,
      errors: ["Request body must be a JSON object."],
      data: null,
    };
  }

  const errors = [];
  const data = {};

  const has = (field) => Object.prototype.hasOwnProperty.call(payload, field);

  if (!partial || has("slug")) {
    data.slug = sanitize(payload.slug, 80).toLowerCase();
    if (!validateSlug(data.slug)) errors.push("Invalid product slug.");
  }
  if (!partial || has("title")) {
    data.title = sanitize(payload.title, 150);
    if (!data.title) errors.push("Title is required.");
  }
  if (!partial || has("division")) {
    data.division = sanitize(payload.division, 20).toLowerCase();
    if (!VALID_DIVISIONS.includes(data.division)) {
      errors.push(`Division must be one of: ${VALID_DIVISIONS.join(", ")}.`);
    }
  }
  if (!partial || has("category")) {
    data.category = payload.category ? sanitize(payload.category, 60) : null;
  }
  if (!partial || has("group")) {
    data.group = payload.group ? sanitize(payload.group, 80) : null;
  }
  if (!partial || has("brands")) {
    data.brands = Array.isArray(payload.brands)
      ? payload.brands.map((b) => sanitize(String(b), 60)).filter(Boolean)
      : [];
  }
  if (!partial || has("specs")) {
    data.specs = payload.specs ? sanitize(payload.specs, 200) : null;
  }
  if (!partial || has("active")) {
    data.active = payload.active !== false;
  }

  return { isValid: errors.length === 0, errors, data };
}

export function validateRolePayload(payload) {
  if (!isSafePlainObject(payload)) {
    return {
      isValid: false,
      errors: ["Request body must be a JSON object."],
      data: null,
    };
  }
  const role = sanitize(payload.role, 20).toLowerCase();
  if (!VALID_ROLES.includes(role)) {
    return {
      isValid: false,
      errors: [`Role must be one of: ${VALID_ROLES.join(", ")}.`],
      data: null,
    };
  }
  return { isValid: true, errors: [], data: { role } };
}
