Module.register("MMM-SimpleGraph", {
  defaults: {
    width: 400,
    height: 200,
    lineColor: "#00aaff",
    dataFile: "data.json",
    updateInterval: 60 * 1000
  },

  getScripts() {
    return [
      "https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.js",
      "https://cdn.jsdelivr.net/npm/luxon/build/global/luxon.min.js",
      "https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon/dist/chartjs-adapter-luxon.min.js"
    ];
  },

  start() {
    this.dataPoints = [];

    const resolvedPath = this.file(this.config.dataFile);
    this.sendSocketNotification("LOAD_DATA", resolvedPath);

    setInterval(() => {
      this.sendSocketNotification("LOAD_DATA", resolvedPath);
    }, this.config.updateInterval);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "DATA_LOADED") {
      this.dataPoints = Array.isArray(payload) ? payload : [];
      this.updateDom();
    }
  },

  getDom() {
    const wrapper = document.createElement("div");
    const canvas = document.createElement("canvas");

    canvas.width = this.config.width;
    canvas.height = this.config.height;
    wrapper.appendChild(canvas);

    setTimeout(() => this.drawChart(canvas), 50);

    return wrapper;
  },

  drawChart(canvas) {
    if (!this.dataPoints || this.dataPoints.length === 0) return;

    const points = this.dataPoints.map(d => ({
      x: new Date(d.date),
      y: d.value
    }));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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