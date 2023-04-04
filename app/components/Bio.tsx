export default function Bio({isHome = false}: {isHome?: boolean}) {
  return (
    <p className="text-xl">
      {isHome
        ? "Hola! I'm Gonzalo, a Senior Frontend developer in Copenhagen. I enjoy mentoring and delivering quality code for complex web applications, using modern tech and practices."
        : "Hi there! My name is Gonzalo Stoll, I'm a Senior Frontend developer based in Copenhagen, Denmark. I take pride in mentoring junior developers and helping teams deliver performant and high-quality code. With extensive experience in building complex web applications using modern frontend development practices and technologies, I'm passionate about writing clean, scalable and maintainable code, delivering seamless user experiences."}
    </p>
  )
}
