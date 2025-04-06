const axios = require('axios');

const tasks = [
  {
    title: "Go shopping with Sara in the afternoon",
    description: "Purchase milk, eggs, and bread",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: true
  },
  {
    title: "Walk the dog",
    description: "Take the dog out for a 30-minute walk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: true
  },
  {
    title: "Home work with Alon",
    description: "Alon needs help with math homework",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "Paint shelter for an association for at-risk youth",
    description: "Wings for Kermbo needs your help painting the shelter in the evenings.",
    latitude: 31.8014,
    longitude: 34.6541,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "Volunteering at Let the Animals Live",
    description: "Feed the animals.",
    latitude: 31.802,
    longitude: 34.658,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf4445554sfsfog",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf444666775554sfsfog",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf4446667767885554sfsfog",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf4446667767866685554sfsfog",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf4446667767866687775554sfsfog",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf4446667767866687775554sfs7768fog",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf44466677678666877755577554sfs7768fog",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf44466677678666877755577554s887fs7768fog",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf44466677678666877755577554s887fs7768f55557og",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf44466677678666877755577554s887fs77577568f55557og",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf44466677678666877755577554s887fs775775575768f55557og",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "fsf44466677678666877755577554s887fs775555775575768f55557og",
    description: "Tasfsfffalk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "Walk the dog",
    description: "Take the dog out for a 30-minute walk.",
    latitude: 32.08,
    longitude: 34.8,
    time: "5:00 PM",
    signedUp: false
  },
  {
    title: "Buy groceries",
    description: "Purchase milk, eggs, and bread",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groceries",
    description: "Purchase milk, eggs, and bread",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groceries",
    description: "Purchase milk, eggs, and bread",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groceries",
    description: "Purchase milk, eggs, and bread",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groceries",
    description: "Purchase milk, eggs, and bread",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groedeedceries",
    description: "hahaha",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groedeedceries",
    description: "hahaha",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groedeedceries",
    description: "hahaha",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groedeedceries",
    description: "hahaha",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groedeedceries",
    description: "hahaha",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groedeedceries",
    description: "hahaha",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
  {
    title: "Buy groedeedceries",
    description: "hahaha",
    latitude: 32.0853,
    longitude: 34.7818,
    time: "10:00 AM",
    signedUp: false
  },
];

(async () => {
  for (const task of tasks) {
    try {
      const response = await axios.post('http://localhost:5001/api/tasks', task);
      console.log('✅ Task created:', response.data.title);
    } catch (error) {
      console.error('❌ Failed to create task:', task.title, error.response?.data || error.message);
    }
  }
})();
