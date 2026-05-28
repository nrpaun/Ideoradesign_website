import { useEffect, useMemo, useState } from 'react';
import logo from './assets/logo.png';
import heroimage1 from './assets/heroimage1.jpeg';
import heroimage2 from './assets/heroimage2.jpeg';
import heroimage3 from './assets/heroimage3.jpeg';
import SiteFooter from './SiteFooter';
import { defaultProjectCategory, getProjectCategoriesWithImages } from './projectData';

const fallbackHeroSlides = [
  {
    image: heroimage1,
    quote: 'Creativity Is A Wild Mind And A Disciplined Eye.'
  },
  {
    image: heroimage2,
    quote: 'Do not efforts too much to be creative,simplicity will describe it...'
  },
  {
    image: heroimage3,
    quote: 'A person who never made a mistake never tried anything new.'
  }
];

const services = [
  {
    number: '01',
    title: 'Residential Interior',
    description: "It's powerful, essential part of our daily lives & affects how we live, work & play.",
    image: 'https://picsum.photos/seed/jeepee-service-1/900/650'
  },
  {
    number: '02',
    title: 'Commercial Interior',
    description: 'Designing places of all kinds for both public and private businesses.',
    image: 'https://picsum.photos/seed/jeepee-service-2/900/650'
  },
  {
    number: '03',
    title: 'Turnkey Solutions',
    description: 'Specialized Turnkey Interior Solutions offering competitive cost certainty',
    image: 'https://picsum.photos/seed/jeepee-service-3/900/650'
  }
];

function HomePage({ onNavigate }) {
  const [activeProject, setActiveProject] = useState('Residential');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [homepageImages, setHomepageImages] = useState([]);
  const [projectImages, setProjectImages] = useState([]);
  const [clientReviews, setClientReviews] = useState([]);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactPopup, setContactPopup] = useState({
    open: false,
    type: 'success',
    message: ''
  });

  const visibleTestimonials = useMemo(() => {
    if (clientReviews.length === 0) {
      return [];
    }

    return [
      clientReviews[testimonialIndex % clientReviews.length],
      clientReviews[(testimonialIndex + 1) % clientReviews.length],
      clientReviews[(testimonialIndex + 2) % clientReviews.length]
    ];
  }, [clientReviews, testimonialIndex]);

  const testimonialCount = clientReviews.length;

  const heroSlides = useMemo(() => {
    if (homepageImages.length === 0) {
      return fallbackHeroSlides;
    }

    return homepageImages.map((item) => ({
      image: item.image_url,
      quote: item.quote
    }));
  }, [homepageImages]);
  const activeHeroSlide = heroSlides[2] || heroSlides[0];

  const portfolioCategories = useMemo(() => getProjectCategoriesWithImages(projectImages), [projectImages]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch('/api/home-images').then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch homepage images.');
        }

        return response.json();
      }),
      fetch('/api/project-images').then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch project images.');
        }

        return response.json();
      })
    ])
      .then(([homeImages, projectImageData]) => {
        if (isMounted) {
          setHomepageImages(homeImages);
          setProjectImages(projectImageData);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHomepageImages([]);
          setProjectImages([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/reviews')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch client reviews.');
        }

        return response.json();
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setClientReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) {
          setClientReviews([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const closePopup = () => {
    setContactPopup((prev) => ({ ...prev, open: false }));
  };

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactForm)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong while saving your message.');
      }

      setContactPopup({
        open: true,
        type: 'success',
        message: data.message || 'Your message was saved successfully.'
      });

      setContactForm({
        name: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (error) {
      setContactPopup({
        open: true,
        type: 'error',
        message:
          error.message === 'Failed to fetch'
            ? 'Unable to reach the contact server. Please make sure the API server is running.'
            : error.message || 'Failed to save your message.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="logo-badge" aria-label="JeePee Design Studio">
          <img src={logo} alt="Logo" />
        </div>
        <nav className="topnav">
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

      <section id="home" className="hero">
        <img src={activeHeroSlide.image} alt="Interior design hero" className="hero-bg" />
        <div className="overlay" />
        <div className="hero-content">
          <h1>{activeHeroSlide.quote}</h1>
        </div>
      </section>

      <main>
        <section id="about" className="section about">
          <div className="about-showcase">
            <div className="about-copy">
              <p className="about-display">ABOUT</p>
              <h2>Designing Goals</h2>
              <p className="about-text">
                From concept development to turnkey execution, our process is collaborative, detail-driven,
                and deeply practical. Every material, layout, and finish is chosen to create spaces that feel
                timeless, beautiful, and confidently lived in.
              </p>
              <a href="/about-us" className="btn" onClick={(event) => onNavigate(event, '/about-us')}>
                Read more
              </a>
            </div>

            <div className="about-logo-panel" aria-hidden="true">
              <div className="about-logo-frame">
                <img src={logo} alt="" className="about-logo-art" />
              </div>
            </div>
          </div>
        </section>

        <section className="section services">
          <p className="services-display">SERVICES</p>
          <h2>Why Choose Us</h2>
          <p className="section-intro services-intro">
            Good design and good relationships come from collaboration. We are excited to start a visual dialogue,
            learn about you, and make something beautiful together.
          </p>
          <div className="services-showcase">
            {services.map((item) => (
              <article key={item.number} className="service-panel">
                <header className="service-panel-header">
                  <div>
                    <span>{item.number}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <span className="service-chevron" aria-hidden="true">
                    &#8964;
                  </span>
                </header>
                <div className="service-panel-body">
                  <p>{item.description}</p>
                  <img src={item.image} alt={item.title} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="section projects">
          <p className="project-display">PROJECTS</p>
          <h2>Portfolio</h2>
          <p className="section-intro">
            Ideora Design Studio transforms spaces into interiors that blend function with beauty and
            sophistication. Our designs creatively balance space, color, light, and furnishings.
          </p>
          <div
            className={`portfolio-slider ${activeProject ? 'has-active' : ''}`}
            role="tablist"
            aria-label="Portfolio slider"
            onMouseLeave={() => setActiveProject('Residential')}
          >
            {portfolioCategories.map((item) => (
              <button
                type="button"
                key={item.slug}
                role="tab"
                aria-selected={item.name === activeProject}
                className={`portfolio-slide ${item.name === activeProject ? 'active' : ''}`}
                onMouseEnter={() => setActiveProject(item.name)}
                onFocus={() => setActiveProject(item.name)}
                onClick={(event) => {
                  setActiveProject(item.name);
                  onNavigate(event, `/projects/${item.slug}`);
                }}
                style={{ backgroundImage: `url(${item.coverImage})` }}
              >
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </section>

        {clientReviews.length > 0 && (
          <section className="section testimonials">
            <p className="label">TESTIMONIALS</p>
            <h2>Happy Clients</h2>

            <div className="slider-nav">
              <button
                type="button"
                onClick={() => setTestimonialIndex((prev) => (prev - 1 + testimonialCount) % testimonialCount)}
              >
                Previous
              </button>
              <button type="button" onClick={() => setTestimonialIndex((prev) => (prev + 1) % testimonialCount)}>
                Next
              </button>
            </div>

            <div className="cards testimonial-grid">
              {visibleTestimonials.map((item, idx) => (
                <article key={`${item.name}-${idx}`} className="card testimonial-card">
                  <img src={item.photo_url || `https://picsum.photos/seed/${item.name}/140/140`} alt={item.name} className="avatar" />
                  {item.rating && (
                    <p className="review-rating" aria-label={`${item.rating} out of 5 stars`}>
                      {item.rating}/5 client review
                    </p>
                  )}
                  <p>"{item.quote}"</p>
                  <h3>- {item.name}</h3>
                </article>
              ))}
            </div>
          </section>
        )}

        <section id="contact" className="section contact">
          <h2 className='contact-display'>Get In Touch</h2>
          <div className="contact-grid">
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={handleContactChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={contactForm.phone}
                onChange={handleContactChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={contactForm.email}
                onChange={handleContactChange}
                required
              />
              <textarea
                rows="5"
                name="message"
                placeholder="Your Message"
                value={contactForm.message}
                onChange={handleContactChange}
                required
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
            <aside className="contact-info">
              <h3>Ideora Design Studio</h3>
              <p>Rajkot, Gujarat</p>
              <p>+91 96380 70792</p>
              <p>www.ideoradesignstudio.com</p>
              <p>Mon - Sat : 10:00 AM to 7:00 PM</p>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />

      {contactPopup.open && (
        <div className="popup-backdrop" role="presentation" onClick={closePopup}>
          <div
            className={`popup-card popup-${contactPopup.type}`}
            role="alertdialog"
            aria-modal="true"
            aria-live="assertive"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>{contactPopup.type === 'success' ? 'Success' : 'Error'}</h3>
            <p>{contactPopup.message}</p>
            <button type="button" className="popup-btn" onClick={closePopup}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
