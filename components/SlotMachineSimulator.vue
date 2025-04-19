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
import _ from "lodash"; // Add lodash for debouncing

export default {
  name: "SlotMachineSimulator",
  data() {
    return {
      balance: 500,
      risk: 100,
      balanceHistory: [500],
      chartInstance: null,
      debouncedUpdateChart: null, // Add debouncedUpdateChart to data
      spinInterval: null, // Add spinInterval to manage repeated spins
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
      this.debouncedUpdateChart = _.debounce(this.updateChart, 100); // Debounce updateChart
    });
    document.addEventListener("keydown", this.handleKeydown);
    document.addEventListener("keyup", this.handleKeyup); // Add keyup listener
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
    document.removeEventListener("keyup", this.handleKeyup); // Remove keyup listener
  },
  methods: {
    initChart() {
      const chartDom = document.getElementById("balanceChart");
      this.chartInstance = echarts.init(chartDom);

      const option = this.getChartOptions();
      this.chartInstance.setOption(option);
    },
    getChartOptions() {
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
        series: [{ data: balanceData }, { data: gainLossData }],
      });
    },
    handleKeydown(event) {
      switch (event.key) {
        case " ":
          event.preventDefault();
          if (!this.spinInterval) {
            this.spin(); // Trigger an initial spin
            this.spinInterval = setInterval(this.spin, 150); // Repeatedly call spin
          }
          break;
        case "k":
          this.addCoins(500);
          break;
        case "ArrowUp":
          event.preventDefault();
          this.adjustRisk(50);
          break;
        case "ArrowDown":
          event.preventDefault();
          this.adjustRisk(-50);
          break;
      }
    },
    handleKeyup(event) {
      if (event.key === " " && this.spinInterval) {
        clearInterval(this.spinInterval); // Stop repeated spins
        this.spinInterval = null;
      }
    },
    addCoins(amount) {
      this.balance += amount;
      this.balanceHistory.push(this.balance);
      this.updateChart(amount);
    },
    adjustRisk(amount) {
      this.risk = Math.max(10, Math.min(this.balance, this.risk + amount));
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
      this.debouncedUpdateChart(netChange); // Use debounced method
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
