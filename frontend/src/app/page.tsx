'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { CaseStudyModal } from '@/components/CaseStudyModal';
import { FloatingChatWidget } from '@/components/FloatingChatWidget';
import { SplineScene } from '@/components/ui/spline-scene';
import {
  experienceData,
  productsData,
  skillsData,
  contactData,
  caseStudiesData,
} from '@/data/portfolio';
import type { CaseStudy } from '@/data/portfolio';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);

  return (
    <>
      {/* Ambient Background Orbs */}
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      <Navbar />

      {/* ===== HERO ===== */}
      <section id="hero" className="hero-section">
        <motion.div initial="hidden" animate="visible" variants={containerStagger}>
          <motion.div
            className="hero-robot"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          >
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </motion.div>

          <motion.p className="hero-eyebrow" variants={itemFade}>
            <span className="wave" style={{ display: 'inline-block', animation: 'wave 2.5s infinite', transformOrigin: '70% 70%' }}>
              👋
            </span>{' '}
            Hello, I&apos;m
          </motion.p>

          <motion.h1 className="hero-name" variants={itemFade}>
            Ricky Fredy
          </motion.h1>
          <motion.div className="hero-titles" variants={itemFade}>
            <span>Technical Product Leader</span>
            <span className="title-separator">|</span>
            <span>Product Manager</span>
            <span className="title-separator">|</span>
            <span>Technical Program Manager</span>
          </motion.div>
          <motion.p className="hero-tagline" variants={itemFade}>
            Building scalable products with engineering, AI and business strategy.
          </motion.p>
          <motion.div className="hero-buttons" variants={itemFade}>
            <a href="/resume.pdf" download className="btn-primary">
              <i className="fas fa-download" /> Download Resume
            </a>
            <a href="https://www.linkedin.com/in/rickyfredy/" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <i className="fab fa-linkedin" /> LinkedIn
            </a>
            <a href="mailto:ricky.fredy.88@gmail.com" className="btn-secondary">
              <i className="fas fa-envelope" /> Email Me
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <span>Scroll</span>
          <div className="scroll-line" />
        </motion.div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="section">
        <motion.div
          className="section-header"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} transition={{ duration: 0.5 }}
        >
          <span className="section-label">01 — About</span>
          <h2 className="section-title">My Philosophy</h2>
        </motion.div>

        <motion.div
          className="about-content"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="about-lead">
            I believe great products are built when <span className="highlight">business goals</span>,{' '}
            <span className="highlight">engineering excellence</span>, and{' '}
            <span className="highlight">user experience</span> align.
          </p>
          <p>
            Over the past <strong>18 years</strong>, I&apos;ve led product initiatives across
            e-commerce, logistics, enterprise software, cloud infrastructure, and AI-powered solutions.
          </p>
          <p>
            My career started as a <strong>software engineer</strong> before evolving into{' '}
            <strong>product leadership</strong>, giving me the ability to bridge executives,
            designers, and engineering teams — translating ambitious vision into shipped,
            measurable outcomes.
          </p>
          <p>
            I don&apos;t just manage roadmaps. I architect systems, write code when it matters,
            and ensure every product decision is backed by data, user insight, and technical feasibility.
          </p>
        </motion.div>

        <motion.div
          className="stats-grid"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={containerStagger}
        >
          {[
            { count: 18, label: 'Years Experience' },
            { count: 40, label: '% Workload Reduced' },
            { count: 7, label: 'Industries' },
            { count: 6, label: 'Companies' },
          ].map((stat, i) => (
            <motion.div key={i} className="stat-item" variants={itemFade}>
              <CountUpNumber target={stat.count} />
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== EXPERIENCE ===== */}
      <section id="experience" className="section" style={{ background: 'var(--bg-secondary)' }}>
        <motion.div
          className="section-header"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} transition={{ duration: 0.5 }}
        >
          <span className="section-label">02 — Experience</span>
          <h2 className="section-title">Career Timeline</h2>
        </motion.div>

        <motion.div
          className="timeline"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={containerStagger}
        >
          {experienceData.map((item, i) => (
            <motion.div key={i} className="timeline-item" variants={itemFade}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-date">{item.date}</div>
                <h3 className="timeline-title">{item.title}</h3>
                <div className="timeline-company">
                  <i className={`fas ${item.icon}`} style={{ marginRight: '6px', color: 'var(--accent-main)' }} /> {item.company}
                </div>
                <p>{item.description}</p>
                <div className="timeline-tags">
                  {item.tags.map((tag, j) => (
                    <span key={j} className="mini-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== PRODUCTS ===== */}
      <section id="products" className="section">
        <motion.div
          className="section-header"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} transition={{ duration: 0.5 }}
        >
          <span className="section-label">03 — Products</span>
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Products I&apos;ve designed, built, and shipped — not just companies I worked for.</p>
        </motion.div>

        <motion.div
          className="products-grid"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={containerStagger}
        >
          {productsData.map((product, i) => (
            <motion.div
              key={i}
              className="product-card"
              variants={itemFade}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="product-header">
                <div className="product-icon"><i className={`fas ${product.icon}`} /></div>
                <div>
                  <h3 className="product-name">{product.name}</h3>
                  <span className="product-company">{product.company}</span>
                </div>
              </div>
              <div className="product-body">
                {product.details.map((detail, j) => (
                  <div key={j} className="product-detail">
                    <span className="detail-label"><i className={`fas ${detail.icon}`} /> {detail.label}</span>
                    {detail.text.map((t, k) => (
                      <p key={k}>
                        {t.split('\n').map((line, l, arr) => (
                          <span key={l}>
                            {line}
                            {l < arr.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>
                ))}
                {product.impacts.map((impact, j) => (
                  <div key={j} className="product-impact">
                    <i className={`fas ${impact.icon}`} />
                    <span>{impact.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== SKILLS ===== */}
      <section id="skills" className="section" style={{ background: 'var(--bg-primary)' }}>
        <motion.div
          className="section-header"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} transition={{ duration: 0.5 }}
        >
          <span className="section-label">04 — Skills</span>
          <h2 className="section-title">Technical Skills</h2>
          <p className="section-subtitle">A full-stack toolkit spanning product, engineering, and infrastructure.</p>
        </motion.div>

        <motion.div
          className="skills-wrapper"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={containerStagger}
        >
          {skillsData.map((cat, i) => (
            <motion.div key={i} className="skill-category" variants={itemFade}>
              <h3 className="skill-category-title"><i className={`fas ${cat.icon}`} /> {cat.name}</h3>
              <div className="skill-tags">
                {cat.tags.map((tag, j) => (
                  <span key={j} className="skill-tag">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== CASE STUDIES ===== */}
      <section id="case-studies" className="section">
        <motion.div
          className="section-header"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} transition={{ duration: 0.5 }}
        >
          <span className="section-label">05 — Case Studies</span>
          <h2 className="section-title">Case Studies</h2>
          <p className="section-subtitle">Deep dives into the problems, solutions, and outcomes.</p>
        </motion.div>

        <motion.div
          className="case-studies-grid"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={containerStagger}
        >
          {caseStudiesData.map((cs, i) => (
            <motion.div
              key={i}
              className="case-study-card"
              variants={itemFade}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => setSelectedCaseStudy(cs)}
            >
              <div className="case-study-visual">
                <div className="case-visual-icon">
                  <i className={`fas ${cs.icon}`} />
                </div>
              </div>
              <div className="case-study-body">
                <span className="case-study-tag">{cs.tag}</span>
                <h3 className="case-study-title">{cs.title}</h3>
                <button className="case-study-btn">
                  <a href={`${cs.demo}`} target="_blank">{cs.demo}</a>
                </button>
                <br />
                <p className="case-study-excerpt">{cs.excerpt}</p>
                <button className="case-study-btn">
                  Read Case Study <i className="fas fa-arrow-right" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="section" style={{ background: 'var(--bg-secondary)' }}>
        <motion.div
          className="section-header"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} transition={{ duration: 0.5 }}
        >
          <span className="section-label">06 — Contact</span>
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">Let&apos;s build something great together.</p>
        </motion.div>

        <motion.div
          className="contact-cards"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={containerStagger}
        >
          {contactData.map((c, i) => (
            <motion.a
              key={i}
              href={c.href}
              target={c.external ? '_blank' : undefined}
              rel={c.external ? 'noopener noreferrer' : undefined}
              className="contact-card"
              variants={itemFade}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="contact-icon"><i className={c.faIcon} /></div>
              <div className="contact-info">
                <span className="contact-label">{c.label}</span>
                <span className="contact-value">{c.value}</span>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">© 2025 Ricky Fredy. Built with passion.</p>
          <div className="footer-social">
            <a href="mailto:ricky.fredy.88@gmail.com" aria-label="Email"><i className="fas fa-envelope" /></a>
            <a href="https://www.linkedin.com/in/rickyfredy/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin" /></a>
            <a href="https://github.com/rickyfredy" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="fab fa-github" /></a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes wave {
          0%, 60%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
        }
      `}</style>

      <CaseStudyModal
        caseStudy={selectedCaseStudy}
        onClose={() => setSelectedCaseStudy(null)}
      />

      <FloatingChatWidget />
    </>
  );
}

function CountUpNumber({ target }: { target: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    const updateCounter = () => {
      current += step;
      if (current < target) {
        setCount(Math.floor(current));
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };
    updateCounter();
  }, [isInView, target]);

  return (
    <div className="stat-number" ref={ref}>
      {count}
    </div>
  );
}
