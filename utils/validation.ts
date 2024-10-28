export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Example rule: Password must be at least 8 characters long
  return password.length >= 8;
};

export const validateUsername = (username: string): boolean => {
  // Example rule: Username must be alphanumeric and between 3 to 16 characters
  const usernameRegex = /^[a-zA-Z0-9]{3,16}$/;
  return usernameRegex.test(username);
};
