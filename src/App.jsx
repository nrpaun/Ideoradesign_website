import { useEffect, useState } from 'react';
import AdminPage from './AdminPage';
import AboutUsPage from './AboutUsPage';
import ContactPage from './ContactPage';
import HomePage from './HomePage';
import ProjectsPage from './ProjectsPage';
import { defaultProjectCategory } from './projectData';

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (event, nextPath) => {
    if (event) {
      event.preventDefault();
    }

    const [pathname, hash] = nextPath.split('#');

    if (`${window.location.pathname}${window.location.hash}` !== nextPath) {
      window.history.pushState({}, '', nextPath);
      setPath(pathname || '/');
    }

    if (hash) {
      requestAnimationFrame(() => {
        const target = document.getElementById(hash);

        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (path === '/about-us') {
    return <AboutUsPage onNavigate={handleNavigate} />;
  }

  if (path === '/projects' || path.startsWith('/projects/')) {
    const categorySlug = path.split('/')[2] || defaultProjectCategory;
    return <ProjectsPage onNavigate={handleNavigate} categorySlug={categorySlug} />;
  }

  if (path === '/contact') {
    return <ContactPage onNavigate={handleNavigate} />;
  }

  if (path === '/admin') {
    return <AdminPage onNavigate={handleNavigate} />;
  }

  return <HomePage onNavigate={handleNavigate} />;
}

export default App;
