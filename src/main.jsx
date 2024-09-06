import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Root from './routes/root.jsx';
import ErrorPage from './errorPage.jsx';
import SinglePlay from './SinglePlay.jsx';
import CoopPlay from './CoopPlay.jsx';
import Competition from './Competition.jsx';
import Profile from './Profile.jsx';
import Dashboard from './Dashboard.jsx';
import Index from './routes/index.jsx';
import Impressum from './Impressum.jsx';


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
        element: <SinglePlay />,
      },
      {
        path: "coop",
        element: <CoopPlay />,
      },
      {
        path: "competition",
        element: <Competition />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "impressum",
        element: <Impressum />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
