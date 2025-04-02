// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Spinner from "./SmallerComponents/Spinner"; 

export default function PrivateRoute({ children }) {
  const { currentUser, loading } = useUser();

  if (loading) return <Spinner />; 

  if (!currentUser) return <Navigate to="/" replace />;

  return children;
}
