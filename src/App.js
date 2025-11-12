import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import ShoppingListsPage from "./ShoppingListsPage";
import ShoppingListDetail from "./ShoppingListDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/shopping-lists" />} />

        <Route path="/shopping-lists" element={<ShoppingListsPage />} />

        <Route path="/shopping-list/:id" element={<ShoppingListDetail />} />

        <Route path="*" element={<h2>404 - Page not found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
