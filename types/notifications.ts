export interface Notification {
  _id: string; // MongoDB ObjectId
  title: string;
  message: string;
  createdAt: string; // ISO date string
}
