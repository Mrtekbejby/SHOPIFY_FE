import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import ShoppingListsPage from "./ShoppingListsPage";
import ShoppingListDetail from "./ShoppingListDetail";

import { translations } from "./i18n";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "en";
  });

  const t = (key, vars = {}) => {
    const str = translations[lang]?.[key] ?? key;
    return Object.keys(vars).reduce(
      (acc, k) => acc.replaceAll(`{${k}}`, vars[k]),
      str
    );
  };

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/shopping-lists" />} />

        <Route path="/shopping-lists" element={
          <ShoppingListsPage
            theme={theme}
            onToggleTheme={toggleTheme}
            lang={lang}
            setLang={setLang}
            t={t} />
        }
        />

        <Route path="/shopping-list/:listId" element={
          <ShoppingListDetail
            theme={theme}
            onToggleTheme={toggleTheme}
            lang={lang}
            setLang={setLang}
            t={t} />
        }
        />

        <Route path="*" element={<h2>404 - Page not found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
