const express = require('express');
const port = 3000;
const cors = require('cors')
const rateLimit = require('express-rate-limit');
const router = require('./routes/router');

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 1,
    message: 'Превышен лимит для отправления запросов'
});

const app = express()

app.use(cors())
app.use(express.json())
app.use('', router)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});