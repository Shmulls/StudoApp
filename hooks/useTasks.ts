import { useEffect, useState } from "react";
import { addCompletedTask, fetchTasks, updateTask } from "../api";
import { Task } from "../types/task";
import { addTaskToCalendar } from "../utils/calendarUtils";

export function useTasks(user: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch tasks from the backend
  useEffect(() => {
    const getTasks = async () => {
      try {
        const { data } = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    getTasks();
  }, []);

  // Sign up for a task
  const handleSignUp = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const isSigningUp = !task.signedUp;
    const updatedTask = {
      ...task,
      signedUp: isSigningUp,
      assignedUserId: isSigningUp ? user?.id : null,
      assignedUserName: isSigningUp ? user?.fullName || user?.name : null,
      assignedUserImage: isSigningUp ? user?.imageUrl : null,
    };
    try {
      setLoading(true);
      await Promise.all([
        updateTask(taskId, updatedTask),
        isSigningUp && addTaskToCalendar(task),
      ]);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
      return !task.signedUp;
    } catch (error) {
      console.error("Error updating task:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Complete a task
  const handleComplete = async (selectedTaskId: string, feedback: string) => {
    try {
      setLoading(true);
      const completedTask = tasks.find((task) => task._id === selectedTaskId);
      if (!completedTask) return false;

      const completedTaskData = {
        userId: user?.id,
        taskId: completedTask._id,
        title: completedTask.title,
        description: completedTask.description,
        location: completedTask.location,
        time: completedTask.time,
        signedUp: completedTask.signedUp,
        feedback,
      };

      await addCompletedTask(completedTaskData);
      await updateTask(selectedTaskId, { ...completedTask, completed: true });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === selectedTaskId ? { ...task, completed: true } : task
        )
      );
      return true;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Only incomplete tasks for home feed
  const visibleTasks = tasks.filter((task) => !task.completed);

  return {
    tasks,
    setTasks,
    visibleTasks,
    loading,
    handleSignUp,
    handleComplete,
  };
}
