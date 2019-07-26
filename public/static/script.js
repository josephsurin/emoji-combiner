function svg_to_node(svg_data) {
    var parser = new DOMParser()
    return parser.parseFromString(svg_data, 'text/xml').documentElement
}

async function fetch_parts_data() {
    const endpoint = '/static/parts_data.json'
    var r = await fetch(endpoint)
    var data = await r.json()
    return data
}

function fetch_svg(id, e) {
    console.log(id, 'has been clicked for svg')
    window.open(window.location.origin + '/save_svg/' + id, '_blank')
}

function fetch_png(id, e) {
    e.preventDefault()
    console.log(id, 'has been click for png')
    window.open(window.location.origin + '/save_png/' + id, '_blank')
}

const rand_el = arr => arr[Math.floor(Math.random() * arr.length)]
const wrap_svg = (d, s=100) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">${d}</svg>`
function generate_random_emoji_svg_node(parts_data) {
    var svg_out = '' 
    var name = ''
    Object.keys(parts_data).forEach(part_data => {
        var id = rand_el(Object.keys(parts_data[part_data]))
        var data = parts_data[part_data][id]
        name += id + '-'
        svg_out += data
    })
    name = name.substr(0, name.length - 1)
    svg_out = wrap_svg(svg_out)
    var node = svg_to_node(svg_out)
    node.onclick = fetch_svg.bind(this, name)
    node.oncontextmenu = fetch_png.bind(this, name)
    return node
}

function load_on_scroll(parts_data, e) {
    if(e.target.scrollHeight - e.target.scrollTop <= window.innerHeight + 600) {
        load_emoji_to_DOM(e.target, parts_data, 100)
    }
}

function load_emoji_to_DOM(targ_el, parts_data, amount) {
    for(var i = 0; i < amount; i++) {
        var node = generate_random_emoji_svg_node(parts_data)
        targ_el.appendChild(node)
    }
}

function clear_el(targ_el) {
    while(targ_el.firstChild) {
        targ_el.removeChild(targ_el.firstChild)
    }
}

var randomise = () => {}

(async() => {
    var parts_data = await fetch_parts_data()
    var emoji_container = document.querySelector('#emoji-container')
    load_emoji_to_DOM(emoji_container, parts_data, 200)
    emoji_container.onscroll = load_on_scroll.bind(this, parts_data)

    randomise = () => {
        if(emoji_container.childElementCount >= 600) {
            window.location.reload(false)
        }
        clear_el(emoji_container)
        load_emoji_to_DOM(emoji_container, parts_data, 100)
    }
})()

