const path = require('path')
const fs = require('fs-extra')
const stream = require('stream')
const { exec } = require('child_process')

const PARTS_DIR = path.join(__dirname, '../../data/optimised-parts/')
const PARTS = ['bases', 'brows', 'mouth', 'eyes', 'extras']

const INKSCAPE_PATH = process.env.INKSCAPE_PATH || '/usr/bin/inkscape'

const rand_el = arr => arr[Math.floor(Math.random() * arr.length)]

async function load_parts(outfile=false) {
    var parts_data = {}
    await Promise.all(PARTS.map(async (part) => {
        parts_data[part] = {}
        var dir = await fs.readdir(path.join(PARTS_DIR, part))
        await Promise.all(dir.map(async (parts_file) => {
            var buffer = await fs.readFile(path.join(PARTS_DIR, part, parts_file))
            parts_data[part][path.basename(parts_file, '.svg')] = buffer.toString()
        }))
    }))
    if(outfile) {
        await fs.writeFile(outfile, JSON.stringify(parts_data))
    }
    return parts_data
}

function inkscape_get_png_buffer(svg_data) {
    return new Promise((res, rej) => {
        var child = exec(INKSCAPE_PATH + ' -z -e - -d 500 -', { encoding: 'binary' }, (err, stdout, stderr) => {
            if(err) {
                console.log('[INKSCAPE PNG ERR]', err, stderr)
                rej(err)
            } 
            return res(Buffer.from(stdout, 'binary'))
        })
        var stdin_stream = new stream.Readable()
        stdin_stream.push(svg_data)
        stdin_stream.push(null)
        stdin_stream.pipe(child.stdin)
    })
}

const wrap_svg = d => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${d}</svg>`
async function generate_emoji(id, parts_data, save_type='svg') {
    console.log('[GENERATING EMOJI]', id, save_type)
    var svg_out = ''
    try {
        var part_ids = id.split('-')
        if(part_ids.length != PARTS.length) throw Error('invalid parts count')
        part_ids.forEach((part_id, i) => {
            svg_out += parts_data[PARTS[i]][part_id]    
        })
        svg_out = wrap_svg(svg_out)
        if(save_type == 'svg') {
            return Buffer.from(svg_out)
        } else if(save_type == 'png') {
            var png_data = await inkscape_get_png_buffer(svg_out)
            return png_data
        } else {
            return null
        }
    } catch(e) {
        console.log('[INVALID EMOJI GENERATION]', e, id)
        return null
    }
}

module.exports = {
    generate_emoji,
    load_parts
}

/* TEST */
// (async () => {
//     var parts_data = await load_parts()
//     var png_data = await generate_emoji('10-13-46-44-20', parts_data, 'png')
//     fs.writeFileSync('./test.png', png_data)
// })()

/* ====== OTHER FUNCTIONS ====== */
function inkscape_save_png(svg_data, outfile) {
    var child = exec(`${INKSCAPE_PATH} -e "${outfile}" -d 500 -`, (err, stdout, stderr) => {
        if(err) throw err
        console.log(stdout)
    })
    var stdin_stream = new stream.Readable()
    stdin_stream.push(svg_data)
    stdin_stream.push(null)
    stdin_stream.pipe(child.stdin)
}

function generate_random_emoji_svg(parts_data, save_as_svg=false, save_as_png=false, save_dir='./') {
    var svg_out = '' 
    var outfile = ''
    Object.keys(parts_data).forEach(part_data => {
        var id = rand_el(Object.keys(parts_data[part_data]))
        var data = parts_data[part_data][id]
        outfile += id + '-'
        svg_out += data
    })
    outfile = outfile.substr(0, outfile.length - 1)
    svg_out = wrap_svg(svg_out)
    if(save_as_png) {
        inkscape_save_png(svg_out, path.join(save_dir, outfile + '.png')) 
    } else if(save_as_svg) {
        fs.writeFileSync(path.join(save_dir, outfile + '.svg'), svg_out)
    }
    return { id: outfile, svg_data: svg_out }
}
