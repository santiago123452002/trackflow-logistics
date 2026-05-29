require("dotenv").config();
const express = require("express");
const cors = require("cors");
const conectar = require("./src/db");
const queries = require("./src/routes/queries");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api", queries);

app.get("/", (req, res) => res.json({ mensaje: "TrackFlow API corriendo ✓" }));

conectar().then(() => {
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
});
