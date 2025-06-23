const request = require("supertest");
const express = require("express");
const notificationsRouter = require("./notifications");

jest.mock("../models/Notification");
const Notification = require("../models/Notification");

const app = express();
app.use(express.json());
app.use("/", notificationsRouter);

describe("Notifications API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /:userId", () => {
    it("returns notifications for a user", async () => {
      Notification.find.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValueOnce([
          { _id: "n1", userId: "user1", message: "Hello" },
          { _id: "n2", userId: "all", message: "Broadcast" },
        ]),
      });

      const res = await request(app).get("/user1");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].message).toBe("Hello");
    });

    it("returns 500 on error", async () => {
      Notification.find.mockReturnValueOnce({
        sort: jest.fn().mockRejectedValueOnce(new Error("fail")),
      });
      const res = await request(app).get("/user1");
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe("Failed to fetch notifications");
    });
  });

  describe("PATCH /:notificationId", () => {
    it("marks notification as read", async () => {
      Notification.findByIdAndUpdate = jest.fn().mockResolvedValueOnce({
        _id: "n1",
        status: "read",
      });
      const res = await request(app).patch("/n1").send({ status: "read" });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("read");
    });

    it("returns 404 if notification not found", async () => {
      Notification.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(null);
      const res = await request(app).patch("/n1").send({ status: "read" });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Notification not found");
    });

    it("returns 500 on error", async () => {
      Notification.findByIdAndUpdate = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"));
      const res = await request(app).patch("/n1").send({ status: "read" });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("fail");
    });
  });

  describe("POST /", () => {
    it("creates a notification", async () => {
      Notification.prototype.save = jest.fn().mockResolvedValueOnce({});
      const res = await request(app)
        .post("/")
        .send({ userId: "user1", message: "Test" });
      expect(res.statusCode).toBe(201);
      expect(Notification.prototype.save).toHaveBeenCalled();
    });

    it("returns 400 on error", async () => {
      Notification.prototype.save = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"));
      const res = await request(app)
        .post("/")
        .send({ userId: "user1", message: "Test" });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("fail");
    });
  });
});
