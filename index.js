const express = require('express')
const { socialMentionSearcher } = require('./API_Logic/socialMentionSearcher')
const { socialTrendsSearcher } = require('./API_Logic/socialTrendsSearcher')
const app = express()
const port = 3000

app.get('/socialMentionSearcher', async (req, res) => {
    try {
        const url = "https://www.social-searcher.com/social-buzz/?q5=" + req.query.q;
        const response = await socialMentionSearcher(url)
        res.send(response)
    } catch (error) {
        res.send(error)
    }
})

app.get('/socialTrendsSearcher', async (req, res) => {
    try {
        const url = "https://www.social-searcher.com/social-trends/?q7=" + req.query.q;
        const response = await socialTrendsSearcher(url)
        res.send(response)
    } catch (error) {
        res.send(error)
    }
})

app.listen(port, () => {
    console.log(`Social Media Monitoring API listening on port ${port}`)
})