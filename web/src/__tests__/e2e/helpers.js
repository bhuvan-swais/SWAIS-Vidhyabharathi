/**
 * Shared E2E helpers — login, navigation shortcuts.
 */

const CREDENTIALS = {
  email: 'sandipani.acharya@vidhyabharathi.edu',
  password: 'password123',
}

/**
 * Log in and wait for the Acharya dashboard to load.
 */
async function login(page) {
  await page.goto('/')
  await page.locator('#login-email').fill(CREDENTIALS.email)
  await page.locator('#login-password').fill(CREDENTIALS.password)
  await page.locator('#login-submit-btn').click()
  await page.waitForURL('**/acharya', { timeout: 15000 })
}

module.exports = { login, CREDENTIALS }