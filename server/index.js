const express = require("express");
const cors = require('cors');

// If I had set up PG, I would create a table with:
// CREATE TABLE stonks (symbol varchar(10), time_added timestamp);

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());
const watchlist = [];

// because I used a websocket to fetch stock prices,
// I don't have an endpoint here
// app.get("/fetch-prices", (req, res) => {
//   // console.log('req: ', req);
//   // console.log('res: ', res);
// });

app.get("/get-symbols", (req, res) => {
  // fetch results from PG; SELECT symbol FROM stonks
  res.send(watchlist, 200);
});

app.post("/add-symbol", (req, res) => {
  const symbol = req.body.params;
  // Would add symbol validation here
  // through ORM: INSERT INTO stonks VALUES (symbol, NOW());
  watchlist.push(symbol);
  res.send(200);
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
