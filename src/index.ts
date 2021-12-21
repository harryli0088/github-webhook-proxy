import express from 'express'
import https from "https"
import { version } from "../package.json"

const app = express()
const port = process.env.PORT || 5000

app.get("/", (req,res) => res.send(`GitHub Webhook Proxy ${version}`))

/*
curl -X POST -G \
'http://localhost:5000' \
-d event_type=webhook \
-d pat=abc \
-d repository=123 \
-d username=test
*/

app.post("/",(req, res) => {
  const {
    event_type,
    pat,
    repository,
    username
  } = req.query
  console.log(req.query)

  const data = new TextEncoder().encode(
    JSON.stringify({ event_type })
  )

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/${username}/${repository}/dispatches`,
    method: 'POST',
    headers: {
      "Accept": "application/vnd.github.everest-preview+json",
      'Authorization': `token ${pat}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'User-Agent': `${username}`,
    }
  }

  const proxyReq = https.request(options, proxyRes => {
    console.log(`statusCode: ${res.statusCode}`)
  
    proxyRes.on('data', d => {
      res.send(d).status(proxyRes.statusCode || 200)
    })
  })

  proxyReq.on('error', error => {
    console.error(error)
    res.status(400).send(error.message)
  })
  
  proxyReq.write(data)
  proxyReq.end()
})

app.listen(port, () => {
  console.log(`Server running on port ${port}.`)
})
