import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Layout from "./Layout";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import DetailPage from "../pages/DetailPage";
import FormPage from "../pages/FormPage";
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
        <Route exact path="/" element={<HomePage />} />
        <Route
          exact
          path="/species/details/:id"
          element={<DetailPage isReaction={false} />}
        />
        <Route
          exact
          path="/reaction/details/:id"
          element={<DetailPage isReaction={true} />}
        />
        <Route
          exact
          path="/login/:mode?"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />
        {user && <Route exact path="/submit" element={<FormPage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
