require("dotenv").config(); // Load environment variables
const mongoose = require("mongoose");
const Task = require("../models/Task");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const convertToISO = (timeStr) => {
  const today = new Date().toISOString().split("T")[0]; // "2025-05-07"
  const dateTimeStr = `${today} ${timeStr}`;
  const parsedDate = new Date(dateTimeStr);
  console.log(
    `Trying to convert "${timeStr}" → "${dateTimeStr}" →`,
    parsedDate.toISOString()
  );
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString();
  } else {
    console.warn(`⚠️ Invalid date string: ${timeStr}`);
    return null;
  }
};

(async () => {
  try {
    const tasks = await Task.find({});
    console.log(`🔍 Found ${tasks.length} tasks`);
    for (const task of tasks) {
      console.log(`➡️ Task ${task._id} has time:`, task.time);
      if (
        typeof task.time === "string" &&
        (task.time.includes("AM") || task.time.includes("PM"))
      ) {
        const isoTime = convertToISO(task.time);
        if (isoTime) {
          task.time = isoTime;
          await task.save();
          console.log(`✅ Updated ${task._id} to ISO time: ${task.time}`);
        } else {
          console.log(
            `⏭️ Skipped task ${task._id}: could not parse "${task.time}"`
          );
        }
      } else {
        console.log(`⏭️ Skipped task ${task._id}: not a parsable AM/PM string`);
      }
    }
    console.log("✅ Task migration completed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
})();
