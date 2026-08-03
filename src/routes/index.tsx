import { createBrowserRouter } from "react-router-dom";
import routes from "~react-pages";
import MainLayout from "@/layouts/MainLayout";

export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: routes,
    },
]);
