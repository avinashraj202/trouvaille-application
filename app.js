const express = require("express");
const app = express();
const config = require("config");
var path = require("path");
const { v1, v2 } = require("./routes");
const { validator, handleError } = require("./middleware");

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}

app.use(express.json());

app.use(express.static(path.resolve("./")));

// app.use("", v1);
app.use("/api/v2", v2);

app.get("/", (req, res) => {
  res.send("Hello world asd");
});
app.use((err, req, res, next) => {
  handleError(err, res);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}...`));
