const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  cedula: String,
  nombre: String,
  apellido: String,
  telefono: String,
  ciudad_base: String,
  zona_asignada: String,
  vehiculo_tipo: String,
  vehiculo_placa: String,
  activo: Boolean,
  fecha_ingreso: Date,
});

module.exports = mongoose.model("Conductor", schema);
