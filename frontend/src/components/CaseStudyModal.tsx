'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CaseStudy } from '@/data/portfolio';

interface CaseStudyModalProps {
  caseStudy: CaseStudy | null;
  onClose: () => void;
}

export function CaseStudyModal({ caseStudy, onClose }: CaseStudyModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (caseStudy) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [caseStudy, onClose]);

  return (
    <AnimatePresence>
      {caseStudy && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-container"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-bar">
              <h5 className="modal-title-text">{caseStudy.modalTitle}</h5>
              <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="case-modal-hero">
                <i className={`fas ${caseStudy.icon}`} />
                <h3>{caseStudy.heroTitle}</h3>
                <h4><a href={caseStudy.demo} target="_blank">{caseStudy.demo}</a></h4>
                <span className="case-modal-company">{caseStudy.heroCompany}</span>
              </div>

              {caseStudy.sections.map((section, i) => (
                <div key={i} className="case-modal-section">
                  <h4>
                    <i className={`fas ${section.icon}`} /> {section.title}
                  </h4>
                  {section.content && <p style={{ whiteSpace: 'pre-wrap' }}>{section.content}</p>}
                  {section.list && (
                    <ul className="case-architecture-list">
                      {section.list.map((item, j) => {
                        const [label, ...rest] = item.split(':');
                        return (
                          <li key={j}>
                            <strong>{label}:</strong>{rest.join(':')}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {section.stats && (
                    <>
                      <div className="outcome-stats">
                        {section.stats.map((stat, j) => (
                          <div key={j} className="outcome-stat">
                            <div className="outcome-number">{stat.number}</div>
                            <div className="outcome-desc">{stat.desc}</div>
                          </div>
                        ))}
                      </div>
                      {section.content && <p style={{ marginTop: '16px', whiteSpace: 'pre-wrap' }}>{section.content}</p>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
