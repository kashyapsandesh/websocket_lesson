const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Example route for testing
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("updateLocation", async (data) => {
    const { driverId, latitude, longitude } = data;
    try {
      // Update the driver's location in the database
      const updatedDriver = await prisma.driver.update({
        where: {
          id: driverId,
        },
        data: {
          latitude: latitude,
          longitude: longitude,
        },
      });

      // Broadcast the updated location to all connected clients
      io.emit("locationUpdated", {
        driverId: driverId,
        latitude: latitude,
        longitude: longitude,
      });

      console.log(
        `Location updated for driver ${driverId}: (${latitude}, ${longitude})`
      );
    } catch (error) {
      console.error("Error updating location:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
