import type { RouteObject } from "react-router-dom";
import { Layout } from "./ui/Layout";
import { PRListPage } from "./pages/PRListPage";
import { PRDetailPage } from "./pages/PRDetailPage";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: <PRListPage /> },
      { path: "/pr/:id", element: <PRDetailPage /> },
    ],
  },
];
