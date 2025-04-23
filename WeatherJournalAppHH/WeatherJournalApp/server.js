const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;
const HOSTNAME = '127.0.0.1';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let projectData = {};

app.use(express.static('website'));

// GET route to return projectData
app.get('/all', (req, res) => {
  res.json(projectData);
});

// POST route to add data to projectData
app.post('/add', (req, res) => {
  const { temperature, date, userResponse } = req.body;
  projectData = { temperature, date, userResponse };
  res.json(projectData);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${port}/`);
});
