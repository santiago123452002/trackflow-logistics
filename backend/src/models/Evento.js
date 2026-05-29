const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  pedido_id: mongoose.Schema.Types.ObjectId,
  conductor_id: mongoose.Schema.Types.ObjectId,
  estado: String,
  timestamp: Date,
  descripcion: String,
  ubicacion_lat: Number,
  ubicacion_lng: Number,
});

module.exports = mongoose.model("Evento", schema);
