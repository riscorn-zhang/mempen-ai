import { createBrowserRouter } from "react-router-dom";
import routes from "~react-pages";
import MainLayout from "@/layouts/main-layout";

export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: routes,
    },
]);
