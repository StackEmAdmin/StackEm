import c from '../../util/constants';

function verifyEmail(email) {
  // Allowed emails will be in the form any@any.any where "any" is at least 1 character
  // User must confirm email after all
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailRegex.test(email);
}

function verifyEmailErr(email) {
  if (hasMaxLength(email, 0)) {
    return 'Enter an email';
  }
  return 'Enter a valid email';
}

function hasMinLength(str, len) {
  return str.length >= len;
}

function hasMaxLength(str, len) {
  return str.length <= len;
}

function verifyUsernameSymbols(str) {
  return /^[a-zA-Z0-9_-]*$/.test(str);
}

function verifyUsername(username) {
  return (
    hasMinLength(username, c.USERNAME_MIN_LENGTH) &&
    hasMaxLength(username, c.USERNAME_MAX_LENGTH) &&
    verifyUsernameSymbols(username)
  );
}

function verifyUsernameErr(username) {
  if (!hasMinLength(username, c.USERNAME_MIN_LENGTH)) {
    return `Username must be at least ${c.USERNAME_MIN_LENGTH} characters`;
  }
  if (!hasMaxLength(username, c.USERNAME_MAX_LENGTH)) {
    return `Username must be at most ${c.USERNAME_MAX_LENGTH} characters`;
  }
  if (!verifyUsernameSymbols(username)) {
    return 'Username must only contain alphanumeric characters';
  }
  return '';
}

function hasLowercase(str) {
  return /[a-z]/.test(str);
}

function hasUppercase(str) {
  return /[A-Z]/.test(str);
}

function hasDigit(str) {
  return /\d/.test(str);
}

function verifyPassword(password) {
  return (
    hasMinLength(password, c.PASSWORD_MIN_LENGTH) &&
    hasMaxLength(password, c.PASSWORD_MAX_LENGTH) &&
    hasLowercase(password) &&
    hasUppercase(password) &&
    hasDigit(password)
  );
}

function verifyPasswordErr(password) {
  if (!hasMinLength(password, c.PASSWORD_MIN_LENGTH)) {
    return `Password must be at least ${c.PASSWORD_MIN_LENGTH} characters long`;
  }
  if (!hasMaxLength(password, c.PASSWORD_MAX_LENGTH)) {
    return `Password must be at most ${c.PASSWORD_MAX_LENGTH} characters long`;
  }
  if (!hasLowercase(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!hasUppercase(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!hasDigit(password)) {
    return 'Password must contain at least one digit';
  }
  return '';
}

function verifyConfirmPassword(password1, password2) {
  return password1 === password2;
}

function verifyConfirmPasswordErr() {
  return 'Passwords must match';
}

function verifyInviteCode(code) {
  return code === import.meta.env.VITE_INVITE_CODE;
}

function verifyInviteCodeErr() {
  return 'Invalid invite code';
}

export default {
  email: verifyEmail,
  emailErr: verifyEmailErr,
  username: verifyUsername,
  usernameErr: verifyUsernameErr,
  password: verifyPassword,
  passwordErr: verifyPasswordErr,
  confirmPassword: verifyConfirmPassword,
  confirmPasswordErr: verifyConfirmPasswordErr,
  inviteCode: verifyInviteCode,
  inviteCodeErr: verifyInviteCodeErr,
};
