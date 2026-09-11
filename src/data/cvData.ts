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
  role: 'Student | AI Web Developer',
  location: 'Birgunj, Nepal',
  email: 'rajababum426@gmail.com',
  website: 'https://rajababumehta.com.np',
  phone: '9816689232',
  summary:
    'Motivated student and AI Web Developer passionate about technology, artificial intelligence, and modern web solutions. Interested in learning and growing in the technology field by creating innovative AI-based projects and digital solutions.',
  objective:
    'To learn and grow in the technology field in AI by improving my skills, gaining practical experience, and contributing to innovative digital projects.',
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
    'AI Tools & AI Technology',
    'AI-based Website Design',
    'Website Development',
    'Digital Marketing',
    'Communication Skills',
  ],
  projects: [
    {
      title: 'AI Clipzone Website',
      type: 'Portfolio / AI learning platform project',
      url: 'https://aiclipzone.vercel.app',
      description: 'Interactive AI learning hub, digital tool directory, and creative development showcase.',
    },
  ],
  experience: {
    title: 'AI & Web Development Experience',
    duration: '7 Years of Experience',
    description:
      '7 Years of experience in learning and working with technology, AI tools, website creation, and digital projects.',
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
  ],
  personalDetails: {
    dobBs: '2066/12/08 BS',
    dobAd: '2010/03/21 AD',
    location: 'Birgunj, Nepal',
  },
};
