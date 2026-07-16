import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import KnowledgePage from '@/pages/KnowledgePage';
import PlanPage from '@/pages/PlanPage';
import ChatPage from '@/pages/ChatPage';
import SettingsPage from '@/pages/SettingsPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'knowledge/*', element: <KnowledgePage /> },
            { path: 'plan', element: <PlanPage /> },
            { path: 'chat', element: <ChatPage /> },
            { path: 'settings', element: <SettingsPage /> },
        ],
    },
]);