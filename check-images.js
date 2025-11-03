import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 检查 public/images 目录下的图片文件
const imagesDir = path.join(__dirname, 'public', 'images')

console.log('检查图片文件...')

if (!fs.existsSync(imagesDir)) {
  console.error('❌ public/images 目录不存在')
  console.log('请创建目录: public/images/')
  process.exit(1)
}

const files = fs.readdirSync(imagesDir)
console.log(`📁 public/images 目录中有 ${files.length} 个文件:`)
files.forEach(file => {
  const filePath = path.join(imagesDir, file)
  const stats = fs.statSync(filePath)
  console.log(`  - ${file} (${(stats.size / 1024).toFixed(1)} KB)`)
})

// 检查必要的图片文件
const requiredImages = [
  '222.jpg',
  '50.jpg', '51.webp', '52.jpg', '53.webp', '54.webp', '55.webp', '56.webp', '57.jpg',
  'Banner-1.jpg', 'Banner-2.jpg', 'Banner-3.webp', 'Banner-4.webp',
  '01.jpg', '02.jpg', '03.jpg', '04.webp', '05.jpg', '06.jpg', '07.webp', '08.jpg', '09.jpg', '10.webp',
  '11.jpg', '12.jpg', '13.jpg', '14.webp', '15.jpg', '16.webp', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
  '21.jpg', '22.png', '23.jpg', '24.jpg', '25.jpg', '26.webp', '27.webp', '28.jpg', '29.webp', '30.jpg',
  '31.webp', '32.webp', '33.jpg', '34.jpg', '35.webp', '36.webp', '37.webp', '38.webp', '39.webp', '40.jpg',
  '41.webp', '42.webp', '43.webp', '44.webp', '45.jpg'
]

console.log('\n检查必要图片文件:')
let missingCount = 0
requiredImages.forEach(img => {
  const exists = fs.existsSync(path.join(imagesDir, img))
  if (exists) {
    console.log(`✅ ${img}`)
  } else {
    console.log(`❌ ${img} - 缺失`)
    missingCount++
  }
})

console.log(`\n统计: ${requiredImages.length - missingCount}/${requiredImages.length} 个图片文件存在`)
if (missingCount > 0) {
  console.log(`⚠️  缺失 ${missingCount} 个图片文件`)

  // 提供解决方案
  console.log('\n解决方案:')
  console.log('1. 将图片文件放入 public/images/ 目录')
  console.log('2. 运行下面的命令快速创建占位图片')
  console.log('3. 或使用在线图片服务')
}