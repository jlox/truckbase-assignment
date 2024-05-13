const express = require("express");
const finnhub = require('finnhub');

// CREATE TABLE stonks (symbol varchar(10), time_added timestamp);
// INSERT INTO stonks VALUES ('AAPL', NOW());

const PORT = process.env.PORT || 3001;

const app = express();
const watchlist = ['AAPL']; // fetch results from PG; SELECT symbol FROM stonks

const finnhubClient = new finnhub.DefaultApi()


app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// app.get("/fetch-prices", (req, res) => {
//   // console.log('req: ', req);
//   // console.log('res: ', res);
//   console.log('~~~~~~~~~~~~~~ ', streamStocks(watchlist));
// });

app.post("/add-symbol", (req, res) => {

});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
