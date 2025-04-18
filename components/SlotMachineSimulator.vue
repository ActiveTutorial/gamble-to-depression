<template>
  <div class="container">
    <div class="controls-container">
      <p>Controls:</p>
      <p>Spacebar: Spin</p>
      <p>Up/Down: Adjust Risk</p>
      <p>K: Add 500 coins</p>
    </div>
    <h1>Balance History</h1>
    <canvas id="balanceChart" width="400" height="200"></canvas>
    <div id="balance" class="balance">Balance: {{ balance }}</div>
    <div id="risk" class="risk">Risk: {{ risk }}</div>
  </div>
</template>

<script>
import { Chart } from "chart.js";

export default {
  name: "SlotMachineSimulator",
  data() {
    return {
      balance: 500,
      risk: 100,
      balanceHistory: [500],
      balanceChart: null,
      reelSymbols: ["A", "B", "C", "X", "Y", "Z", "1", "2", "3"],
    };
  },
  mounted() {
    this.initChart();
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    initChart() {
      const ctx = document.getElementById("balanceChart").getContext("2d");
      this.balanceChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Initial"],
          datasets: [
            {
              label: "Balance",
              data: [this.balance],
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
            {
              label: "Gain/Loss",
              data: [],
              type: "bar",
              backgroundColor: [],
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: "#777" },
              grid: { color: "#444" },
            },
            x: {
              ticks: { color: "#777" },
              grid: { color: "#444" },
            },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    },
    updateChart(netChange) {
      if (this.balanceChart.data.labels.length > 200) {
        this.balanceChart.data.labels.shift();
        this.balanceChart.data.datasets[0].data.shift();
        this.balanceChart.data.datasets[1].data.shift();
        this.balanceChart.data.datasets[1].backgroundColor.shift();
      }

      this.balanceChart.data.labels.push(this.balanceHistory.length.toString());
      this.balanceChart.data.datasets[0].data.push(this.balance);
      this.balanceChart.data.datasets[1].data.push(netChange);
      this.balanceChart.data.datasets[1].backgroundColor.push(
        netChange >= 0 ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)"
      );
      this.balanceChart.update();
    },
    handleKeydown(event) {
      if (event.key === " ") {
        event.preventDefault();
        this.spin();
      }
      if (event.key === "k") {
        this.balance += 500;
        this.balanceHistory.push(this.balance);
        this.updateChart(500);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this.risk = Math.min(this.balance, this.risk + 50);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.risk = Math.max(10, this.risk - 50);
      }
    },
    spin() {
      const maxChange = Math.min(this.balance, this.risk);
      const randomNumber = Math.random();
      const expectedLoss = -2;
      const adjustedRandomNumber = randomNumber - 0.5;
      const netChange = Math.round(
        adjustedRandomNumber * 2 * maxChange + expectedLoss
      );

      this.balance = Math.max(0, this.balance + netChange);
      this.balanceHistory.push(this.balance);
      this.updateChart(netChange);
      this.spinReels();
    },
    spinReels() {
      const reelElements = document.querySelectorAll(".reel-text");
      reelElements.forEach((reel) => {
        reel.classList.add("spinning");
        setTimeout(() => {
          reel.classList.remove("spinning");
          reel.textContent =
            this.reelSymbols[
              Math.floor(Math.random() * this.reelSymbols.length)
            ];
        }, 700);
      });
    },
  },
};
</script>

<style scoped>
/* ...existing CSS styles from the prompt... */
</style>
