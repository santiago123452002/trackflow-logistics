const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  numero_pedido: String,
  cliente_id: mongoose.Schema.Types.ObjectId,
  conductor_id: mongoose.Schema.Types.ObjectId,
  ruta_id: mongoose.Schema.Types.ObjectId,
  estado: String,
  ciudad: String,
  zona: String,
  fecha_asignacion: Date,
  fecha_entrega: Date,
  direccion_destino: String,
  valor_declarado: Number,
  peso_kg: Number,
  observaciones: String,
});

module.exports = mongoose.model("Pedido", schema);
