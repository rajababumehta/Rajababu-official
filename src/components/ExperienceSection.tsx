import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  Cpu,
  Users,
  Compass,
  Calendar,
  Quote,
  CheckCircle2,
  TrendingUp,
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
  const [activeCategory, setActiveCategory] = useState<'all' | 'technical' | 'leadership' | 'strategy'>('all');

  const filteredSkills = activeCategory === 'all'
    ? experience.skills
    : experience.skills.filter((s) => s.category === activeCategory);

  return (
    <section id="experience" className="py-20 sm:py-28 bg-slate-950/70 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === 'NE' ? experience.badgeNe : experience.badgeEn}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight max-w-3xl">
            {language === 'NE' ? experience.headingNe : experience.headingEn}
          </h2>
        </div>

        {/* Main Content Grid: Skills on Left, Milestones Timeline on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Left Column: Tabbed Competency Switcher & Skill Meters */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-100 font-heading flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span>{language === 'NE' ? 'दक्षता तथा प्राविधिक सीप' : 'Core Competencies'}</span>
              </h3>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {language === 'NE' ? 'सबै सीपहरू' : 'All Domains'}
              </button>
              <button
                onClick={() => setActiveCategory('leadership')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'leadership'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? 'नेतृत्व' : 'Leadership'}</span>
              </button>
              <button
                onClick={() => setActiveCategory('technical')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'technical'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? 'प्राविधिक' : 'Technical'}</span>
              </button>
              <button
                onClick={() => setActiveCategory('strategy')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'strategy'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? 'रणनीति' : 'Strategy'}</span>
              </button>
            </div>

            {/* Skill Progress List */}
            <div className="space-y-6">
              {filteredSkills.map((skill, idx) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-bold text-sm sm:text-base text-slate-200">
                      {language === 'NE' ? skill.nameNe : skill.nameEn}
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {skill.level}%
                    </span>
                  </div>

                  {/* Progress bar container */}
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden mb-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"
                    />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'NE' ? skill.descNe : skill.descEn}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Milestones & Career Timeline */}
          <div className="lg:col-span-6 flex flex-col">
            <h3 className="text-xl font-bold text-slate-100 font-heading flex items-center gap-2 mb-8">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>{language === 'NE' ? 'प्रमुख यात्रा तथा माइलस्टोनहरू' : 'Milestones & Key Initiatives'}</span>
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-slate-800">
              {experience.milestones.map((milestone, idx) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="relative group"
                >
                  {/* Timeline Node */}
                  <div className="absolute -left-[30px] sm:-left-[38px] top-1 w-5 h-5 rounded-full bg-slate-950 border-2 border-blue-500 flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg shadow-blue-500/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 group-hover:border-blue-500/30 transition-all shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[11px] font-bold">
                        {milestone.year}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {milestone.roleType}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base sm:text-lg text-slate-100 mb-1">
                      {language === 'NE' ? milestone.titleNe : milestone.titleEn}
                    </h4>

                    <div className="text-xs font-semibold text-indigo-300 mb-3">
                      {language === 'NE' ? milestone.orgNe : milestone.orgEn}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {language === 'NE' ? milestone.descNe : milestone.descEn}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* Vision Quote Block */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 text-center relative overflow-hidden">
          <Quote className="w-16 h-16 text-blue-500/10 absolute -top-4 -left-4 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl font-heading font-medium text-slate-200 italic leading-relaxed mb-4">
              {language === 'NE' ? experience.quoteNe : experience.quoteEn}
            </p>
            <div className="text-sm font-bold text-blue-400">
              — {experience.quoteAuthor}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
