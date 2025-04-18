<template>
  <div class="container">
    <div class="controls-container">
      <p>Controls:</p>
      <p>Spacebar: Spin</p>
      <p>Up/Down: Adjust Risk</p>
      <p>K: Add 500 coins</p>
    </div>
    <h1>Balance History</h1>
    <div id="balanceChart" class="chart"></div>
    <div id="balance" class="balance">Balance: {{ balance }}</div>
    <div id="risk" class="risk">Risk: {{ risk }}</div>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "SlotMachineSimulator",
  data() {
    return {
      balance: 500,
      risk: 100,
      balanceHistory: [500],
      chartInstance: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    initChart() {
      const chartDom = document.getElementById("balanceChart");
      this.chartInstance = echarts.init(chartDom);

      const option = {
        xAxis: {
          type: "category",
          data: ["Initial"],
          axisLabel: { color: "#777" },
          axisLine: { lineStyle: { color: "#444" } },
        },
        yAxis: {
          type: "value",
          axisLabel: { color: "#777" },
          axisLine: { lineStyle: { color: "#444" } },
          splitLine: { lineStyle: { color: "#444" } },
        },
        series: [
          {
            name: "Balance",
            type: "line",
            data: [this.balance],
            lineStyle: { color: "rgb(75, 192, 192)" },
          },
          {
            name: "Gain/Loss",
            type: "bar",
            data: [],
            itemStyle: {
              color: (params) =>
                params.value >= 0 ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)",
            },
          },
        ],
      };

      this.chartInstance.setOption(option);
    },
    updateChart(netChange) {
      console.log("Updating chart with netChange:", netChange);
      console.log("Current balance:", this.balance);

      const option = this.chartInstance.getOption();
      const labels = option.xAxis[0].data;
      const balanceData = option.series[0].data;
      const gainLossData = option.series[1].data;

      if (labels.length > 200) {
        labels.shift();
        balanceData.shift();
        gainLossData.shift();
      }

      labels.push(this.balanceHistory.length.toString());
      balanceData.push(this.balance);
      gainLossData.push(netChange);

      this.chartInstance.setOption({
        xAxis: { data: labels },
        series: [
          { data: balanceData },
          { data: gainLossData },
        ],
      });
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
    },
  },
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #252525;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.chart {
  width: 90%;
  height: 60vh; /* Adjust height to occupy more screen space */
  background-color: #333;
  border-radius: 8px;
  margin-bottom: 20px;
}

h1 {
  font-size: 3rem; /* Increase font size */
  margin-bottom: 20px;
  color: #eee;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.balance, .risk {
  font-size: 1.5rem; /* Increase font size */
  margin-bottom: 20px;
  color: #ddd;
}
</style>
