import { useEffect, useState } from 'react';
import logo from './assets/logo.png';
import SiteFooter from './SiteFooter';
import {
  defaultProjectCategory,
  getProjectCategoriesWithImages,
  getProjectCategoryFromList
} from './projectData';
import './projects.css';

function ProjectsPage({ onNavigate, categorySlug = defaultProjectCategory }) {
  const [projectImages, setProjectImages] = useState([]);
  const categories = getProjectCategoriesWithImages(projectImages);
  const activeCategory = getProjectCategoryFromList(categories, categorySlug);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/project-images')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch project images.');
        }

        return response.json();
      })
      .then((images) => {
        if (isMounted) {
          setProjectImages(images);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProjectImages([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="projects-route">
      <header className="projects-topbar">
        <div className="projects-logo-badge" aria-label="Ideora Design Studio">
          <img src={logo} alt="Logo" />
        </div>

        <nav className="projects-topnav">
          <a href="/" onClick={(event) => onNavigate(event, '/')}>
            Home
          </a>
          <a href="/about-us" onClick={(event) => onNavigate(event, '/about-us')}>
            About
          </a>
          <a href={`/projects/${defaultProjectCategory}`} onClick={(event) => onNavigate(event, `/projects/${defaultProjectCategory}`)}>
            Projects
          </a>
          <a href="/contact" onClick={(event) => onNavigate(event, '/contact')}>
            Contact
          </a>
        </nav>
      </header>

      <main className="projects-page">
        <section className="projects-hero">
          <div className="projects-hero-shell">
            <h1>{activeCategory.headline}</h1>
            <p className="projects-quote">
              {activeCategory.quote} <span>- {activeCategory.quoteAuthor}</span>
            </p>
            <p className="projects-description">{activeCategory.description}</p>

            <div className="projects-switcher" role="tablist" aria-label="Project categories">
              {categories.map((category) => (
                <a
                  key={category.slug}
                  href={`/projects/${category.slug}`}
                  role="tab"
                  aria-selected={category.slug === activeCategory.slug}
                  className={`project-switch ${category.slug === activeCategory.slug ? 'active' : ''}`}
                  onClick={(event) => onNavigate(event, `/projects/${category.slug}`)}
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {activeCategory.projects.length > 0 ? (
          <section className={`project-gallery ${activeCategory.slug === 'details' ? 'details-gallery' : ''}`}>
            {activeCategory.projects.map((project) => (
              <article
                key={project.id || project.title}
                className={`project-card ${activeCategory.slug === 'details' ? 'details-card' : ''}`}
              >
                <img src={project.image} alt={project.title} />
                {activeCategory.slug !== 'details' && (
                  <div className="project-card-copy">
                    <p>{project.title}</p>
                  </div>
                )}
              </article>
            ))}
          </section>
        ) : (
          <section className="project-empty-state">
            <p>No projects added in this category yet.</p>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

export default ProjectsPage;
