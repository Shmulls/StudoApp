const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const tasksRouter = require("./tasks");

// Mock models
jest.mock("../models/Task");
jest.mock("../models/CompletedTask");
jest.mock("../models/Notification");

const Task = require("../models/Task");
const CompletedTask = require("../models/CompletedTask");
const Notification = require("../models/Notification");

const app = express();
app.use(express.json());
app.use("/tasks", tasksRouter);

describe("Tasks API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /tasks", () => {
    it("returns tasks for an organization", async () => {
      Task.find.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValueOnce([
          {
            _id: "1",
            title: "Task 1",
            signedUpUsers: [],
          },
        ]),
      });
      const res = await request(app)
        .get("/tasks")
        .query({ organizationId: "org1", userRole: "organization" });
      expect(res.statusCode).toBe(200);
      expect(res.body[0].title).toBe("Task 1");
    });

    it("returns tasks with signup status for a user", async () => {
      Task.find.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValueOnce([
          {
            toObject: () => ({
              _id: "1",
              title: "Task 1",
              signedUpUsers: [{ userId: "u1" }],
            }),
            signedUpUsers: [{ userId: "u1" }],
          },
        ]),
      });
      const res = await request(app).get("/tasks").query({ userId: "u1" });
      expect(res.statusCode).toBe(200);
      expect(res.body[0].signedUp).toBe(true);
    });
  });

  describe("POST /tasks", () => {
    it("creates a new task", async () => {
      Task.prototype.save = jest
        .fn()
        .mockResolvedValueOnce({ _id: "1", title: "Task 1" });
      Notification.prototype.save = jest.fn().mockResolvedValueOnce({});
      const res = await request(app).post("/tasks").send({
        title: "Task 1",
        description: "desc",
        time: new Date().toISOString(),
        createdBy: "org1",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("returns 400 if required fields are missing", async () => {
      const res = await request(app).post("/tasks").send({ title: "Task 1" });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Missing required fields/);
    });
  });

  describe("PATCH /tasks/:id/complete", () => {
    it("completes a task for a signed-up user", async () => {
      Task.findById = jest.fn().mockResolvedValueOnce({
        _id: "1",
        title: "Task 1",
        description: "desc",
        location: {},
        time: new Date(),
        signedUpUsers: [{ userId: "u1" }],
        maxSignups: 1,
        completed: false,
        createdBy: "org1",
        save: jest.fn(),
        toObject: () => ({}),
      });
      CompletedTask.prototype.save = jest
        .fn()
        .mockResolvedValueOnce({ _id: "c1" });
      Notification.prototype.save = jest.fn().mockResolvedValueOnce({});
      const res = await request(app)
        .patch("/tasks/1/complete")
        .send({ userId: "u1" });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("returns 400 if user not signed up", async () => {
      Task.findById = jest.fn().mockResolvedValueOnce({
        signedUpUsers: [],
        save: jest.fn(),
        toObject: () => ({}),
      });
      const res = await request(app)
        .patch("/tasks/1/complete")
        .send({ userId: "u2" });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/User not signed up/);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("deletes a task", async () => {
      Task.findByIdAndDelete = jest.fn().mockResolvedValueOnce({});
      const res = await request(app).delete("/tasks/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Task deleted");
    });
  });
});
