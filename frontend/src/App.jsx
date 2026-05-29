import { useState } from "react";
import Navbar from "./components/Navbar";
import Q1 from "./components/Q1";
import Q2 from "./components/Q2";
import Q3 from "./components/Q3";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("q1");

  return (
    <>
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
        </div>

        {tab === "q1" && <Q1 />}
        {tab === "q2" && <Q2 />}
        {tab === "q3" && <Q3 />}
      </div>
    </>
  );
}
