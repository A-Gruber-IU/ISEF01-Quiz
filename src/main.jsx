import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Root from './routes/root.jsx';
import ErrorPage from './errorPage.jsx';
import SinglePlay from './Game/SinglePlay.jsx';
import CoopPlay from './Game/CoopPlay.jsx';
import Competition from './Game/Competition.jsx';
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
