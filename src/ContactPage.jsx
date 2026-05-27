import logo from './assets/logo.png';
import heroimage2 from './assets/heroimage2.jpeg';
import SiteFooter from './SiteFooter';
import { defaultProjectCategory } from './projectData';
import './contact.css';

function ContactPage({ onNavigate }) {
  return (
    <div className="contact-route">
      <header className="contact-topbar">
        <div className="contact-logo-badge" aria-label="Ideora Design Studio">
          <img src={logo} alt="Logo" />
        </div>

        <nav className="contact-topnav">
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

      <main className="contact-page">
        <section className="contact-hero">
          <h1>CONTACT US</h1>

          <div className="contact-showcase">
            <div className="contact-visual">
              <img src={heroimage2} alt="Studio interior" className="contact-room-image" />

              <div className="contact-card">
                <div className="contact-item contact-address">
                  <a
                    href="https://www.google.com/maps?q=IDEORA+DESIGN+STUDIO+Rajkot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 22s7-7.02 7-12a7 7 0 1 0-14 0c0 4.98 7 12 7 12Zm0-8.5A3.5 3.5 0 1 1 12 6a3.5 3.5 0 0 1 0 7.5Z" />
                    </svg>
                  </a>
                  <div>
                    <h2>Ideora Design Studio</h2>
                    <p>509- The Corporate World</p>
                    <p>speed well party plot</p>
                    <p>Opp, Suvarna Bhoomi</p>
                    <p>Nana Mava , Rajkot</p>
                    <p>360005</p>
                  </div>
                </div>

                <div className="contact-item">
                  <a href="tel:+919638070792" className="call-link">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.32.56 3.57.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.06 21 3 13.94 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.19 2.45.56 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2Z" />
                    </svg>
                  </a>
                  <p>+91-96380 70792
                    <p>+91-70482 21222</p>
                  </p>
                </div>

                <div className="contact-item">
                  <a
                    href="mailto:ideoradesigningstudio@gmail.com"
                    className="email-link"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.2L12 13l8-5.8V7H4Zm16 10V9.67l-7.41 5.37a1 1 0 0 1-1.18 0L4 9.67V17h16Z" />
                    </svg>
                  </a>
                  <p>ideoradesigningstudio@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="contact-map-panel">
              <iframe
                title="Ideora Design Studio location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.428347377571!2d70.76019617604959!3d22.261758244289837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959cb6c16d14441%3A0x8d859525279afda2!2sIDEORA%20DESIGN%20STUDIO!5e0!3m2!1sen!2sin!4v1777630482861!5m2!1sen!2sin"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default ContactPage;
