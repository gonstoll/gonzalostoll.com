type Props = {
  title: string
  reason?: any
}

export default function ErrorBlock({title, reason}: Props) {
  return (
    <div className="bg-red-300 rounded-md p-4 text-red-600">
      <h1 className="text-lg font-bold">{title}</h1>
      {reason ? (
        <div className="inline-block">
          <p className="inline-block">
            Here's a clue on what might've happened:
          </p>
          <pre className="inline-block ml-1">{reason}</pre>
        </div>
      ) : null}
    </div>
  )
}
