import { Suspense } from "react";
import { getProjects } from "../data/projects";
import { WorkGallery } from "../components/Sections/Work/WorkGallery";



export default async function WorkPage() {
  const projects = await getProjects();

  // All pictures in all projects
  const allPhotos = projects.flatMap(project => [project.imageUrl, ...(project.galleryImages || [])]);

  // Count categories
  const categoryCounts = projects.reduce((acc, project) => {
    project.categories.forEach((category) => {
      acc[category] = (acc[category] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Sort by count (descending)
  const sortedCategories = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <main>
      <Suspense fallback={null}>
        <WorkGallery 
          projects={projects} 
          categoryCounts={sortedCategories} 
          allPhotos={allPhotos} 
        />
      </Suspense>
    </main>
  );
}
