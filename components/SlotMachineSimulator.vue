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

<script lang="ts">
import { defineComponent } from "vue";
import * as echarts from "echarts";

export default defineComponent({
  name: "SlotMachineSimulator",
  data() {
    return {
      balance: 500 as number, // Initial balance
      risk: 100 as number, // Initial risk
      balanceHistory: [500] as number[],
      chartInstance: null as echarts.ECharts | null,
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
      if (!chartDom) return;
      this.chartInstance = echarts.init(chartDom);

      // Set chart options
      const option = this.getChartOptions();
      this.chartInstance.setOption(option);
    },
    getChartOptions(): echarts.EChartsOption {
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
              color: (params: { value: number }) =>
                params.value >= 0
                  ? "rgba(0, 255, 0, 0.5)"
                  : "rgba(255, 0, 0, 0.5)",
            },
          },
        ],
      };
    },
    updateChart(netChange: number) {
      // Get chart options
      if (!this.chartInstance) return;
      const option = this.chartInstance.getOption();
      const labels = option.xAxis[0].data as string[];
      const balanceData = option.series[0].data as number[];
      const gainLossData = option.series[1].data as number[];

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
    handleKeydown(event: KeyboardEvent) {
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
    addCoins(amount: number) {
      // Add coins to balance and update chart
      this.balance += amount;
      this.balanceHistory.push(this.balance);
      this.updateChart(amount);
    },
    adjustRisk(amount: number) {
      // Minimum of 10 and maximum of balance
      this.risk = Math.max(
        10,
        Math.min(this.balance, this.risk + amount)
      );
    },
    async spin() {
      try {
        const response = await $fetch<{ newBalance: number; netChange: number }>("/api/spin", {
          method: "POST",
          body: { balance: this.balance, risk: this.risk },
        });

        const { newBalance, netChange } = response;

        // Update balance and history
        this.balance = newBalance;
        this.balanceHistory.push(this.balance);
        this.updateChart(netChange);
      } catch (error) {
        console.error("Error during spin:", error);
      }
    },
  },
});
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
