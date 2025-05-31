export interface Task {
  _id: string;
  title: string;
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  } | null;
  locationLabel?: string;
  time: string;
  signedUp: boolean;
  completed?: boolean;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  assignedUserImage?: string | null;
}
