import React, { useState, useEffect } from 'react';
import './App.css';
const token = 'cp0le61r01qnigekhh50cp0le61r01qnigekhh5g'
const socket = new WebSocket(`wss://ws.finnhub.io?token=${token}`);

// set up pg db
// populate with stock symbols and info
// take ss of it to include if I can't get a remote version working

// frontend
// grid to contain stock prices
// useeffect based on orm?

// (index) symbol | watched_at datetime

function App() {
  const watchlist = ['AAPL', 'NVDA']; // fetch results from PG; SELECT symbol FROM stonks, then shape to array of symbols
  const [stockPrices, setStockPrices] = useState({});
  useEffect(() => {

    socket.addEventListener('open', function (event) {
      watchlist.forEach(stock => {
        socket.send(JSON.stringify({'type':'subscribe', 'symbol': stock}))
      })
    });
    // Listen for messages
    socket.addEventListener('message', function (event) {
      const str = event.data;
      const currSymbol = str.substring(
        str.indexOf('"s"') + 4,
        str.indexOf(',"t"')
        ).replace(/"/g, '');
      const currentStockPrice = str.substring(
        str.indexOf(`"p"`) + 4,
        str.indexOf(`,"s"`)
      );
      const stockTimestamp = str.substring(
        str.indexOf(`"t"`) + 4,
        str.indexOf(`,"v"`)
      );
      if (watchlist.includes(currSymbol)) {
        const res = {};
        res[currSymbol] = { price: currentStockPrice, timestamp: stockTimestamp };
        setStockPrices({...stockPrices, ...res});
      }
    });

    // return () => {
    //     watchlist.forEach(stock => {
    //         console.log('closing stock: ', stock);
    //         socket.onopen = () => socket.send(JSON.stringify({ type: "unsubscribe", symbol: stock }));
    //       })
    //     }
    }, [stockPrices, watchlist]);

  const renderTableContents = (stocks) => {
    const tableBody = [];
    for (const stock in stocks) {
      tableBody.push(
        <tr>
          <td>{stock}</td>
          <td>{stockPrices[stock].price}</td>
          <td>{stockPrices[stock].timestamp}</td>
        </tr>
      )
    }
    return tableBody;
  };

  return (
    <div className="App">
      <table id='stonks'>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Price</th>
            <th>Last Updated</th>
          </tr>  
        </thead>
        <tbody>
          {renderTableContents(stockPrices)}
        </tbody>
      </table>
    </div>
  );
}

export default App;
