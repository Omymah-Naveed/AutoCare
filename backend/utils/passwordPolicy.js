const PASSWORD_POLICY_MESSAGE = 'Password must be at least 8 characters and include at least 1 number and 1 special character.'

function isStrongPassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password)
}

module.exports = { isStrongPassword, PASSWORD_POLICY_MESSAGE }
