// backend/server.js
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import User from './models/User.js'; // đúng đường dẫn tới model

dotenv.config({ path: './backend/.env' });

console.log("Server.js started");
console.log("Connecting to MongoDB...");

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
