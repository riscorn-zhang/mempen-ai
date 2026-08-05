import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"

import "./index.css"
import { router } from "@/routes"
import { ThemeProvider, useTheme } from "@/components/theme-provider.tsx"
import { useSetting } from "@/stores/settings"

type Theme = 'light' | 'dark' | 'system'

function SettingsBootstrap({ children }: { children: React.ReactNode }) {
  const [theme] = useSetting<Theme>('theme', 'system')
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])

  return children
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <SettingsBootstrap>
        <RouterProvider router={router} />
      </SettingsBootstrap>
    </ThemeProvider>
  </StrictMode>
)
