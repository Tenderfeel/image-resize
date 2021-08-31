import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs';
import del from 'del';
import chalk from 'chalk'
import ora from 'ora'

// 処理前のディレクトリ
const IMAGE_DIRECTORY_PATH = './images/'

// 処理後のディレクトリ
const DIST_DIRECTORY_PATH = './dist/'

// リサイズ設定
const RESIZE_OPTION = {
  fit: 'cover',
  width: 600,
  height: 600,
  position: sharp.strategy.attention,
}

// 処理後の画像保存形式
const DIST_FORMAT = 'jpg'

// 処理後にimagesの画像を削除する
const isDeleteSrcImg = false


const spinner = ora(`Start resize images`).start(
  `Read ${chalk.bold(IMAGE_DIRECTORY_PATH)} directory`
)

async function defaultTask(cb) {
  const files = await readdir(IMAGE_DIRECTORY_PATH, { withFileTypes: true })
  const filterFiles = files.filter((file) => file.isFile() && !file.name.includes('.DS_Store'))

  if (!existsSync(DIST_DIRECTORY_PATH)) {
    await mkdir(DIST_DIRECTORY_PATH)
  }

  spinner
    .succeed(`Read ${chalk.bold(files.length)} image files.`)
    .start(`Start image resize process.`)

  for (let i = 0; i < filterFiles.length; i++) {
    const file = filterFiles[i]
    spinner.start(`${chalk.bold(`${file.name}`)} prosess...`)
    await imageCompress(file)
  }

  spinner.succeed('image file export!')
  
  cb();
}

function imageCompress(file) {
  return new Promise((resolve, reject) => {
    const [ fileName, ex ] = file.name.split('.')
    sharp(`${IMAGE_DIRECTORY_PATH}${file.name}`)
    .resize(RESIZE_OPTION)
    .toFormat(DIST_FORMAT)
    .toFile(`${DIST_DIRECTORY_PATH}${fileName}.${DIST_FORMAT}`, (err, info) => {
      if(err) {
        spinner.fail(`${chalk.bold(`${file.name}`)} ${err}`)
        return reject(err)
      } 

      if (!isDeleteSrcImg) {
        spinner.succeed(`${chalk.bold(`${file.name}`)} resized.`)
        return resolve(info)
      }

      del([`${IMAGE_DIRECTORY_PATH}${file.name}`]).then(() => {
        spinner.succeed(`${chalk.bold(`${file.name}`)} resized.`)
        resolve(info)
      })
    })
  })
}

export default defaultTask