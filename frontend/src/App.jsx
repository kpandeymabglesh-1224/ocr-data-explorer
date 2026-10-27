import { NavLink, Route, Routes } from "react-router-dom";
import { TablesProvider } from "./TablesContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TablesPage from "./pages/TablesPage.jsx";
import About from "./pages/About.jsx";

function App() {
  return (
    <TablesProvider>
      <div className="app">
        <header className="topbar">
          <div className="brand">ocr&#8209;data&#8209;explorer</div>
          <nav className="nav">
            <NavLink to="/" end className="navlink">
              Dashboard
            </NavLink>
            <NavLink to="/tables" className="navlink">
              Tables
            </NavLink>
            <NavLink to="/about" className="navlink">
              About the project
            </NavLink>
          </nav>
          <span className="pill">MongoDB &#183; localhost:27017</span>
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<p className="error">Page not found.</p>} />
          </Routes>
        </main>

        <footer className="footer">
          Manglesh Kumar Pandey &#183; Full Stack Development mini project &#183; MERN
        </footer>
      </div>
    </TablesProvider>
  );
}

export default App;
