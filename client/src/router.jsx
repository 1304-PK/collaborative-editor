import { createBrowserRouter } from "react-router-dom";

// Import pages
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";

// Import components
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const router = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedRoute>
            <LandingPage />
        </ProtectedRoute>
    },
    {
        path: "/auth/login",
        element: <PublicRoute>
            <Login />
        </PublicRoute>
    },
    {
        path: "/auth/signup",
        element: <PublicRoute>
            <SignUp />
        </PublicRoute>
    },
    {
        path: "/dashboard",
        element: <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    }
])

export default router