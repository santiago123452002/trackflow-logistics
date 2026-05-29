# TrackFlow Logistics 

Sistema de gestión y trazabilidad logística construido con MongoDB y React.  
Proyecto académico — Bases de datos NoSQL.

## Integrantes
- Fernando Bedoya
- Santiago Muñoz Suarez

## Stack tecnológico
| Capa | Tecnología |
|------|-----------|
| Base de datos | MongoDB 7 (local) |
| ODM | Mongoose |
| Backend | Node.js + Express |
| Frontend | React + Vite |
| Gráficas | Chart.js |
| Datos sintéticos | Faker.js |

## Volumen de datos
| Colección | Documentos |
|-----------|-----------|
| pedidos | 850,000 |
| eventos_estado | 400,000 |
| rutas | 150,000 |
| conductores | 50,000 |
| clientes | 50,000 |
| **Total** | **1,500,000** |

## Consultas implementadas
- **Q1 · Básica** — Pedidos filtrados por ciudad y estado con `find()` e índices.
- **Q2 · Intermedia** — Conductores con más pedidos tardíos por zona usando `$group` + `$lookup`.
- **Q3 · Avanzada** — Tiempo promedio de entrega por conductor y zona usando `$addFields` + `$group` + `$lookup` + `$sort`.

## Requisitos previos
- Node.js v18 o superior
- MongoDB instalado y corriendo localmente

## Instalación y ejecución

### 1. Clonar el repositorio
git clone https://github.com/tu-usuario/trackflow-logistics.git
cd trackflow-logistics

### 2. Configurar el backend
cd backend
npm install
Crea un archivo `.env` dentro de `backend/` con este contenido:
MONGO_URI=mongodb://127.0.0.1:27017/trackflow
PORT=3001

### 3. Poblar la base de datos
node scripts/seed.js
Este proceso tarda entre 5 y 15 minutos e inserta 1,500,000 documentos.

### 4. Iniciar el backend
node index.js
El servidor queda corriendo en `http://localhost:3001`

### 5. Configurar e iniciar el frontend
cd ../frontend
npm install
npm run dev
La aplicación queda disponible en `http://localhost:5173`

## Estructura del proyecto
trackflow-logistics/
├── backend/
│   ├── scripts/
│   │   └── seed.js          # Generación de 1.5M documentos
│   ├── src/
│   │   ├── models/          # Esquemas Mongoose
│   │   └── routes/
│   │       └── queries.js   # Endpoints Q1, Q2, Q3
│   ├── index.js             # Servidor Express
│   └── .env                 # Variables de entorno (no subir)
└── frontend/
└── src/
├── components/      # Q1.jsx, Q2.jsx, Q3.jsx, Navbar.jsx
└── App.jsx
