import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import PlanPage from '@/pages/PlanPage';
import ChatPage from '@/pages/ChatPage';
import OCRPage from '@/pages/OCRPage';
import { knowledgeRoute } from '@/pages/knowledge.route';
import { settingsRoute } from '@/pages/settings.route';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            knowledgeRoute,
            { path: 'plan', element: <PlanPage /> },
            { path: 'chat', element: <ChatPage /> },
            settingsRoute,
            { path: 'ocr', element: <OCRPage /> }
        ],
    },
]);
