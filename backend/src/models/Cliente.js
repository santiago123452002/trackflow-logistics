const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  nit_cedula: String,
  nombre: String,
  tipo: String,
  ciudad: String,
  barrio: String,
  direccion: String,
  telefono: String,
  email: String,
  total_pedidos: Number,
  fecha_registro: Date,
});

module.exports = mongoose.model("Cliente", schema);
