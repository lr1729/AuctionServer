var express = require('express');
var router = express.Router();
import Database from 'better-sqlite3';

const db = new Database('foobar.db', { verbose: console.log });

const createTables = `
  CREATE TABLE IF NOT EXISTS items(
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    startingPrice INT NOT NULL,
    image TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS bids(
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    itemId INTEGER NOT NULL,
    price INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL
  )
`;

db.exec(createTables);

/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.post('/additem', (req, res) => {
  const { name, description, price, image } = req.body;
  if( !(name && description && price && image) ){
    res.status(400).send({
      message: "Item name, description, and price cannot be empty"
    }); 
  } else {
    const stmnt = db.prepare("INSERT INTO items(name, description, startingPrice, image) VALUES(?, ?, ?, ?)");
    stmnt.run(name, description, price, image);
    res.send(`Added new item: ${name}`);
  }
});

router.post('/additem', (req, res) => {
  const { name, description, price } = req.body;
  if( !(name && description && price) ){
    res.status(400).send({
      message: "Item name, description, and price cannot be empty"
    }); 
  } else {
    const stmnt = db.prepare("INSERT INTO items(name, description, startingPrice) VALUES(?, ?, ?)");
    stmnt.run(name, description, price);
    res.send(`Added new item: ${name}`);
  }
});

router.post('/addbid', (req, res) => {
  const { id, price, name, phone, email } = req.body;
  if( !(id && price && name && phone && email) ){
    res.status(400).send("Please enter all fields"); 
  } else {
    const getPrice = db.prepare("SELECT MAX(price) AS price FROM bids WHERE itemId = ?");
    const highestBid = getPrice.get(req.body.id).price;
    if(price >= highestBid + parseInt(process.env.MIN_INCREASE)){
      const stmnt = db.prepare("INSERT INTO bids(itemId, price, name, phone, email) VALUES(?, ?, ?, ?, ?)");
      stmnt.run(id, price, name, phone, email);
      res.send('Added new bid');
    } else 
      res.status(400).send(`Bid must be at least $${process.env.MIN_INCREASE} higher than the current highest bid`)
  }
});

router.post('/removebid', (req, res) => {
  const { id, price, name } = req.body;
  if( !(id && price && name) ){
    res.status(400).send("Please enter all fields");
  } else {
    const stmnt = db.prepare("DELETE FROM bids WHERE itemId = ? AND price = ? AND name = ?");
    const response = stmnt.run(id, price, name);
    if(response.changes === 0)
      res.status(404).send("No matching bid found.");
    else
      res.status(200).send(`Removed ${response.changes} bids.`)
  }
});

router.get('/getprices', (req, res) => {
  const stmnt = db.prepare(`
    SELECT i.id, i.name, i.startingPrice, i.image, i.description, MAX(b.price) AS highestBid
    FROM items i
    LEFT JOIN bids b ON i.id = b.itemId
    GROUP BY i.id
  `);
  const users = stmnt.all()
  res.send(users)
})

module.exports = router;
