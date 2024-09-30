import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./root.jsx";
import ErrorPage from "./errorPage.jsx";
import SingleGame from "./Game/SingleGame.jsx";
import CoopGame from "./Game/CoopGame.jsx";
import CompetitionGame from "./Game/CompetitionGame.jsx";
import Profile from "./User/Profile.jsx";
import Dashboard from "./Dashboard.jsx";
import Index from "./Startpage/index.jsx";
import Impressum from "./Info/Impressum.jsx";
import Datenschutz from "./Info/Datenschutz.jsx";
import Faqs from "./Info/Faqs.jsx";
import SubmitQuestion from "./SubmitQuestion/SubmitQuestion.jsx";
import Results from "./Game/Results.jsx";
import ReviewQuestion from "./ReviewQuestion/ReviewQuestion.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Index /> },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "single",
        element: <SingleGame />,
      },
      {
        path: "coop/:gameId",
        element: <CoopGame />,
      },
      {
        path: "competition/:gameId",
        element: <CompetitionGame />,
      },
      {
        path: "results/:gameId",
        element: <Results />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "submitquestion",
        element: <SubmitQuestion />,
      },
      {
        path: "/reviewquestion",
        element: <ReviewQuestion />,
      },
      {
        path: "impressum",
        element: <Impressum />,
      },
      {
        path: "datenschutz",
        element: <Datenschutz />,
      },
      {
        path: "faq",
        element: <Faqs />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastContainer />
    <RouterProvider router={router} />
  </StrictMode>
);
