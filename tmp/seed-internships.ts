import mongoose from 'mongoose';
import GlobalInternship from '../lib/models/GlobalInternship';

const MONGODB_URI = 'mongodb+srv://thakurhimanshu830_db_user:kvJVmVGdaJj9HFy1@cluster0.6vd8q1r.mongodb.net/pathforge?retryWrites=true&w=majority&appName=Cluster0';

const beginnerInternships = [
  {
    company: 'WebStart Solutions',
    role: 'Junior Web Developer Intern',
    location: 'Remote',
    type: 'remote',
    description: 'Perfect for beginners! Focus on HTML/CSS bug fixes and simple UI components.',
    skills: ['HTML', 'CSS', 'JavaScript'],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    stipend: '$500 - $800/mo',
    requirements: 'Basic understanding of HTML and CSS. No prior experience required.'
  },
  {
    company: 'Creative Pixels',
    role: 'Frontend Design Intern',
    location: 'New York, NY',
    type: 'hybrid',
    description: 'Learn the intersection of design and code. Great for beginners interested in Tailwind CSS.',
    skills: ['Figma', 'Tailwind CSS', 'React'],
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    stipend: '$1000/mo',
    requirements: 'Portfolio with at least 2 personal projects.'
  },
  {
    company: 'OpenSource Labs',
    role: 'Open Source Contributor Intern',
    location: 'Remote',
    type: 'remote',
    description: 'A community-driven internship where you help maintain popular open source projects.',
    skills: ['Git', 'GitHub', 'Markdown', 'JavaScript'],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    stipend: 'Stipend based on contributions',
    requirements: 'Enthusiasm for learning Git and contributing to the community.'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await GlobalInternship.insertMany(beginnerInternships);
    
    console.log('Successfully seeded beginner internships!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
