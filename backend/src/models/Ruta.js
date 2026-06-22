const mongoose = require("mongoose");

const paradaSchema = new mongoose.Schema({
  numero_pedido: String,
  direccion_destino: String,
  estado_parada: String,
  hora_llegada: Date,
});

const schema = new mongoose.Schema({
  conductor_id: mongoose.Schema.Types.ObjectId,
  zona: String,
  ciudad: String,
  fecha: Date,
  hora_inicio: Date,
  hora_fin: Date,
  distancia_km: Number,
  pedidos_asignados: [mongoose.Schema.Types.ObjectId],
  paradas: [paradaSchema],
  estado_ruta: String,
});

module.exports = mongoose.model("Ruta", schema);
