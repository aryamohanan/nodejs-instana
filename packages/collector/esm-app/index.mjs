import got from 'got';
import express from 'express';
import { calculateSquare } from 'esm-square-calculator';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.send('Hello World, I am ES module');
});

app.get('/esm-got', async (req, res) => {
  try {
    const square = calculateSquare(5);
    console.log(`square ${square}`);
    await got('https://example.com/?random=1000');

    res.send({ status: 'ok' });
  } catch (error) {
    console.error('Error retrieving spans:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3003, () => {
  console.log('Welcome to ES module express app');
});
