// Clean screenshots of the real app (no captions/cursor) for the thumbnail and the portfolio.
// Usage: node screenshots.cjs <out_dir> [appUrl]
const path = require('path')
const fs = require('fs')
const { chromium } = require('playwright')

const OUT = path.resolve(process.argv[2] || 'shots')
const APP = process.argv[3] || 'http://localhost:4173'
const STAMP = path.join(__dirname, 'assets', 'demo-stamp.png')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.2 })
  await page.goto(APP + '/templates'); await sleep(2500)
  await page.getByText('Окурмэн Kids', { exact: true }).first().click()
  await page.waitForURL(/\/editor\//); await sleep(2500)
  // realistic content: topic, signature, stamp
  await page.getByLabel('Тема', { exact: true }).fill('Веб-разработка'); await sleep(400)
  await page.getByRole('button', { name: 'Логотип, печать и подпись' }).scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: 'Расписаться на экране' }).click(); await sleep(500)
  const b = await page.getByLabel('Поле для подписи').boundingBox()
  await page.mouse.move(b.x + b.width * 0.18, b.y + b.height * 0.55); await page.mouse.down()
  for (let i = 0; i <= 60; i++) {
    const k = i / 60
    await page.mouse.move(b.x + b.width * (0.18 + 0.62 * k), b.y + b.height * (0.55 - 0.18 * Math.sin(k * Math.PI * 5) * (1 - k * 0.4)))
  }
  await page.mouse.up()
  await page.getByRole('button', { name: 'Сохранить подпись' }).click(); await sleep(600)
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /Фон бумаги удаляется автоматически/ }).click()
  await (await chooser).setFiles(STAMP); await sleep(1500)
  await page.mouse.click(1290, 150); await sleep(300)
  await page.locator('.scroll-thin').first().evaluate((e) => (e.scrollTop = 0)); await sleep(300)
  await page.screenshot({ path: path.join(OUT, 'editor.png') })
  // heading selected + layers tab
  await page.mouse.click(657, 381); await sleep(300)
  await page.getByRole('tab', { name: /Слои/ }).click(); await sleep(500)
  await page.screenshot({ path: path.join(OUT, 'design.png') })
  // export dialog
  await page.mouse.click(1290, 150); await sleep(200)
  await page.getByRole('button', { name: 'Скачать', exact: true }).click(); await sleep(800)
  await page.screenshot({ path: path.join(OUT, 'export.png') })
  await browser.close()
  console.log('screenshots in', OUT)
})().catch((e) => { console.error(e); process.exit(1) })
