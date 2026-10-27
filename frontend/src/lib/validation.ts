const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => {
  const normalizedEmail = email.trim();
  return normalizedEmail.length <= 254 && EMAIL_PATTERN.test(normalizedEmail);
};

export const isValidRwandaPhoneNumber = (phone: string): boolean =>
  /^(?:\+?2507\d{8}|07\d{8})$/.test(phone.replace(/[\s()-]/g, ""));
