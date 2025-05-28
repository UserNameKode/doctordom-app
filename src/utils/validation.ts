/**
 * Утилиты для валидации форм
 */

/**
 * Валидация email
 * @param email - строка с email для проверки
 * @returns объект с результатом проверки и сообщением об ошибке
 */
export const validateEmail = (email: string): { isValid: boolean; message: string } => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email обязателен' };
  }
  
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Введите корректный email' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Валидация пароля
 * @param password - строка с паролем для проверки
 * @returns объект с результатом проверки и сообщением об ошибке
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password) {
    return { isValid: false, message: 'Пароль обязателен' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Пароль должен содержать не менее 6 символов' };
  }
  
  // Можно добавить дополнительные проверки, например:
  // const hasUppercase = /[A-Z]/.test(password);
  // const hasNumber = /\d/.test(password);
  // if (!hasUppercase || !hasNumber) {
  //   return { isValid: false, message: 'Пароль должен содержать хотя бы одну заглавную букву и одну цифру' };
  // }
  
  return { isValid: true, message: '' };
};

/**
 * Валидация имени пользователя
 * @param name - строка с именем для проверки
 * @returns объект с результатом проверки и сообщением об ошибке
 */
export const validateName = (name: string): { isValid: boolean; message: string } => {
  if (!name.trim()) {
    return { isValid: false, message: 'Имя обязательно' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Имя должно содержать не менее 2 символов' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Валидация подтверждения пароля
 * @param password - оригинальный пароль
 * @param confirmPassword - строка с подтверждением пароля
 * @returns объект с результатом проверки и сообщением об ошибке
 */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): { isValid: boolean; message: string } => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Подтверждение пароля обязательно' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Пароли не совпадают' };
  }
  
  return { isValid: true, message: '' };
}; 