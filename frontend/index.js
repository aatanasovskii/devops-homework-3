const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.get('/', async (req, res) => {
    try {
        // HERE IS THE MAGIC:
        // We use the service name "backend" (defined in docker-compose)
        // Docker DNS resolves "http://backend" to the correct internal IP.
        const response = await axios.get('http://backend:4000/api/data');

        const data = response.data;

        res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>Frontend Application</h1>
        <hr>
        <div style="background: #f4f4f4; padding: 20px; display: inline-block; border-radius: 10px;">
            <h3 style="color: green;">Success!</h3>
            <p><b>Message from Backend:</b> ${data.message}</p>
            <p><b>Service Status:</b> ${data.status}</p>
        </div>
      </div>
    `);
    } catch (error) {
        console.error(error);
        res.send(`<h1>Error</h1><p>Could not connect to backend.</p>`);
    }
});

app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});