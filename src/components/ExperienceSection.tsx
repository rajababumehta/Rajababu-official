import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Cpu,
  Compass,
  Calendar,
  Quote,
  Layers,
} from 'lucide-react';
import { ExperienceSettings, Language } from '../types';

interface ExperienceSectionProps {
  language: Language;
  experience: ExperienceSettings;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  language,
  experience,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'technical' | 'strategy'>('all');

  const filteredSkills = activeCategory === 'all'
    ? experience.skills
    : experience.skills.filter((s) => s.category === activeCategory);

  return (
    <section
      id="skills"
      className="py-20 sm:py-28 bg-[#0a0b0e] border-t border-[rgba(255,240,238,0.08)] relative scroll-mt-20"
    >
      <div id="experience" className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading matching dhruvrathee.com (.sh) */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold tracking-widest uppercase text-[#f6f3f2]/50">
            <span className="w-2 h-2 rounded-full bg-[#e4342f]" />
            <span>{language === 'NE' ? experience.badgeNe : 'Capabilities & Execution'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] text-[#f6f3f2]">
            {language === 'NE' ? (
              <>
                प्राविधिक <span className="font-serif italic font-normal text-[#e4342f]">सीप तथा माइलस्टोनहरू</span>
              </>
            ) : (
              <>
                Skills & <span className="font-serif italic font-normal text-[#e4342f]">Expertise</span>
              </>
            )}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#f6f3f2]/70 max-w-2xl leading-relaxed">
            {language === 'NE' ? experience.headingNe : experience.headingEn}
          </p>
        </div>

        {/* Main Content Grid: Skills on Left, Milestones Timeline on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-16">
          
          {/* Left Column: Skills & Interactive Tabs */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-[#f6f3f2] tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#e4342f]" />
                <span>{language === 'NE' ? 'दक्षता तथा प्राविधिक सीप' : 'Core Competencies'}</span>
              </h3>
            </div>

            {/* Category Filter Controls */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-[#e4342f] text-white shadow-[0_6px_18px_-4px_rgba(228,52,47,0.7)]'
                    : 'bg-[rgba(255,255,255,0.03)] text-[#f6f3f2]/60 hover:text-white border border-[rgba(255,240,238,0.08)]'
                }`}
              >
                {language === 'NE' ? 'सबै सीपहरू' : 'All Skills'}
              </button>
              <button
                onClick={() => setActiveCategory('technical')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === 'technical'
                    ? 'bg-[#e4342f] text-white shadow-[0_6px_18px_-4px_rgba(228,52,47,0.7)]'
                    : 'bg-[rgba(255,255,255,0.03)] text-[#f6f3f2]/60 hover:text-white border border-[rgba(255,240,238,0.08)]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? 'वेब डेभलपमेन्ट' : 'Web Development'}</span>
              </button>
              <button
                onClick={() => setActiveCategory('strategy')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === 'strategy'
                    ? 'bg-[#e4342f] text-white shadow-[0_6px_18px_-4px_rgba(228,52,47,0.7)]'
                    : 'bg-[rgba(255,255,255,0.03)] text-[#f6f3f2]/60 hover:text-white border border-[rgba(255,240,238,0.08)]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? 'एआई तथा प्राविधिक' : 'AI & Tech Tools'}</span>
              </button>
            </div>

            {/* Skill Progress List */}
            <div className="space-y-4">
              {filteredSkills.map((skill, idx) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="p-5 rounded-[18px] bg-[#101216] border border-[rgba(255,240,238,0.08)] hover:border-[rgba(255,240,238,0.16)] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm sm:text-base text-[#f6f3f2]">
                      {language === 'NE' ? skill.nameNe : skill.nameEn}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#ff8175]">
                      {skill.level}%
                    </span>
                  </div>

                  {/* Progress bar container */}
                  <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[#e4342f] via-[#ff6a4d] to-[#ffb08e]"
                    />
                  </div>

                  <p className="text-xs text-[#f6f3f2]/60 leading-relaxed">
                    {language === 'NE' ? skill.descNe : skill.descEn}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Milestones & Career Timeline */}
          <div className="lg:col-span-6 flex flex-col">
            <h3 className="text-xl font-bold text-[#f6f3f2] tracking-tight flex items-center gap-2 mb-6">
              <Calendar className="w-4 h-4 text-[#ff6a4d]" />
              <span>{language === 'NE' ? 'प्रमुख यात्रा तथा माइलस्टोनहरू' : 'Milestones & Key Initiatives'}</span>
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-px before:bg-[rgba(255,240,238,0.12)]">
              {experience.milestones.map((milestone, idx) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  className="relative group"
                >
                  {/* Timeline Node */}
                  <div className="absolute -left-[29px] sm:-left-[37px] top-1.5 w-4 h-4 rounded-full bg-[#0a0b0e] border-2 border-[#e4342f] flex items-center justify-center group-hover:scale-125 transition-transform shadow-[0_0_12px_rgba(228,52,47,0.8)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#e4342f]" />
                  </div>

                  <div className="p-5 sm:p-6 rounded-[20px] bg-[#101216] border border-[rgba(255,240,238,0.08)] group-hover:border-[#e4342f]/40 transition-all shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#e4342f]/15 border border-[#e4342f]/30 text-[#ff8175] font-mono text-[11px] font-bold">
                        {milestone.year}
                      </span>
                      <span className="text-[10.5px] font-semibold text-[#f6f3f2]/40 uppercase tracking-wider">
                        {milestone.roleType}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-[#f6f3f2] mb-1">
                      {language === 'NE' ? milestone.titleNe : milestone.titleEn}
                    </h4>

                    <div className="text-xs font-semibold text-[#ff8175] mb-2.5">
                      {language === 'NE' ? milestone.orgNe : milestone.orgEn}
                    </div>

                    <p className="text-xs sm:text-sm text-[#f6f3f2]/65 leading-relaxed">
                      {language === 'NE' ? milestone.descNe : milestone.descEn}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* Vision Quote Block */}
        <div className="p-7 sm:p-9 rounded-[24px] bg-[#101216] border border-[rgba(255,240,238,0.08)] text-center relative overflow-hidden">
          <Quote className="w-12 h-12 text-[#e4342f]/15 absolute top-4 left-4 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="font-serif italic text-lg sm:text-xl text-[#f6f3f2]/90 leading-relaxed mb-3">
              "{language === 'NE' ? experience.quoteNe : experience.quoteEn}"
            </p>
            <div className="text-xs font-bold text-[#ff8175]">
              — {experience.quoteAuthor}
            </div>
            <div className="mt-4 pt-3 border-t border-[rgba(255,240,238,0.06)] flex items-center justify-center gap-2 text-xs">
              <span className="text-[#f6f3f2]/50">
                {language === 'NE' ? 'वेबसाइट परियोजना सुरु गर्न:' : 'Ready to start a project?'}
              </span>
              <a
                href="#contact"
                className="text-[#ff8175] hover:text-white font-bold underline underline-offset-4 transition-colors"
              >
                {language === 'NE' ? 'राजाबाबु मेहतासँग सम्पर्क गर्नुहोस्' : 'Connect with Rajababu Mehta'} →
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
