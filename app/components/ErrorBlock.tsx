type Props = {
  title: string
  reason?: any
}

export function ErrorBlock({title, reason}: Props) {
  return (
    <>
      <h1 className="text-xl font-bold">{title}</h1>
      {reason ? <p className="mt-4">{reason}</p> : null}
    </>
  )
}
