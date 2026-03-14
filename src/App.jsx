import React from "react";
import HomePage from "./pages/home/HomePage";
import Layout from "./components/Layout/Layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error from "./pages/error/Error";
import Scratch from "./pages/scratch/Scratch";
import RedeemForm from "./pages/RedeemForm/RedeemForm";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "reward",
        element: <Scratch />,
      },
      {
        path: "redeem",
        element: <RedeemForm />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
