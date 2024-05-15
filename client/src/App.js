import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
const token = '<YOUR_API_KEY_HERE>'
const socket = new WebSocket(`wss://ws.finnhub.io?token=${token}`);

function App() {
  const [stockPrices, setStockPrices] = useState({});
  const [newStock, setNewStock] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  
  // initialize data and cleanup
  useEffect(() => {
    // initialize watchlist with whats stored in SQL
    axios
      .get('http://localhost:3000/get-symbols')
      .then((response) => {
        setWatchlist(response.data);
        socket.addEventListener('open', function (event) {
          response.data.forEach(stock => {
            socket.send(JSON.stringify({'type':'subscribe', 'symbol': stock}))
          })
        });
      })
      .catch(err => {
        console.error(err);
        toast('Error fetching initial stocks in watchlist!')
      });

    // for cleanup
    return () => {
      watchlist.forEach(stock => {
          console.log('closing subscription to: ', stock);
          socket.onopen = () => {
            socket.send(JSON.stringify({ type: "unsubscribe", symbol: stock }));
            socket.close();
          };
      })
    }
  }, []);

  // eventlistener for messages
  useEffect(() => {
    // listen to socket and parse data to display in table
    const messageListener = (event) => {
      const str = event.data;
      const jsonMessage = JSON.parse(str);
      const currSymbol = jsonMessage.data ? jsonMessage.data[0].s : null;
      if (watchlist.length > 0) {
        if (watchlist.includes(currSymbol)) {
          const currentStockPrice = jsonMessage.data[0].p;
          const stockTimestamp = jsonMessage.data[0].t;
          const res = {};
          res[currSymbol] = { price: currentStockPrice, timestamp: new Date(stockTimestamp).toString() };
          setStockPrices((prevStockPrices) => { return { ...prevStockPrices, ...res } })
        }
      }
    }
    socket.onmessage = (e) => messageListener(e);
  }, [watchlist]);

  const handleChange = (e) => {
    setNewStock(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // add new symbol to SQL and update local state
    const addNewStock = (newStock) => {
      axios
        .post('http://localhost:3000/add-symbol', {params: newStock})
        .then((response) => {
          setWatchlist((prevWatchlist) => { return [...prevWatchlist, newStock]});
          socket.send(JSON.stringify({'type':'subscribe', 'symbol': newStock}))
          toast(`Successfully added ${newStock} to watchlist!`)
        })
        .catch(err => {
          console.error(err);
          toast(`Error adding new stock ${newStock} to watchlist: `, err);
        });
    }

    if (watchlist.length > 0) {
      // more validation would be put here (is this a real symbol, etc)
      if (watchlist.includes(newStock)) {
        toast(`${newStock} is already being watched!`)
      }
      else {
        addNewStock(newStock);
      }
    }
    else {
      addNewStock(newStock)
    }
    
  };

  const renderTableContents = (stocks) => {
    const tableBody = [];
    for (const stock in stocks) {
      tableBody.push(
        <tr>
          <td>{stock}</td>
          <td>{stocks[stock].price}</td>
          <td>{stocks[stock].timestamp}</td>
        </tr>
      )
    }
    return tableBody;
  };

  return (
    <div className="App">
      <form onSubmit={(e) => handleSubmit(e)}>
        <Toaster />
        <label>Stock to add to watchlist: </label>
        <input type="text" id="new-stock" name="new-stock" onChange={(e) => handleChange(e)}/>
        <input type="submit"/>
      </form>


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
