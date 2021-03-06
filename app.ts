import express from "express";
import createError from 'http-errors';
import cors from 'cors';

require('dotenv').config();
const port = process.env.PORT;

const app = express();

app.use(cors());
app.options('*', cors());

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );

var usersRouter = require('./routes/users');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
