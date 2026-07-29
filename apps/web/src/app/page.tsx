import Image from 'next/image';

import { Navbar } from '../components/navbar';
import { ContactForm } from '../components/contactForm';
import { Footer } from '../components/footer';

// Social media profiles - Replace hrefs with the society's real page URLs
const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61579464920889',
    path: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/degyalmemorial',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zm0 1.802c-3.15 0-3.499.012-4.735.068-.94.043-1.75.204-2.31.764-.56.56-.721 1.37-.764 2.31-.056 1.236-.068 1.585-.068 4.735s.012 3.499.068 4.735c.043.94.204 1.75.764 2.31.56.56 1.37.721 2.31.764 1.236.056 1.585.068 4.735.068s3.499-.012 4.735-.068c.94-.043 1.75-.204 2.31-.764.56-.56.721-1.37.764-2.31.056-1.236.068-1.585.068-4.735s-.012-3.499-.068-4.735c-.043-.94-.204-1.75-.764-2.31-.56-.56-1.37-.721-2.31-.764-1.236-.056-1.585-.068-4.735-.068zm0 3.062a4.973 4.973 0 110 9.946 4.973 4.973 0 010-9.946zm0 1.802a3.171 3.171 0 100 6.342 3.171 3.171 0 000-6.342zm6.336-2.01a1.162 1.162 0 11-2.324 0 1.162 1.162 0 012.324 0z',
  },
];

// Placeholder data for Top Donors - Replace with real data
const TOP_DONORS = [
  {
    id: 1,
    name: 'Tsering Ngetup Lama',
    amount: 'NPR 25,005',
    image: '/images/donors/tsering-ngutup.jpeg',
    location: 'Nyin',
    message: 'Supporting education and preserving our cultural heritage.',
  },
  {
    id: 2,
    name: 'Norbu Angdu Lama',
    amount: 'NPR 20,000',
    image: '/images/donors/nurbu-wangdu.jpeg',
    location: 'Nyin',
    message: 'Committed to helping students achieve their dreams.',
  },
  {
    id: 3,
    name: 'Chhapal Dorje',
    amount: 'NPR 15,500',
    image: '/images/donor-placeholder-3.jpg',
    location: 'Namkha',
    message: 'Honoring the legacy of His Holiness Degyal Rinpoche.',
  },
  {
    id: 4,
    name: 'Lakha Thapa',
    amount: 'NPR 15,500',
    image: '/images/donors/lakha-thapa.jpeg',
    location: 'Namkha',
    message: 'Dedicated to empowering future generations through education.',
  },
  {
    id: 5,
    name: 'Kunchong Tashi',
    amount: 'NPR 15,005',
    image: '/images/donors/kunsang-tashi.jpeg',
    location: 'Nyin',
    message: "Investing in the future of our community's youth.",
  },
  {
    id: 6,
    name: 'Pema Mugtup',
    amount: 'NPR 15,005',
    image: '/images/donors/pama-mugtup.jpeg',
    location: 'Nyin',
    message: "Investing in the future of our community's youth.",
  },
  {
    id: 7,
    name: 'Chhakka Bahadhur Lama',
    amount: 'NPR 15,005',
    image: '/images/donors/chhakka-bahadur.jpeg',
    location: 'Nyin',
    message: "Investing in the future of our community's youth.",
  },
];

export default function Page() {
  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-bg-accent"></div>
        <div className="hero-bg-accent-2"></div>

        <div className="container hero-content animate-fade-in">
          <div className="hero-logo animate-float">
            <Image
              src="/images/rinpoche.jpg"
              alt="His Holiness Degyal Rinpoche"
              fill
              className="img-cover"
              priority
            />
          </div>
          <h1 className="hero-title">Degyal Memorial Society</h1>
          <p className="hero-tagline">
            Preserving Dharma, Supporting Education, Strengthening Community
          </p>
          <div className="hero-description">
            Reconnecting younger generations with the spiritual lineage of His
            Holiness Degyal Rinpoche, while supporting students in their
            educational journey.
          </div>
          <div className="hero-actions">
            <a href="/about-us" className="btn">
              Our Mission
            </a>
            <a href="/students" className="btn btn-outline">
              Student Support
            </a>
          </div>
        </div>
      </header>

      {/* Cultural Greeting */}
      <section className="greeting-section">
        <div className="container">
          <div className="glass-card text-center greeting-card">
            <h2 className="greeting-title">"Khamsang and Tashi Delek"</h2>
            <p className="greeting-text">
              We extend our warm greetings to all members, students, parents,
              and well-wishers of Degyal Memorial Society.
            </p>
          </div>
        </div>
      </section>

      {/* Top Donors Section */}
      <section id="donor" className="section-padding">
        <div className="container">
          <div className="text-center mb-large">
            <span className="subtitle">Gratitude</span>
            <h2 className="section-title">Top Donors</h2>
            <p className="section-description">
              We are deeply grateful to our generous donors who make our mission
              possible.
            </p>
          </div>

          <div className="donors-horizontal-scroll">
            {TOP_DONORS.map((donor) => (
              <div key={donor.id} className="donor-card-compact">
                <div className="donor-image-circle">
                  <Image
                    src={donor.image}
                    alt={donor.name}
                    fill
                    className="img-cover"
                  />
                </div>
                <div className="donor-info-compact">
                  <h4 className="donor-name-compact">{donor.name}</h4>
                  <div className="donor-amount-compact">{donor.amount}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-large">
            <a href="/donors" className="btn btn-outline">
              View All Donors
            </a>
          </div>
        </div>
      </section>

      {/* Contact Us Section with Form */}
      <section id="contact" className="section-padding bg-gradient">
        <div className="container">
          <div className="text-center mb-large">
            <span className="subtitle-light">Get In Touch</span>
            <h2 className="section-title-light">Contact Us</h2>
            <p className="text-white opacity-80 max-w-2xl mx-auto">
              Have questions or want to support our mission? We'd love to hear
              from you.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div className="contact-info-grid mt-large">
            <div className="contact-info-card glass-card-dark text-center">
              <div className="info-icon">📧</div>
              <h4>Email</h4>
              <p>info@degyalmemorial.org</p>
            </div>
            <div className="contact-info-card glass-card-dark text-center">
              <div className="info-icon">📱</div>
              <h4>Phone</h4>
              <p>+977 9800000000</p>
            </div>
            <div className="contact-info-card glass-card-dark text-center">
              <div className="info-icon">📍</div>
              <h4>Location</h4>
              <p>Namkha Khyung Dzong, Nepal</p>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="social-links-wrapper text-center">
            <h4 className="social-links-title">Follow Us</h4>
            <div className="social-links">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="social-link"
                >
                  <svg
                    className="social-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
