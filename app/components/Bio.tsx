function calculateAge() {
  const birthday = new Date('1990-11-21')
  const today = Date.now()
  const diff = today - birthday.getTime()
  const ageDate = new Date(diff) // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

export function Bio() {
  const years = calculateAge()

  return (
    <>
      <p className="text-xl">
        Hi there! My name is Gonzalo Stoll, I'm a Senior Frontend developer
        based in Copenhagen, Denmark. I take pride in mentoring junior
        developers and helping teams deliver performant and high-quality code.
        With extensive experience in building complex web applications using
        modern frontend development practices and technologies, I'm passionate
        about writing clean, scalable and maintainable code, delivering seamless
        user experiences.
      </p>
      <p className="mt-6 text-xl">
        I was born in Cordoba, Argentina, {years} years ago. Growing up I’ve
        always been keen on user interfaces and experience which led me to
        become the developer I am today.
      </p>
      <p className="mt-6 text-xl">
        From a young age, I’ve always been a fan of sports. Of course playing
        them was super entertaining (fun fact, I practiced football, tennis,
        basketball, rugby and swimming), but my love for them was different. I
        wanted to become a sports journalist.
      </p>
      <p className="mt-6 text-xl">
        Adolescence kicked in, and so did my profound love for movies and
        series. I developed a deep connection with the format in which stories
        are told with them. Reading scripts and watching movies became a hobby
        of mine, to the point where I started writing my own screenplays and
        taking part in various contests.
      </p>
      <p className="mt-6 text-xl">
        Today, I’m happily married with my best friend. She’s my rock, the best
        companion and what keeps me motivated. She’s a Product Designer, which
        also complements nicely with my greatest hobby of all: programming. We
        have our own space called South Studio, where we try new things, get
        creative and practice.
      </p>
      <p className="mt-6 text-xl">
        I’ve also been having a blast building custom mechanical keyboards
        (built 5 so far). It keeps me focused and it’s a nice therapeutic
        channel where I can clear my mind and rejoice.
      </p>
    </>
  )
}
