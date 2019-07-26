const path = require('path')
const { load_parts } = require('./index.js')

const STATIC_DIR = path.join(__dirname, '../../public/static/')

console.log('loading parts and storing...')
load_parts(path.join(STATIC_DIR, 'parts_data.json'))
