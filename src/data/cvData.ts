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
  role: 'Founder & CEO of AI Clipzone | AI Web Developer | Student',
  location: 'Birgunj, Nepal',
  email: 'support@rajababumehta.com.np',
  website: 'https://rajababumehta.com.np',
  phone: '9816689232',
  summary:
    'Rajababu Mehta is the Founder and CEO of AI Clipzone (https://aiclipzone.vercel.app/), an AI Website Developer, and Student based in Birgunj, Nepal. Passionate about artificial intelligence, modern frontend engineering, and intuitive digital tools.',
  objective:
    'To lead and expand AI Clipzone as Founder & CEO while building high-performance modern websites, mastering emerging AI technologies, and delivering exceptional digital experiences.',
  education: [
    {
      degree: '+2 Management',
      status: 'Currently Studying',
      institution: 'Decimal College, Birgunj (Nepal Education Board - NEB)',
    },
    {
      degree: 'Secondary Education',
      status: 'SEE Completed',
      institution: 'Shree Zilla Uchangal Ramdev Kalwar Secondary School',
    },
  ],
  technicalSkills: [
    'AI Clipzone Platform & AI Workflows',
    'AI Tools & AI Technology',
    'AI-based Website Design',
    'Website Development',
    'Digital Marketing & SEO',
    'Communication Skills',
  ],
  projects: [
    {
      title: 'AI Clipzone (Founder & CEO)',
      type: 'Founder & CEO • AI Learning Platform & Tool Hub',
      url: 'https://aiclipzone.vercel.app/',
      description: 'Interactive AI hub and creative showcase founded and led by Rajababu Mehta, offering modern AI resources and digital tools.',
    },
  ],
  experience: {
    title: 'Founder & CEO of AI Clipzone & Web Developer',
    duration: '7 Years of Hands-on Experience',
    description:
      'Founder and CEO of AI Clipzone (https://aiclipzone.vercel.app/) with over 7 years of deep experience in technology, AI tools, web engineering, and digital platforms.',
  },
  languages: ['Nepali', 'Bhojpuri', 'Hindi', 'English'],
  socialMedia: [
    {
      platform: 'Facebook',
      handle: 'Rajababu Mehta',
      url: 'https://www.facebook.com/share/19PZ6HWQdk/',
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
