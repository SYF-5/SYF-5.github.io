import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createCanvas } from 'canvas'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 确保 images 目录存在
const imagesDir = path.join(__dirname, 'public', 'images')
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
  console.log('创建目录: public/images/')
}

// 需要生成的图片列表
const imagesToGenerate = [
  'cx.svg',
  '50.jpg', '51.webp', '52.jpg', '53.webp', '54.webp', '55.webp', '56.webp', '57.jpg',
  'Banner-1.jpg', 'Banner-2.jpg', 'Banner-3.webp', 'Banner-4.webp'
]

console.log('开始生成占位图片...')

// 生成简单的占位图片
function generatePlaceholderImage(filename, width = 300, height = 300) {
  // 由于 canvas 在 Node.js 中需要安装，我们改用创建简单的文本文件作为占位
  // 在实际项目中，你可以安装 canvas: npm install canvas
  const placeholderText = `
<!-- 占位图片: ${filename} -->
<div style="width:${width}px;height:${height}px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#666;font-family:Arial;">
  ${filename}
</div>
`

  const filePath = path.join(imagesDir, filename)

  // 对于 jpg/webp 文件，我们创建一个简单的文本说明
  if (filename.endsWith('.jpg') || filename.endsWith('.webp') || filename.endsWith('.png')) {
    // 创建一个简单的文本文件说明
    const infoFile = filename + '.txt'
    fs.writeFileSync(path.join(imagesDir, infoFile), `占位图片: ${filename}\n请替换为实际图片文件`)
    console.log(`✅ 创建占位说明: ${infoFile}`)

    // 如果是 cx.svg，创建一个简单的 SVG 作为占位图
  if (filename === 'cx.svg') {
      const svgContent = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#27BA9B"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="20">
    占位图片: ${filename}
  </text>
</svg>
      `
      fs.writeFileSync(path.join(imagesDir, '222.svg'), svgContent)
      console.log('✅ 创建 SVG 占位图: 222.svg')
    }
  }
}

// 生成所有占位图片
imagesToGenerate.forEach(image => {
  generatePlaceholderImage(image)
})

console.log('\n🎉 占位图片生成完成!')
console.log('请将实际的图片文件放入 public/images/ 目录替换这些占位文件')