import { expect, test } from "@playwright/test"

// guest to paid order, without a stripe key the success page settles the payment itself
test("a guest fills a cart, signs in, pays and sees the order", async ({ page }) => {
  await page.goto("/p/ryzen-5-7600")
  await page.getByRole("button", { name: "Add to cart", exact: true }).first().click()
  await expect(page.locator("header span.bg-hot")).toHaveText("1")

  await page.goto("/cart")
  await page.fill("input[placeholder='Coupon code']", "BEMVINDO10")
  await page.click("button:has-text('Apply')")
  await expect(page.locator("p:has-text('BEMVINDO10')")).toBeVisible()

  await page.click("a:has-text('Go to checkout')")
  await expect(page).toHaveURL(/\/login/)
  await page.getByRole("button", { name: "Enter as customer" }).click()
  await expect(page).toHaveURL(/\/checkout/)

  await page.fill("#line1", "Rua Harmonia, 123")
  await page.fill("#city", "São Paulo")
  await page.fill("#zip", "05435-000")
  await page.click("form button[type=submit]")
  await expect(page).toHaveURL(/\/checkout\/success/)
  await expect(page.getByText("Payment confirmed")).toBeVisible({ timeout: 20_000 })
  await expect(page.locator("header span.bg-hot")).toHaveCount(0)

  await page.click("a:has-text('View order')")
  await expect(page.locator("ol li")).toHaveCount(4)
})

test("the manager moves an order forward", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("button", { name: "Enter as manager" }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto("/manage/orders?status=paid")
  await expect(page.locator("tbody tr").first()).toBeVisible()
  await page.click("tbody tr >> nth=0")
  await page.getByRole("button", { name: /Move to/ }).click()
  await expect(page.getByText("Status updated")).toBeVisible()
  await expect(page.locator("h1.font-mono").locator("xpath=following-sibling::*[1]")).toHaveText("Packing")
})
