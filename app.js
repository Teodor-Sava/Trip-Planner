const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRoutes = require("./api/routes/user");
const placeRoutes = require("./api/routes/places");
const migrationsRoutes = require("./api/routes/migrations")

mongoose.connect(
  "mongodb://localhost:27017/trip_planner", {
    useNewUrlParser: true
  },
  err => {
    if (err) {
      console.log(err);
    }
  }
);

mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// route handler
app.use("/user", userRoutes);
app.use("/places", placeRoutes)
app.use("/migrations", migrationsRoutes)
// route error handler
// app.use((req, res, next) => {
//   const error = new Error("Not found");
//   error.status = 404;
//   next(error);
// });

// server error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;