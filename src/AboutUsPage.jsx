import founderImage from './assets/founder.jpg';
import logo from './assets/logo.png';
import SiteFooter from './SiteFooter';
import { defaultProjectCategory } from './projectData';
import './about-us.css';

const founders = [
  {
    name: 'PRINCE MANIYAR',
    role: '(Interior Designer)',
    className: 'founder-card founder-left',
    imageClassName: 'founder-image founder-image-jigar',
    image: founderImage
  },
  {
    name: 'MAHIPAL NAKUM',
    role: '(Interior Designer)',
    className: 'founder-card founder-right',
    imageClassName: 'founder-image founder-image-dushyant',
    image: founderImage
  }
];

function AboutUsPage({ onNavigate }) {
  return (
    <div className="about-route">
      <header className="about-topbar">
        <div className="about-logo-badge" aria-label="Ideora Design Studio">
          <img src={logo} alt="Logo" />
        </div>
        <nav className="about-topnav">
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

      <main className="about-page">
        <section className="about-hero">
          <div className="about-hero-shell">
            <h1>What We Do...</h1>
            <div className="about-intro">
              <p>
                Ideora Design Studio is a multidisciplinary design firm driven by creativity, precision,
                and a deep understanding of space. Backed by a passionate and experienced team of designers,
                we specialize in crafting interiors that are thoughtful, functional, and visually compelling.
              </p>
              <p>
                We work closely with every client to develop tailor-made design solutions that reflect individual
                personality, purpose, and long-term value. Our approach is rooted in collaboration,
                ensuring that each project feels personal, refined, and meaningful.
                Along with design, we offer complete turnkey solutions, managing projects from concept to execution.
                From planning and material selection to on-site coordination and final delivery,
                we ensure a seamless and stress-free experience for our clients.
              </p>
            </div>
          </div>
        </section>

        <section className="founders-section" aria-label="Founders">
          {founders.map((founder) => (
            <article key={founder.name} className={founder.className}>
              <div className={founder.imageClassName}>
                <img src={founder.image} alt={founder.name} className="founder-photo" />
              </div>

              <div className="founder-copy">
                <h2>{founder.name}</h2>
                <p>{founder.role}</p>
              </div>
            </article>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default AboutUsPage;
