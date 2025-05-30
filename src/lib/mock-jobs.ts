export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer (React)',
    company: 'Innovatech Solutions',
    location: 'New York, NY',
    description: 'Seeking a skilled Frontend Developer to build responsive and performant web applications using React, Next.js, and TypeScript. Experience with state management (Redux/Zustand) and testing frameworks is a plus.',
    url: '#apply-link-1',
  },
  {
    id: '2',
    title: 'Full-Stack Engineer',
    company: 'ConnectSphere',
    location: 'Remote',
    description: 'Join our dynamic team as a Full-Stack Engineer. You will work on both frontend (React, Vue) and backend (Node.js, Python) technologies to deliver scalable solutions. Strong problem-solving skills required.',
    url: '#apply-link-2',
  },
  {
    id: '3',
    title: 'AI/ML Engineer',
    company: 'FutureAI Corp',
    location: 'San Francisco, CA',
    description: 'Exciting opportunity for an AI/ML Engineer to develop and deploy machine learning models. Proficiency in Python, TensorFlow/PyTorch, and experience with NLP or computer vision projects preferred.',
    url: '#apply-link-3',
  },
  {
    id: '4',
    title: 'UX/UI Designer',
    company: 'Creative Visions Studio',
    location: 'Austin, TX (Hybrid)',
    description: 'We are looking for a talented UX/UI Designer to create intuitive and visually appealing user interfaces. Must have a strong portfolio showcasing design process and proficiency in Figma/Sketch.',
    url: '#apply-link-4',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudNet Dynamics',
    location: 'Remote',
    description: 'Experienced DevOps Engineer needed to manage and automate our cloud infrastructure (AWS/Azure). Skills in CI/CD pipelines, Docker, Kubernetes, and IaC tools like Terraform are essential.',
    url: '#apply-link-5',
  },
];
