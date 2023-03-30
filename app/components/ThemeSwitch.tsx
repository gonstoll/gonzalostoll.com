import {useTheme} from '~/utils/theme-provider'

export default function ThemeSwitch() {
  const {theme, setTheme} = useTheme()

  return (
    <button
      aria-label={`Activate ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Activate ${theme === 'light' ? 'dark' : 'light'} mode`}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black text-white dark:bg-white dark:text-black"
    >
      <Icons />
    </button>
  )
}

function Icons() {
  const moonIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="absolute transition duration-500 motion-reduce:transition-none dark:translate-y-10 dark:opacity-30"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  )

  const sunIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="absolute translate-y-10 opacity-30 transition duration-500 motion-reduce:transition-none dark:translate-y-0 dark:opacity-100"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  )

  return (
    <>
      {moonIcon}
      {sunIcon}
    </>
  )
}
