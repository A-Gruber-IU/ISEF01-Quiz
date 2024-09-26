import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Root from './root.jsx';
import ErrorPage from './errorPage.jsx';
import SingleGame from './Game/SingleGame.jsx';
import CoopRoute from './Game/CoopRoute.jsx';
import CompetitionRoute from './Game/CompetitionRoute.jsx';
import Profile from './User/Profile.jsx';
import Dashboard from './Dashboard.jsx';
import Index from './Startpage/index.jsx';
import Impressum from './Info/Impressum.jsx';
import Datenschutz from './Info/Datenschutz.jsx';
import Faqs from './Info/Faqs.jsx';

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
        element: <CoopRoute />,
      },
      {
        path: "competition/:gameId",
        element: <CompetitionRoute />,
      },
      {
        path: "profile",
        element: <Profile />,
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
