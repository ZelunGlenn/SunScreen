import express from 'express'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const app = express()
const port = 3000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_URL = 'https://api.openuv.io/api/v1'
dotenv.config({ path: '../.env' })

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'server', 'views'))

app.use(express.static('public'))
app.use(express.json())


// app.get('/', async (req, res) => {
//   try{
//     const rawData = await axios.get(API_URL + "/uv", {
//       params: {
//         lat: 1,
//         lng: -1
//       },
//       headers: {
//         'x-access-token': process.env.API_KEY
//       },
//     })
//     console.log(JSON.stringify(rawData.data))
//     res.render('index')

//   } catch(err) {
//     // console.log(err)
//     res.render("index");
//   }
  
// })

app.get('/', function(req, res) {
  res.render('index', { severity: null, error: null })
})

app.post('/save-location', async (req, res) => {
  const { latitude, longitude } = req.body
  try {
    
    const rawData = await axios.get(API_URL + "/uv", {
      params: {
        lat: latitude,
        lng: longitude,
      },
      headers: {
        'x-access-token': process.env.API_KEY
      },
    })
    const severity = rawData.data.result.uv
    // console.log(latitude, longitude)
    // console.log(severity)
    // test use
    // const severity = 4
    res.send({severity});

  } catch(err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to fetch UV data. Please try again later.' });
  }
})


app.listen(port, () => {
  console.log(`port live on: http://localhost:${port}`)
})