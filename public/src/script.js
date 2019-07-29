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
    window.open(window.location.origin + '/save_svg/' + id, '_blank')
}

function fetch_png(id, e) {
    e.preventDefault()
    window.open(window.location.origin + '/save_png/' + id, '_blank')
}

const rand_el = arr => arr[Math.floor(Math.random() * arr.length)]
const wrap_svg = (d, s=100, wh=100) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${wh}" height="${wh}">${d}</svg>`
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

function get_filtered_parts(parts_data, filter_data) {
    var filtered_parts_data = {}
    Object.keys(filter_data).forEach(part => {
        filtered_parts_data[part] = {}
        filter_data[part].forEach(part_id => {
            filtered_parts_data[part][part_id] = parts_data[part][part_id]
        })
    })
    return filtered_parts_data
}

function toggle_filter(el, parts_data, filter_data, filter_key, id) {
    var id_idx = filter_data[filter_key].findIndex(x => x == id)
    if(id_idx == -1) {
        filter_data[filter_key].push(id)
        el.style.background = 'none'
    } else {
        filter_data[filter_key] = filter_data[filter_key].slice(0, id_idx).concat(filter_data[filter_key].slice(id_idx + 1))
        el.style.background = 'red'
    }
    var filtered_parts_data = get_filtered_parts(parts_data, filter_data)
    var emoji_container = document.querySelector('#emoji-container')
    clear_el(emoji_container)
    load_emoji_to_DOM(emoji_container, filtered_parts_data, 200)
}

function render_filter_options(targ_el, filter_data, parts_data, filter_key) {
    clear_el(targ_el)
    Object.keys(parts_data[filter_key]).forEach(id => {
        var svg_data = parts_data[filter_key][id]
        var svg_el = wrap_svg(svg_data, 100, 50)
        svg_el = svg_to_node(svg_el)
        if(filter_data[filter_key].findIndex(x => x == id) == -1) {
            svg_el.style.background = 'red'
        }
        svg_el.onclick = toggle_filter.bind(this, svg_el, parts_data, filter_data, filter_key, id)
        targ_el.appendChild(svg_el)
    })    
}

var randomise = () => {}

(async() => {
    var parts_data = await fetch_parts_data()
    var emoji_container = document.querySelector('#emoji-container')
    load_emoji_to_DOM(emoji_container, parts_data, 200)

    var filter_data = {}
    Object.keys(parts_data).forEach(part => {
        filter_data[part] = Object.keys(parts_data[part])
    })

    emoji_container.onscroll = (e) => load_on_scroll(get_filtered_parts(parts_data, filter_data), e)

    randomise = () => {
        if(emoji_container.childElementCount >= 600) {
            window.location.reload(false)
        } else {
            clear_el(emoji_container)
            load_emoji_to_DOM(emoji_container, get_filtered_parts(parts_data, filter_data), 100)
        }
    }

    var filter_options = document.getElementById('filter-options')

    var bases_filter_tab = document.getElementById('bases-filter')
    bases_filter_tab.onclick = () => render_filter_options(filter_options, filter_data, parts_data, 'bases')

    var eyes_filter_tab = document.getElementById('eyes-filter')
    eyes_filter_tab.onclick = () => render_filter_options(filter_options, filter_data, parts_data, 'eyes')

    var mouth_filter_tab = document.getElementById('mouth-filter')
    mouth_filter_tab.onclick = () => render_filter_options(filter_options, filter_data, parts_data, 'mouth')

    var brows_filter_tab = document.getElementById('brows-filter')
    brows_filter_tab.onclick = () => render_filter_options(filter_options, filter_data, parts_data, 'brows')

    var extras_filter_tab = document.getElementById('extras-filter')
    extras_filter_tab.onclick = () => render_filter_options(filter_options, filter_data, parts_data, 'extras')
})()

