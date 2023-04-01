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
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute transition duration-500 motion-reduce:transition-none dark:translate-y-10 dark:opacity-30"
    >
      <path d="M7.83002 0.830169C5.58658 3.71256 5.78958 7.88205 8.43904 10.5315C11.0885 13.181 15.258 13.384 18.1404 11.1405C17.8222 12.8208 17.013 14.4264 15.7125 15.7268C12.2694 19.17 6.68687 19.17 3.24369 15.7268C-0.19948 12.2837 -0.19948 6.70119 3.24369 3.25802C4.54414 1.95757 6.14975 1.14829 7.83002 0.830169Z" />
    </svg>
  )

  const sunIcon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute translate-y-10 opacity-30 transition duration-500 motion-reduce:transition-none dark:translate-y-0 dark:opacity-100"
    >
      <path d="M16.5 11C16.5 14.0376 14.0376 16.5 11 16.5C7.96243 16.5 5.5 14.0376 5.5 11C5.5 7.96243 7.96243 5.5 11 5.5C14.0376 5.5 16.5 7.96243 16.5 11Z" />
      <path d="M10.0833 0H11.9167V2.75H10.0833V0Z" />
      <path d="M10.0833 19.25H11.9167V22H10.0833V19.25Z" />
      <path d="M22 10.0833V11.9167H19.25V10.0833H22Z" />
      <path d="M2.75 10.0833V11.9167H0L8.01376e-08 10.0833H2.75Z" />
      <path d="M18.13 2.57365L19.4263 3.87001L17.4818 5.81456L16.1854 4.51819L18.13 2.57365Z" />
      <path d="M4.51818 16.1855L5.81454 17.4818L3.87 19.4264L2.57364 18.13L4.51818 16.1855Z" />
      <path d="M19.4264 18.13L18.13 19.4264L16.1854 17.4818L17.4818 16.1855L19.4264 18.13Z" />
      <path d="M5.81454 4.51821L4.51818 5.81457L2.57364 3.87003L3.87 2.57367L5.81454 4.51821Z" />
    </svg>
  )

  return (
    <>
      {moonIcon}
      {sunIcon}
    </>
  )
}
