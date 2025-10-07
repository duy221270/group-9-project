const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user.js');

dotenv.config();
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/api', userRoutes);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));