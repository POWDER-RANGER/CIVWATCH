const express = require('express');
const app = express();
app.get('/api/status', (req, res) => res.json({status: 'ok'}));
app.listen(3000, () => console.log('Backend running at http://localhost:3000'));
