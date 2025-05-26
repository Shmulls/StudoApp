export interface Task {
  _id: string;
  title: string;
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  } | null;
  locationLabel?: string; // <-- Add this line
  time: string;
  signedUp: boolean;
  completed?: boolean;
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
