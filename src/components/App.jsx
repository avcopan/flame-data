import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Layout from "./Layout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import actions from "../state/actions";

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);

  useEffect(() => {
    dispatch(actions.getUser());
  }, [dispatch]);

  return (
    <Layout>
      <Routes>
        <Route exact path="/" Component={HomePage} />
        <Route
          exact
          path="/login/:mode?"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route path="*" Component={NotFoundPage} />
      </Routes>
    </Layout>
  );
}
