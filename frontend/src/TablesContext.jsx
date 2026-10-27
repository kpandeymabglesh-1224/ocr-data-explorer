// TablesContext.jsx - the list of tables is fetched once and shared with every
// page through React Context, so the dropdown and the dashboard do not each
// have to fetch it.
import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE, getJSON } from "./api";

const TablesContext = createContext(null);

export function TablesProvider({ children }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    getJSON(API_BASE + "/tables")
      .then(function (list) {
        setTables(list);
        setError("");
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  const value = { tables: tables, loading: loading, error: error };

  return <TablesContext.Provider value={value}>{children}</TablesContext.Provider>;
}

// Custom hook so components can just call useTables().
export function useTables() {
  return useContext(TablesContext);
}
