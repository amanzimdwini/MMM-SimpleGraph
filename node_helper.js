const NodeHelper = require("node_helper");
const fs = require("fs");

module.exports = NodeHelper.create({
  socketNotificationReceived(notification, payload) {
    if (notification === "LOAD_DATA") {
      this.loadData(payload);
    }
  },

  loadData(filePath) {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) return;

      try {
        const json = JSON.parse(data);
        this.sendSocketNotification("DATA_LOADED", json);
      } catch (e) {
        // Invalid JSON — silently ignore
      }
    });
  }
});