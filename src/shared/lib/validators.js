// Input rules shared by the sign-in, registration and password screens.

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

/** 8–64 characters with a lowercase and an uppercase letter, a digit and a symbol (the backend's rule). */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

export const isValidEmail = (value) => EMAIL_REGEX.test(String(value ?? '').trim());

export const isStrongPassword = (value) => PASSWORD_REGEX.test(String(value ?? ''));
