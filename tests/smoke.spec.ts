import {expect, test} from '@playwright/test'

test('App loads and has title', async ({page}) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Gonzalo Stoll/)
})

test('Desktop navigation works', async ({page, isMobile}) => {
  if (isMobile) return

  const blogLink = page.getByRole('link', {name: 'Blog'})

  await page.goto('/')
  await blogLink.click()
  await expect(page).toHaveURL(/.*blog/)
  await expect(blogLink).toHaveClass('text-primary')
})

test('Mobile navigation works', async ({page, isMobile}) => {
  if (!isMobile) return

  const menuButton = page.getByRole('button', {name: 'Menu'})
  const blogLink = page.getByRole('link', {name: 'Blog'})
  const mobileMenu = page.getByTestId('mobile-menu-nav')

  await expect(mobileMenu).toBeHidden()
  await page.goto('/')
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  await menuButton.click()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  await blogLink.click()
  await expect(page).toHaveURL(/.*blog/)
  await expect(blogLink).toHaveClass('text-primary')
  await expect(blogLink).not.toBeInViewport()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
})
