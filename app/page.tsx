import { Suspense } from "react";
import { About } from "./components/Sections/Home/About";
import { Contact } from "./components/Sections/Home/Contact";
import { Hero } from "./components/Sections/Home/Hero";
import { Projects } from "./components/Sections/Home/Projects";
import { ProjectsSkeleton } from "./components/Sections/Home/ProjectsSkeleton";

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
