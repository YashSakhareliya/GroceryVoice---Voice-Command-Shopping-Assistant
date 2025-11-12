import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.send('Server is healthy');
});


app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`);
});