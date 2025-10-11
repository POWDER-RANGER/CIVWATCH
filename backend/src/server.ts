import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CIVWATCH Backend' })
})

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`)
})
