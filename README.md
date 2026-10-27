# OCR Data Explorer — MERN mini project

A MERN application that showcases the results of my Devanagari OCR
data-efficiency study. Nine result tables are stored in MongoDB, served by an
Express REST API, and browsed one at a time from a React front end through a
dropdown selection menu.

Manglesh Kumar Pandey — Full Stack Development

---

## Stack

| Layer    | Technology                                            |
| -------- | ----------------------------------------------------- |
| Database | MongoDB (official `mongodb` driver, no Mongoose)      |
| Backend  | Node.js + Express, `cors`, `dotenv`                   |
| Frontend | React 18 with Vite, React Router                      |
| Charts   | Hand-written SVG (no charting library)                |

## Folder structure

```
mini_project/
├── backend/
│   ├── data/                  the nine CSV result files
│   ├── middleware/
│   │   ├── errorHandler.js    404 + central error handler
│   │   ├── logger.js          logs every request
│   │   └── validateRow.js     validates documents before insert/update
│   ├── routes/
│   │   ├── tables.js          GET / POST / PUT / DELETE for every table
│   │   └── stats.js           dashboard figures + chart series
│   ├── .env
│   ├── db.js                  single MongoDB connection
│   ├── seed.js                loads the CSVs into MongoDB
│   ├── server.js              the Express app
│   └── tableConfig.js         titles, descriptions and column definitions
└── frontend/
    ├── index.html
    └── src/
        ├── components/
        │   ├── CerChart.jsx   SVG line chart
        │   ├── DataTable.jsx  renders whatever columns the API sends
        │   └── RowForm.jsx    add / edit form built from the column list
        ├── pages/
        │   ├── About.jsx
        │   ├── Dashboard.jsx
        │   └── TablesPage.jsx the dropdown + table + description panel
        ├── api.js
        ├── App.jsx            routes and navigation
        ├── TablesContext.jsx  useContext: shares the table list
        ├── index.css
        └── main.jsx
```

## Running it

**Step 0 — create `backend/.env`** (it is not included in the download):

```
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=ocr_project
PORT=5000
```

That value is for a MongoDB installed on the same PC and running. If you use
MongoDB Atlas instead, paste your Atlas connection string as `MONGODB_URI`
(it starts with `mongodb+srv://`) and nothing else changes. On Atlas, make sure
the database user exists and your IP address is allowed under Network Access.

**Terminal 1 — backend**

```
cd backend
npm install
npm run seed      run once; loads the CSVs into MongoDB
npm start         http://localhost:5000
```

**Terminal 2 — frontend**

```
cd frontend
npm install
npm run dev       http://localhost:5173
```

Then open http://localhost:5173.

## API routes

| Method | Route                     | Purpose                                  |
| ------ | ------------------------- | ---------------------------------------- |
| GET    | `/api/health`             | server is alive                          |
| GET    | `/api/tables`             | list of tables for the dropdown          |
| GET    | `/api/tables/:key`        | one table: description, columns, rows    |
| POST   | `/api/tables/:key`        | add a document                           |
| PUT    | `/api/tables/:key/:id`    | update a document                        |
| DELETE | `/api/tables/:key/:id`    | delete a document                        |
| GET    | `/api/stats`              | dashboard figures and chart series       |

`GET /api/tables/:key` accepts `?page=`, `?limit=`, `?sort=`, `?order=` and
`?q=` for paging, sorting and searching.

## The tables

| # | Collection              | Contents                                        |
| - | ----------------------- | ----------------------------------------------- |
| 1 | `runs`                  | error rate per regime and label budget           |
| 2 | `cer_difference`        | each regime against training from scratch        |
| 3 | `annotation_saving`     | transcription work saved at a target error       |
| 4 | `sample_complexity`     | words needed to reach a target error             |
| 5 | `segment_slopes`        | how steeply the curve falls, segment by segment  |
| 6 | `benefit_decomposition` | encoder share of the pretraining benefit         |
| 7 | `sequence_benefit`      | value of transferring the sequence model         |
| 8 | `per_class_errors`      | errors by Devanagari character class             |
| 9 | `exact_matches`         | zero-shot exact hits and the synthetic corpus    |

## Concepts demonstrated

- React: `useState`, `useEffect`, `useContext`, `useRef`, controlled forms,
  component composition, React Router with three routes
- Express: routers, middleware (CORS, JSON body parsing, custom logging),
  data validation, centralised error handling, query parameters
- MongoDB: CRUD with the official driver, `countDocuments`, `find` with sort /
  skip / limit, a regex search filter, and an aggregation pipeline for the chart
