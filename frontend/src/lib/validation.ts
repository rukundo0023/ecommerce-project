const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => {
  const normalizedEmail = email.trim();
  return normalizedEmail.length <= 254 && EMAIL_PATTERN.test(normalizedEmail);
};

export const isValidRwandaPhoneNumber = (phone: string): boolean =>
  /^(?:\+?2507\d{8}|07\d{8})$/.test(phone.replace(/[\s()-]/g, ""));

export const syncPasswordConfirmation = (form: HTMLFormElement | null): void => {
  const password = form?.elements.namedItem("password");
  const confirmation = form?.elements.namedItem("confirm-password");
  if (
    password instanceof HTMLInputElement &&
    confirmation instanceof HTMLInputElement
  ) {
    confirmation.setCustomValidity(
      confirmation.value === password.value ? "" : "Passwords do not match."
    );
  }
};
