import { useState } from "react";
import Navbar from "./components/Navbar";
import MatrixRain from "./components/MatrixRain";
import CRUD from "./components/CRUD";
import Q1 from "./components/Q1";
import Q2 from "./components/Q2";
import Q3 from "./components/Q3";
import Q4 from "./components/Q4";
import Q5 from "./components/Q5";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("q1");

  return (
    <div className="app-wrapper">
      <MatrixRain />
      <Navbar />
      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${tab === "q1" ? "active" : ""}`}
            onClick={() => setTab("q1")}
          >
            Q1 · Básica
          </button>
          <button
            className={`tab ${tab === "q2" ? "active" : ""}`}
            onClick={() => setTab("q2")}
          >
            Q2 · Intermedia
          </button>
          <button
            className={`tab ${tab === "q3" ? "active" : ""}`}
            onClick={() => setTab("q3")}
          >
            Q3 · Avanzada
          </button>
          <button
            className={`tab ${tab === "q4" ? "active" : ""}`}
            onClick={() => setTab("q4")}
          >
            Q4 · Por ciudad
          </button>
          <button
            className={`tab ${tab === "q5" ? "active" : ""}`}
            onClick={() => setTab("q5")}
          >
            Q5 · Eventos
          </button>
          <button
            className={`tab ${tab === "crud" ? "active" : ""}`}
            onClick={() => setTab("crud")}
          >
            CRUD
          </button>
        </div>

        {tab === "q1" && <Q1 />}
        {tab === "q2" && <Q2 />}
        {tab === "q3" && <Q3 />}
        {tab === "q4" && <Q4 />}
        {tab === "q5" && <Q5 />}
        {tab === "crud" && <CRUD />}
      </div>
    </div>
  );
}
