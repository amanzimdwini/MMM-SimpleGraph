/* MMM-SimpleGraph.js — CLEAN, VALID, DEBUG VERSION */

Module.register("MMM-SimpleGraph", {
  defaults: {
    width: 400,
    height: 200,
    lineColor: "#00aaff",
    dataFile: "data.json",
    updateInterval: 60 * 1000
  },

  getScripts() {
    console.log("MMM-SimpleGraph: getScripts() called");
    return [
      "https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.js",
      "https://cdn.jsdelivr.net/npm/luxon/build/global/luxon.min.js",
      "https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon/dist/chartjs-adapter-luxon.min.js"
    ];
  },

  start() {
    console.log("MMM-SimpleGraph: START() called");

    this.dataPoints = [];

    const resolvedPath = this.config.dataFile;
    console.log("MMM-SimpleGraph: resolvedPath =", resolvedPath);

    this.sendSocketNotification("LOAD_DATA", resolvedPath);

    setInterval(() => {
      console.log("MMM-SimpleGraph: sending LOAD_DATA again");
      this.sendSocketNotification("LOAD_DATA", resolvedPath);
    }, this.config.updateInterval);
  },

  socketNotificationReceived(notification, payload) {
    console.log("MMM-SimpleGraph: socketNotificationReceived:", notification);

    if (notification === "DATA_LOADED") {
      console.log("MMM-SimpleGraph: DATA_LOADED received, payload length:",
        Array.isArray(payload) ? payload.length : "not array");

      this.dataPoints = Array.isArray(payload) ? payload : [];
      this.updateDom();
    }
  },

  getDom() {
    console.log("MMM-SimpleGraph: getDom() called");

    const wrapper = document.createElement("div");
    const canvas = document.createElement("canvas");

    canvas.width = this.config.width;
    canvas.height = this.config.height;
    wrapper.appendChild(canvas);

    setTimeout(() => this.drawChart(canvas), 50);

    return wrapper;
  },

  drawChart(canvas) {
    console.log("MMM-SimpleGraph: drawChart() called");

    if (!this.dataPoints || this.dataPoints.length === 0) {
      console.log("MMM-SimpleGraph: no dataPoints to draw");
      return;
    }

    const points = this.dataPoints.map(d => ({
      x: new Date(d.date),
      y: d.value
    }));

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("MMM-SimpleGraph: no canvas context");
      return;
    }

    new Chart(ctx, {
      type: "line",
      data: {
        datasets: [{
          data: points,
          borderColor: this.config.lineColor,
          borderWidth: 2,
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: {
            type: "time",
            time: { unit: "day", tooltipFormat: "MM-dd" },
            ticks: { color: "#ffffff", font: { size: 14 } },
            grid: { color: "rgba(255,255,255,0.2)" }
          },
          y: {
            ticks: { color: "#ffffff", font: { size: 14 } },
            grid: { color: "rgba(255,255,255,0.2)" }
          }
        }
      }
    });
  }
});