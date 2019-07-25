const path = require('path')
const fs = require('fs-extra')
const stream = require('stream')
const { exec } = require('child_process')

const PARTS_DIR = path.join(__dirname, '../../data/optimised-parts/')
const PARTS = ['bases', 'brows', 'mouth', 'eyes', 'extras']

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
        await fs.writeFile(path.join(__dirname, outfile), JSON.stringify(parts_data))
    }
    return parts_data
}

function inkscape_save_png(svg_data, outfile) {
    var child = exec(`/usr/bin/inkscape -e "${outfile}" -d 500 -`, (err, stdout, stderr) => {
        if(err) throw err
        console.log(stdout)
    })
    var stdin_stream = new stream.Readable()
    stdin_stream.push(svg_data)
    stdin_stream.push(null)
    stdin_stream.pipe(child.stdin)
}

const wrap_svg = d => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${d}</svg>`

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

// (async () => {
//     var parts_data = await load_parts('parts_data.json')
//     for(var i = 0; i < 50; i++) {
//         generate_random_emoji_svg(parts_data, false, true)
//     }
// })()
