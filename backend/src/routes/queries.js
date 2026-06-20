const express = require("express");
const router = express.Router();
const Pedido = require("../models/Pedido");

// Q1 — Pedidos por ciudad y estado (sin filtro de fecha)
router.get("/q1", async (req, res) => {
  try {
    const { ciudad = "Bogotá", estado = "entregado" } = req.query;

    const resultado = await Pedido.find({ estado, ciudad })
      .limit(100)
      .select(
        "numero_pedido ciudad zona estado fecha_asignacion fecha_entrega peso_kg valor_declarado",
      );

    res.json({ total: resultado.length, datos: resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q2 — Conductores con más pedidos tardíos por zona
router.get("/q2", async (req, res) => {
  try {
    const resultado = await Pedido.aggregate([
      { $match: { estado: "tardío" } },
      {
        $group: {
          _id: { conductor_id: "$conductor_id", zona: "$zona" },
          total_tardios: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "conductors",
          localField: "_id.conductor_id",
          foreignField: "_id",
          as: "conductor",
        },
      },
      { $unwind: "$conductor" },
      {
        $project: {
          zona: "$_id.zona",
          nombre: {
            $concat: ["$conductor.nombre", " ", "$conductor.apellido"],
          },
          ciudad_base: "$conductor.ciudad_base",
          total_tardios: 1,
        },
      },
      { $sort: { total_tardios: -1 } },
      { $limit: 20 },
    ]);

    res.json({ total: resultado.length, datos: resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q3 — Tiempo promedio de entrega por conductor y zona
router.get("/q3", async (req, res) => {
  try {
    const resultado = await Pedido.aggregate([
      {
        $match: {
          fecha_entrega: { $exists: true, $ne: null },
          fecha_asignacion: { $exists: true, $ne: null },
        },
      },
      {
        $addFields: {
          tiempo_entrega_min: {
            $divide: [
              { $subtract: ["$fecha_entrega", "$fecha_asignacion"] },
              60000,
            ],
          },
        },
      },
      { $match: { tiempo_entrega_min: { $gt: 0 } } },
      {
        $group: {
          _id: { conductor_id: "$conductor_id", zona: "$zona" },
          promedio_minutos: { $avg: "$tiempo_entrega_min" },
          total_pedidos: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "conductors",
          localField: "_id.conductor_id",
          foreignField: "_id",
          as: "conductor",
        },
      },
      { $unwind: "$conductor" },
      {
        $project: {
          zona: "$_id.zona",
          nombre: {
            $concat: ["$conductor.nombre", " ", "$conductor.apellido"],
          },
          ciudad_base: "$conductor.ciudad_base",
          promedio_minutos: { $round: ["$promedio_minutos", 1] },
          total_pedidos: 1,
        },
      },
      { $sort: { promedio_minutos: 1 } },
      { $limit: 20 },
    ]);

    res.json({ total: resultado.length, datos: resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CRUD DE PEDIDOS =====

// CREATE — Crear un nuevo pedido
router.post("/pedidos", async (req, res) => {
  try {
    const nuevoPedido = new Pedido({
      ...req.body,
      fecha_asignacion: new Date(),
    });
    const guardado = await nuevoPedido.save();
    res.status(201).json({ mensaje: "Pedido creado", datos: guardado });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ — Buscar un pedido por ID
router.get("/pedidos/:id", async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json({ datos: pedido });
  } catch (err) {
    res.status(400).json({ error: "ID inválido" });
  }
});

// UPDATE — Actualizar un pedido existente
router.put("/pedidos/:id", async (req, res) => {
  try {
    const actualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!actualizado) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json({ mensaje: "Pedido actualizado", datos: actualizado });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — Eliminar un pedido
router.delete("/pedidos/:id", async (req, res) => {
  try {
    const eliminado = await Pedido.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json({ mensaje: "Pedido eliminado", datos: eliminado });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Q4 — Total de pedidos, valor y peso promedio por ciudad
router.get("/q4", async (req, res) => {
  try {
    const resultado = await Pedido.aggregate([
      {
        $group: {
          _id: "$ciudad",
          total_pedidos: { $sum: 1 },
          valor_total: { $sum: "$valor_declarado" },
          valor_promedio: { $avg: "$valor_declarado" },
          peso_promedio: { $avg: "$peso_kg" },
        },
      },
      {
        $project: {
          _id: 0,
          ciudad: "$_id",
          total_pedidos: 1,
          valor_total: { $round: ["$valor_total", 0] },
          valor_promedio: { $round: ["$valor_promedio", 0] },
          peso_promedio: { $round: ["$peso_promedio", 2] },
        },
      },
      { $sort: { total_pedidos: -1 } },
    ]);

    res.json({ total: resultado.length, datos: resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q5 — Distribución de eventos de estado por tipo
router.get("/q5", async (req, res) => {
  try {
    const Evento = require("../models/Evento");

    const resultado = await Evento.aggregate([
      {
        $group: {
          _id: "$estado",
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { cantidad: -1 } },
    ]);

    const totalGeneral = resultado.reduce((acc, r) => acc + r.cantidad, 0);

    const final = resultado.map((r) => ({
      estado: r._id,
      cantidad: r.cantidad,
      porcentaje: Number(((r.cantidad / totalGeneral) * 100).toFixed(1)),
    }));

    res.json({ total: final.length, datos: final });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
