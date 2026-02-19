import Image from "next/image";

export function About() {
  return (
    <section id="about" className="min-h-[80svh] px-6 py-20 xl:py-26 bg-muted/30 items-center flex">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-muted-foreground mb-2">03</p>
          <h2 className="text-3xl md:text-5xl tracking-tight">ABOUT</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-6 text-lg">
            <p>
              A photographer and creative exploring landscapes, architecture and cultures.
              The relationship between space, light, and human experience drives this work.
            </p>
            <p>
              Every project is a chance to bridge creative disciplines and challenge
              traditional approaches to visual storytelling.
            </p>
          </div>

          <div className="flex justify-end items-center">
            <Image 
              src="/Me_Sun2.svg"  
              alt="About Image"
              width={1600}
              height={900}
              className=" h-full w-full lg:w-4/5 rounded-xs aspect-4/3 sm:aspect-video object-cover grayscale"
              />

          </div>
        </div>
      </div>
    </section>
  );
}
