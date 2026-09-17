/**
 * E2E — Login screen (LG series)
 */

const { test, expect } = require('@playwright/test')
const { CREDENTIALS } = require('./helpers')

test.describe('LG — Login', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('LG-01: valid login navigates to dashboard', async ({ page }) => {
    await page.locator('#login-email').fill(CREDENTIALS.email)
    await page.locator('#login-password').fill(CREDENTIALS.password)
    await page.locator('#login-submit-btn').click()
    await page.waitForURL('**/acharya', { timeout: 15000 })
    expect(page.url()).toContain('/acharya')
  })

  test('LG-03: wrong password shows error message', async ({ page }) => {
    await page.locator('#login-email').fill(CREDENTIALS.email)
    await page.locator('#login-password').fill('definitelywrongpass999')
    await page.locator('#login-submit-btn').click()
    await expect(page.getByText(/unable to reach|invalid email|incorrect/i)).toBeVisible({ timeout: 10000 })
  })

  test('LG-07: password toggle shows and hides password', async ({ page }) => {
    const pwInput = page.locator('#login-password')
    await expect(pwInput).toHaveAttribute('type', 'password')
    // Wait for SVG/Button toggle
    await page.locator('button[aria-label="Show password"]').click()
    await expect(pwInput).toHaveAttribute('type', 'text')
    await page.locator('button[aria-label="Hide password"]').click()
    await expect(pwInput).toHaveAttribute('type', 'password')
  })

  test('LG-10: demo credentials panel is visible', async ({ page }) => {
    await expect(page.getByText(/sandipani\.acharya@vidhyabharathi\.edu/i)).toBeVisible()
    await expect(page.getByText(/password123/i)).toBeVisible()
  })

  test('LG-05: empty form — email focused on submit', async ({ page }) => {
    await page.locator('#login-submit-btn').click()
    const emailInput = page.locator('#login-email')
    await expect(emailInput).toBeFocused()
  })

})