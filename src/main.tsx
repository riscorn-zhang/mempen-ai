import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"

import "./index.css"
import { router } from "@/routes"
import { ThemeProvider, useTheme } from "@/components/theme-provider.tsx"
import useSettingsStore from "@/stores/settings"

function SettingsBootstrap({ children }: { children: React.ReactNode }) {
  const load = useSettingsStore((s) => s.load)
  const theme = useSettingsStore((s) => s.theme)
  const { setTheme } = useTheme()

  useEffect(() => {
    void load()
  }, [load])

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
