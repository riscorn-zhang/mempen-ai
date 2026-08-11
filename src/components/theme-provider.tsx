/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { useSetting } from "@/lib/settings"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches
    ? "dark"
    : "light"
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")

  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )

  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {

  const [display, updateDisplay] = useSetting(
    "display",
  )

  const theme = display.theme

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      updateDisplay(draft => {
        draft.theme = nextTheme
      })
    },
    [updateDisplay]
  )

  const applyTheme = React.useCallback(
    (nextTheme: Theme) => {
      const root = document.documentElement

      const resolvedTheme =
        nextTheme === "system"
          ? getSystemTheme()
          : nextTheme

      const restoreTransitions =
        disableTransitionOnChange
          ? disableTransitionsTemporarily()
          : null

      root.classList.remove("light", "dark")
      root.classList.add(resolvedTheme)

      if (restoreTransitions) {
        restoreTransitions()
      }
    },
    [disableTransitionOnChange]
  )

  React.useEffect(() => {
    applyTheme(theme)

    if (theme !== "system") {
      return
    }

    const mediaQuery =
      window.matchMedia(COLOR_SCHEME_QUERY)

    const handleChange = () => {
      applyTheme("system")
    }

    mediaQuery.addEventListener(
      "change",
      handleChange
    )

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange
      )
    }

  }, [theme, applyTheme])


  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  )


  return (
    <ThemeProviderContext.Provider
      {...props}
      value={value}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}


export const useTheme = () => {
  const context = React.useContext(
    ThemeProviderContext
  )

  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider"
    )
  }

  return context
}