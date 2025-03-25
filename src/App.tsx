import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import CreateQueue from "./pages/CreateQueue";
import JoinQueue from "./pages/JoinQueue";
import ManageQueue from "./pages/ManageQueue";
import ViewQueue from "./pages/ViewQueue";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateQueue />} />
            <Route path="/join" element={<JoinQueue />} />
            <Route path="/join/:queueId" element={<JoinQueue />} />
            <Route path="/manage/:queueId" element={<ManageQueue />} />
            <Route path="/view/:queueId" element={<ViewQueue />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
