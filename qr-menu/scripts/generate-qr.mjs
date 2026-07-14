import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const url = process.argv[2] || 'https://newramsai.menu.kaana.in'

const { default: QRCode } = await import('qrcode')

const outDir = join(__dirname, '../public')
mkdirSync(outDir, { recursive: true })

const pngPath = join(outDir, 'qr-menu.png')
const svgPath = join(outDir, 'qr-menu.svg')

await QRCode.toFile(pngPath, url, {
  type: 'png',
  width: 1024,
  margin: 2,
  color: { dark: '#111827', light: '#FFFFFF' },
})

writeFileSync(svgPath, await QRCode.toString(url, { type: 'svg', margin: 2 }))

console.log(`QR code PNG: ${pngPath}`)
console.log(`QR code SVG: ${svgPath}`)
console.log(`URL: ${url}`)
