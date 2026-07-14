import { readdirSync } from 'node:fs'
import { join, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dishesDir = join(__dirname, '../src/assets/dishes')

const files = readdirSync(dishesDir).filter((f) => f.endsWith('.png'))

for (const file of files) {
  const inputPath = join(dishesDir, file)
  const outputPath = join(dishesDir, `${basename(file, extname(file))}.webp`)

  await sharp(inputPath)
    .resize(480, 480, { fit: 'cover' })
    .webp({ quality: 76 })
    .toFile(outputPath)

  console.log(`Optimized ${file} -> ${basename(outputPath)}`)
}
