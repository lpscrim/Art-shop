import { Suspense } from "react";
import { About } from "./_components/Sections/Home/About";
import { Contact } from "./_components/Sections/Home/Contact";
import { Hero } from "./_components/Sections/Home/Hero";
import { Projects } from "./_components/Sections/Home/Projects";
import { ProjectsSkeleton } from "./_components/Sections/Home/ProjectsSkeleton";

export default function Home() {
  return (
    <main className="min-h-lvh">
      <Hero />
      <Suspense fallback={<ProjectsSkeleton />}>
        <Projects />
      </Suspense>
      <About />
      <Contact />
    </main>
  );
}
