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

module.exports = router;
