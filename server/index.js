const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 3000

const PUBLIC_DIR = path.join(__dirname, '../public/')
const STATIC_DIR = path.join(PUBLIC_DIR, 'static/')

app.listen(port, () => {
    app.use('/static/', express.static(STATIC_DIR))
    app.get('/', (req, res) => {
        res.sendFile(path.join(PUBLIC_DIR, 'index.html'))
    })

    app.use((req, res) => {
        res.status(404).send('no emoji here!')
    })

    console.log('Server listening on port', port)
})
