'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeSwitcher } from './ThemeSwitcher';

const navLinks = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#products', label: 'Products' },
  { href: '#skills', label: 'Skills' },
  { href: '#case-studies', label: 'Case Studies' },
  { href: '#contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      let current = 'hero';
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        if (window.scrollY + 100 >= sectionTop && window.scrollY + 100 < sectionTop + sectionHeight) {
          current = section.getAttribute('id') || 'hero';
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <nav className={`sapphire-nav ${scrolled ? 'scrolled' : ''}`}>
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        <a className="nav-brand" href="#hero" onClick={(e) => handleClick(e, '#hero')}>
          Ricky Fredy
        </a>

        <div
          className="nav-links-desktop"
          style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
              onClick={(e) => handleClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
          <ThemeSwitcher />
        </div>

        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--text-primary)',
            fontSize: '20px',
          }}
        >
          <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="nav-mobile-menu"
            style={{
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)',
              overflow: 'hidden',
            }}
          >
            <div
              className="container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 24px',
                gap: '4px',
              }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
                  onClick={(e) => handleClick(e, link.href)}
                  style={{ display: 'block', padding: '10px 12px' }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ padding: '10px 12px' }}>
                <ThemeSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
