export interface CvData {
  name: string;
  role: string;
  location: string;
  email: string;
  website: string;
  phone: string;
  summary: string;
  objective: string;
  education: Array<{
    degree: string;
    status: string;
    institution: string;
  }>;
  technicalSkills: string[];
  projects: Array<{
    title: string;
    type: string;
    url: string;
    description: string;
  }>;
  experience: {
    title: string;
    duration: string;
    description: string;
  };
  languages: string[];
  socialMedia: Array<{
    platform: string;
    handle: string;
    url: string;
  }>;
  personalDetails: {
    dobBs: string;
    dobAd: string;
    location: string;
  };
}

export const RAJABABU_CV_DATA: CvData = {
  name: 'RAJABABU MEHTA',
  role: 'Founder of HamroLms | AI Web Developer | AI Explainer',
  location: 'Birgunj, Nepal',
  email: 'support@rajababumehta.com.np',
  website: 'https://rajababumehta.com.np',
  phone: '9816689232',
  summary:
    'Rajababu Mehta is the Founder of HamroLms, an AI Website Developer, and AI Explainer based in Birgunj, Nepal. Passionate about artificial intelligence, modern frontend engineering, and intuitive digital tools.',
  objective:
    'To lead and expand HamroLms as Founder while building high-performance modern websites, mastering emerging AI technologies, and delivering exceptional digital experiences.',
  education: [],
  technicalSkills: [
    'HamroLms Platform & AI Workflows',
    'AI Tools & AI Technology',
    'AI-based Website Design',
    'Website Development',
    'Digital Marketing & SEO',
    'Communication Skills',
  ],
  projects: [
    {
      title: 'HamroLms (Founder)',
      type: 'Founder • AI Learning Platform & Tool Hub',
      url: 'https://hamrolms.vercel.app/',
      description: 'Interactive AI hub and creative showcase founded and led by Rajababu Mehta, offering modern AI resources and digital tools.',
    },
  ],
  experience: {
    title: 'Founder of HamroLms & Web Developer',
    duration: '7 Years of Hands-on Experience',
    description:
      'Founder of HamroLms with over 7 years of deep experience in technology, AI tools, web engineering, and digital platforms.',
  },
  languages: ['Nepali', 'Bhojpuri', 'Hindi', 'English'],
  socialMedia: [
    {
      platform: 'Facebook',
      handle: 'Rajababu Mehta',
      url: 'https://www.facebook.com/share/1JMEFsQwNA/',
    },
    {
      platform: 'Instagram',
      handle: 'mr.rajababumehta',
      url: 'https://www.instagram.com/mr.rajababumehta',
    },
    {
      platform: 'LinkedIn',
      handle: 'rajababumehta',
      url: 'https://www.linkedin.com/in/rajababumehta',
    },
  ],
  personalDetails: {
    dobBs: '2066/12/08 BS',
    dobAd: '2010/03/21 AD',
    location: 'Birgunj, Nepal',
  },
};
