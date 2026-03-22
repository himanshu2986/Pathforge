const fs = require('fs');

const domains = ["Health", "Finance", "Education", "Retail", "Automotive", "Social", "Real Estate", "Analytics", "Productivity", "Entertainment", "E-commerce", "Travel", "Logistics", "IoT", "Gaming", "Cybersecurity", "Blockchain"];
const beginnerTypes = ["Calculator", "To-Do List", "Landing Page", "Weather Dashboard", "Quiz App", "Expense Tracker", "Blog", "Portfolio", "Converter", "Note Taker"];
const intTypes = ["Chat App", "CMS", "E-commerce Store", "Job Board", "Video Player", "Music Streaming", "Forum", "Booking System", "Inventory Manager", "Recipe App"];
const advTypes = ["AI Platform", "Distributed Queue", "Microservices Setup", "Web3 Vault", "Cloud IDE", "Video Conf", "Recommendation Engine", "Serverless SaaS", "Analytics Pipeline", "Payment Gateway"];

const sihTopics = ["Traffic Management", "Patient Records", "Disaster Relief", "Crop Prediction", "Waste Management", "Women Safety", "Rural Connectivity", "Smart Education", "Water Quality", "Pothole Detection", "E-Governance Portal", "Pension Management", "Tax Anomaly Detection"];
const googleTopics = ["Carbon Tracker", "Accessible Edu", "Clean Water IoT", "Gender Equality App", "Zero Hunger Network", "Climate Action ML", "Sustainable Cities", "Ocean Life Monitor", "Renewable Energy Grid", "Poverty Mapping"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const icons = ["Rocket", "Code2", "Database", "Layout", "Brain", "Shield", "Terminal", "Globe", "Cpu", "HeartPulse", "Leaf", "Users", "CloudRain", "Activity", "BarChart", "Bell"];
const techStacks = [
  ["HTML", "CSS", "JS"], ["React", "CSS"], ["Vue", "Tailwind"], ["Svelte", "CSS"],
  ["Next.js", "Firebase"], ["Node", "Express"], ["Python", "Flask"], ["Django", "Postgres"],
  ["AWS", "Docker"], ["Kubernetes", "Redis"], ["Solidity", "Web3"], ["TensorFlow", "OpenCV"],
  ["Flutter", "Firebase"], ["React Native", "Expo"], ["GCP", "BigQuery"], ["Go", "gRPC"]
];

function generateProjects(count, typeArray, domainArray, isHackathon = false) {
  const projects = [];
  const usedTitles = new Set();
  
  while (projects.length < count) {
    const type = getRandomItem(typeArray);
    const domain = getRandomItem(domainArray);
    
    let title = isHackathon ? `${domain} ${type}` : `${domain} ${type}`;
    if (usedTitles.has(title)) {
      title = `${domain} ${type} v${projects.length}`;
    }
    usedTitles.add(title);
    
    projects.push({
      title,
      desc: isHackathon 
        ? `Solve critical challenges in the ${domain.toLowerCase()} sector by building a dynamic ${type.toLowerCase()}.`
        : `Build a highly scalable ${type.toLowerCase()} tailored for the ${domain.toLowerCase()} industry.`,
      iconName: getRandomItem(icons),
      tags: getRandomItem(techStacks)
    });
  }
  return projects;
}

const projectLevels = [
  {
    level: "Beginner",
    description: "Perfect for getting started with core concepts.",
    color: "from-green-500 to-emerald-700",
    projects: generateProjects(50, beginnerTypes, domains)
  },
  {
    level: "Intermediate",
    description: "Take your skills to the next level with full-stack challenges.",
    color: "from-primary to-accent",
    projects: generateProjects(50, intTypes, domains)
  },
  {
    level: "Advanced",
    description: "Complex architectures and advanced system design for seasoned developers.",
    color: "from-orange-500 to-red-600",
    projects: generateProjects(50, advTypes, domains)
  },
  {
    level: "Smart India Hackathon",
    description: "Real-world problem statements inspired by India's biggest nationwide hackathon.",
    color: "from-blue-600 to-indigo-800",
    projects: generateProjects(50, ["System", "Portal", "App", "Network", "Tracker"], sihTopics, true)
  },
  {
    level: "Google Solutions",
    description: "Tackle the 17 UN Sustainable Development Goals using leading Google Cloud technologies.",
    color: "from-red-500 via-yellow-500 to-blue-500",
    projects: generateProjects(50, ["Dashboard", "Platform", "ML Model", "App", "Grid"], googleTopics, true)
  }
];

const fileContent = `
export const projectLevels = ${JSON.stringify(projectLevels, null, 2)};
`;

fs.writeFileSync('lib/projectsData.ts', fileContent);
console.log('Successfully generated lib/projectsData.ts with 250 total projects.');
