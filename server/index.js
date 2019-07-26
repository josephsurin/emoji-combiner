const express = require('express')
const app = express()
const rateLimit = require('express-rate-limit')
const path = require('path')
const port = process.env.PORT || 3000

const PUBLIC_DIR = path.join(__dirname, '../public/')
const STATIC_DIR = path.join(PUBLIC_DIR, 'static/')

const { generate_emoji, load_parts } = require('./util')

const save_limiter = rateLimit({
    windowMs: 20 * 1000, // 20 seconds
    max: 15
})

app.listen(port, async () => {
    const parts_data = await load_parts()

    app.use('/static/', express.static(STATIC_DIR))
    app.get('/', (req, res) => {
        res.sendFile(path.join(PUBLIC_DIR, 'index.html'))
    })

    app.get('/save_svg/:id', save_limiter, async (req, res) => {
        var { id } = req.params
        var svg_data = await generate_emoji(id, parts_data, 'svg')
        res.set('Content-Type', 'image/svg+xml')
        res.status(200).send(svg_data)
    })

    app.get('/save_png/:id', save_limiter, async (req, res) => {
        var { id } = req.params
        var png_data = await generate_emoji(id, parts_data, 'png')
        res.set('Content-Type', 'image/png')
        res.status(200).send(png_data)
    })

    app.use((req, res) => {
        res.status(404).send('no emoji here!')
    })

    console.log('Server listening on port', port)
})
