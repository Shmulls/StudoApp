export interface Task {
  _id: string;
  title: string;
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  } | null;
  locationLabel: string;
  time: string;
  signedUp: boolean;
  completed: boolean;
  createdBy: string;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  assignedUserImage?: string | null;
  // New fields
  pointsReward: number; // 1, 2, 3, or 4 points
  estimatedHours: number; // 1, 2, 3, or 4 hours
}
