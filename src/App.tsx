import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import routes from "tempo-routes";
import Home from "./components/home";
import ReportBuilder from "./components/ReportBuilder";
import ProfileSettings from "./components/ProfileSettings";
import { Toaster } from "./components/ui/toaster";
import Signup from "./pages/auth/signup";
import Login from "./pages/auth/Login";
import { supabase } from "./types/supabase";
import Users from "./components/Users";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/signup" />} />
          <Route path="/report/new" element={<ReportBuilder />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/users" element={<Users />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        <Toaster />
      </>
    </Suspense>
  );
}

export default App;
