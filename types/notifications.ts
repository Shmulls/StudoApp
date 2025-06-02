export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "task_completed" | "task_assigned" | "task_reminder" | "general";
  organizationId: string;
  userId: string; // Who should receive this notification
  taskId?: string; // Reference to the task if applicable
  completedBy?: {
    id: string;
    name: string;
    image?: string;
  };
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
