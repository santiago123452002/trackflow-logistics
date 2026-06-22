const mongoose = require("mongoose");

const datosClienteSchema = new mongoose.Schema({
  nombre: String,
  telefono: String,
  direccion: String,
  ciudad: String,
  barrio: String,
});

const schema = new mongoose.Schema({
  numero_pedido: String,
  cliente_id: mongoose.Schema.Types.ObjectId,
  datos_cliente: datosClienteSchema,
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
