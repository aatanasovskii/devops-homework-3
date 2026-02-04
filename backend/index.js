const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());

app.get('/api/data', (req, res) => {
    res.json({
        service: "Backend Service",
        status: "Active",
        message: "Hello from the Docker Backend!"
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});