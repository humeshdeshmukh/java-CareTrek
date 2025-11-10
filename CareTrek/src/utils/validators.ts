// Email validation using a simple regex
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Phone number validation (supports international numbers with optional + prefix)
export const validatePhoneNumber = (phone: string): boolean => {
  // Allows: +1234567890, 1234567890, (123) 456-7890, 123-456-7890, etc.
  const re = /^\+?[\d\s-]+\.?[\d\s-]*$/;
  return re.test(phone) && phone.replace(/[^0-9]/g, '').length >= 10;
};
