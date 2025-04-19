<template>
  <div class="container">
    <div class="controls-container">
      <p>Controls:</p>
      <p>Spacebar: Spin</p>
      <p>Up/Down: Adjust Risk</p>
      <p>K: Add 500 coins</p>
    </div>
    <h1>Get money fast</h1>
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
      balance: 500, // Initial balance
      risk: 100, // Initial risk
      balanceHistory: [500],
      chartInstance: null,
    };
  },
  mounted() {
    // Initialize chart
    this.$nextTick(this.initChart);
    // Add event listeners for keyboard controls
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    // Clean up event listeners
    document.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    initChart() {
      // Set up the chart
      const chartDom = document.getElementById("balanceChart");
      this.chartInstance = echarts.init(chartDom);

      // Set chart options
      const option = this.getChartOptions();
      this.chartInstance.setOption(option);
    },
    getChartOptions() {
      // Return chart options
      return {
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
                params.value >= 0
                  ? "rgba(0, 255, 0, 0.5)"
                  : "rgba(255, 0, 0, 0.5)",
            },
          },
        ],
      };
    },
    updateChart(netChange) {
      // Get chart options
      const option = this.chartInstance.getOption();
      // Update chart data
      const labels = option.xAxis[0].data;
      const balanceData = option.series[0].data;
      const gainLossData = option.series[1].data;

      // Maximize the number of Joints to 50
      if (labels.length > 50) {
        labels.shift();
        balanceData.shift();
        gainLossData.shift();
      }

      // Add new data
      labels.push(this.balanceHistory.length.toString());
      balanceData.push(this.balance);
      gainLossData.push(netChange);

      // Update chart with new data
      this.chartInstance.setOption({
        xAxis: { data: labels },
        series: [{ data: balanceData }, { data: gainLossData }],
      });
    },
    handleKeydown(event) {
      switch (event.key) {
        case " ": // Spacebar spin
          event.preventDefault();
          this.spin();
          break;
        case "k": // Add coins
          this.addCoins(500);
          break;
        case "ArrowUp": // Increase risk
          event.preventDefault();
          this.adjustRisk(50);
          break;
        case "ArrowDown": // Decrease risk
          event.preventDefault();
          this.adjustRisk(-50);
          break;
      }
    },
    addCoins(amount) {
      // Add coins to balance and update chart
      this.balance += amount;
      this.balanceHistory.push(this.balance);
      this.updateChart(amount);
    },
    adjustRisk(amount) {
      // Minimum of 10 and maximum of balance
      this.risk = Math.max(10,
        Math.min(this.balance, this.risk + amount)
      );
    },
    spin() {
      // Prevent negative balance
      const maxChange = Math.min(this.balance, this.risk);
      const randomNumber = Math.random();
      const expectedLoss = -2; // Just enough to not be noticeable
      // Adjust the random number to be between -1 and 1
      const adjustedRandomNumber = (randomNumber - 0.5) * 2;
      // Calculate the net change
      const netChange = Math.round(
        adjustedRandomNumber * maxChange + expectedLoss
      );

      // Update balance and history
      // Prevent negative balance
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
  height: 60vh;
  background-color: #333;
  border-radius: 8px;
  margin-bottom: 20px;
}

h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #eee;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.balance,
.risk {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #ddd;
}
</style>
