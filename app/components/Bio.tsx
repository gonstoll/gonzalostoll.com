export default function Bio({isHome = false}: {isHome?: boolean}) {
  if (isHome) {
    return (
      <p className="text-xl">
        Hola! I'm Gonzalo, a Senior Frontend developer in Copenhagen. I enjoy
        mentoring and delivering quality code for complex web applications,
        using modern tech and practices. Feel free to check out my coding skills
        on{' '}
        <a
          className="hover:text-primary"
          href="https://github.com/gonstoll"
          target="_blank"
          rel="noopener noreferrer"
        >
          my GitHub page
        </a>
        .
      </p>
    )
  }

  return (
    <p className="text-xl">
      Hi there! My name is Gonzalo Stoll, I'm a Senior Frontend developer based
      in Copenhagen, Denmark. I take pride in mentoring junior developers and
      helping teams deliver performant and high-quality code. With extensive
      experience in building complex web applications using modern frontend
      development practices and technologies, I'm passionate about writing
      clean, scalable and maintainable code, delivering seamless user
      experiences.
    </p>
  )
}
