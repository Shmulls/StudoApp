const request = require("supertest");
const express = require("express");
const completedTasksRouter = require("./completedtasks");

jest.mock("../models/CompletedTask");
jest.mock("../models/Task");
jest.mock("../models/Notification");

const CompletedTask = require("../models/CompletedTask");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

const app = express();
app.use(express.json());
app.use("/", completedTasksRouter);

describe("CompletedTasks API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /completed-tasks", () => {
    it("creates a completed task and updates the original task", async () => {
      CompletedTask.prototype.save = jest.fn().mockResolvedValueOnce({});
      Task.findByIdAndUpdate = jest
        .fn()
        .mockResolvedValueOnce({ _id: "task1" });
      Task.findById = jest.fn().mockResolvedValueOnce({
        createdBy: "org1",
        title: "Test Task",
        description: "desc",
        // Add any other fields accessed in notification logic
      });
      Notification.prototype.save = jest.fn().mockResolvedValueOnce({});

      const res = await request(app).post("/completed-tasks").send({
        userId: "user1",
        taskId: "task1",
        title: "Test Task",
        description: "desc",
        location: {},
        time: new Date().toISOString(),
        userName: "User",
        userImage: "img.png",
        feedback: "Great!",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(CompletedTask.prototype.save).toHaveBeenCalled();
      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
        "task1",
        expect.objectContaining({ completed: true }),
        { new: true }
      );
      expect(Notification.prototype.save).toHaveBeenCalled();
    });

    it("returns 500 on error", async () => {
      CompletedTask.prototype.save = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"));
      const res = await request(app)
        .post("/completed-tasks")
        .send({ userId: "user1", taskId: "task1" });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe("Failed to complete task");
    });
  });

  describe("GET /completed-tasks", () => {
    it("returns completed tasks", async () => {
      CompletedTask.find.mockReturnValueOnce({
        sort: jest
          .fn()
          .mockResolvedValueOnce([{ _id: "c1", title: "Completed Task" }]),
      });
      const res = await request(app).get("/completed-tasks");
      expect(res.statusCode).toBe(200);
      expect(res.body[0].title).toBe("Completed Task");
    });

    it("returns 500 on error", async () => {
      CompletedTask.find.mockReturnValueOnce({
        sort: jest.fn().mockRejectedValueOnce(new Error("fail")),
      });
      const res = await request(app).get("/completed-tasks");
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe("fail");
    });
  });
});
