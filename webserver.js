const express = require('express');

const app = express();
const port = 3000;

app.use(express.static('demo'));
app.use(express.static('dict'));
app.use(express.static('dist'));

app.listen(port, () => console.log(`kuromoji demo listening at http://localhost:${port}`));
