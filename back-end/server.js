const cluster = require("cluster");
const os = require("os");
const mongoose = require("mongoose");
require("dotenv").config();

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });

} else {
  const app = require("./src/utils/index");
  const { connectDB } = require("./src/config/db");

  const PORT = process.env.PORT || 5000;

  connectDB();

  app.use("/", (req, res) => {
    res.status(200).json(`Hello from Worker ${process.pid}`);
  });

  const server = app.listen(PORT, () => {
    console.log(`Worker ${process.pid} running on port ${PORT}`);
  });

  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    server.close(() => process.exit(0));
  });
}