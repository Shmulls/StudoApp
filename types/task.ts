export interface Task {
  _id: string;
  title: string;
  description: string;
  location: string;
  time: any;
  signedUp: boolean;
  completed?: boolean; // Optional property for completed status
  completedAt?: string; // Optional property for completion timestamp
}

// // Define the Task type
// interface Task {
//   _id: string;
//   title: string;
//   description: string;
//   location: string;
//   time: string;
//   signedUp: boolean;
// }
