/* node_helper.js — CLEAN, VALID, DEBUG VERSION */

const NodeHelper = require("node_helper");
const fs = require("fs");
const http = require("http");
const https = require("https");

module.exports = NodeHelper.create({
  start() {
    console.log("MMM-SimpleGraph helper: started");
  },

  socketNotificationReceived(notification, payload) {
    console.log("MMM-SimpleGraph helper: received notification:", notification);

    if (notification === "LOAD_DATA") {
      console.log("MMM-SimpleGraph helper: loading data from:", payload);
      this.loadData(payload);
    }
  },

  loadData(filePath) {
    console.log("MMM-SimpleGraph helper: loadData() called with:", filePath);

    // Remote URL?
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      console.log("MMM-SimpleGraph helper: detected remote URL");

      const client = filePath.startsWith("https://") ? https : http;

      client.get(filePath, res => {
        let data = "";
        console.log("MMM-SimpleGraph helper: HTTP GET status:", res.statusCode);

        res.on("data", chunk => (data += chunk));
        res.on("end", () => {
          console.log("MMM-SimpleGraph helper: HTTP GET complete, length:", data.length);

          try {
            const json = JSON.parse(data);
            console.log("MMM-SimpleGraph helper: JSON parsed OK");
            this.sendSocketNotification("DATA_LOADED", json);
          } catch (e) {
            console.log("MMM-SimpleGraph helper: JSON parse error:", e);
          }
        });
      }).on("error", err => {
        console.log("MMM-SimpleGraph helper: HTTP GET error:", err);
      });

      return;
    }

    // Local file
    console.log("MMM-SimpleGraph helper: reading local file");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.log("MMM-SimpleGraph helper: fs.readFile error:", err);
        return;
      }

      try {
        const json = JSON.parse(data);
        console.log("MMM-SimpleGraph helper: local JSON parsed OK");
        this.sendSocketNotification("DATA_LOADED", json);
      } catch (e) {
        console.log("MMM-SimpleGraph helper: local JSON parse error:", e);
      }
    });
  }
});