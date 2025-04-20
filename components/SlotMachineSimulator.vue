<template>
  <div class="container">
    <div v-if="!isMobile()" class="controls-container">
      <p>Controls:</p>
      <p>Spacebar: Spin</p>
      <p>Up/Down: Adjust Risk</p>
      <p>K: Add 500 coins</p>
    </div>
    <h1>Get money fast</h1>
    <div id="balanceChart" class="chart"></div>
    <!-- Mobile-only Spin button -->
    <button v-if="isMobile()" class="spin-button" @click="spin">Spin!</button>
    <div 
      id="balance" 
      class="balance" 
      @click="isMobile() && addCoins(500)"
    >
      Balance: {{ balance }}
      <button class="plus-button" @click="showPopup = true">+</button>
    </div>
    <!-- Popup -->
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup">
        <button class="close-button" @click="showPopup = false">x</button>
        <CryptoPayment />
      </div>
    </div>
    <div id="risk" class="risk">
      Risk: {{ risk }}
      <!-- Mobile-only risk adjustment buttons -->
      <button v-if="isMobile()" class="risk-button" @click="adjustRisk(-50)">-</button>
      <button v-if="isMobile()" class="risk-button" @click="adjustRisk(50)">+</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as echarts from "echarts";
import CryptoPayment from "./CryptoPayment.vue"; // Import the new component

export default defineComponent({
  name: "SlotMachineSimulator",
  components: {
    CryptoPayment, // Register the component
  },
  data() {
    return {
      balance: 0 as number, // Initial balance
      risk: 50 as number, // Initial risk
      balanceHistory: [] as number[],
      chartInstance: null as echarts.ECharts | null,
      showPopup: false, // Controls the visibility of the popup
    };
  },
  async mounted() {
    (window as any).vue_context = this; // Expose Vue instance to the global scope for debugging
    // Create session and fetch balance on mount
    await this.establishSession();
    this.balance = await this.getBalance();
    this.balanceHistory = [this.balance];
    this.$nextTick(this.initChart);
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    isMobile(): boolean {
      return (navigator as any)?.userAgentData?.mobile;
    },
    async establishSession() {
      try {
        await $fetch("/api/session", {
          method: "POST",
        });
      } catch (error) {
        console.error("Error creating session:", error);
      }
    },
    async getBalance() {
      try {
        const response = await $fetch<{ balance: number }>("/api/balance", {
          method: "GET",
        });
        return response.balance;
      } catch (error) {
        console.error("Error fetching balance:", error);
        return 0; // Default to 0 in case of error
      }
    },
    async setBalance(newBalance: number) {
      try {
        await $fetch("/api/balance", {
          method: "PUT",
          body: { balance: newBalance },
        });
      } catch (error) {
        console.error("Error setting balance:", error);
      }
    },
    async spin() {
      try {
        const response = await $fetch<{ newBalance: number; netChange: number }>("/api/spin", {
          method: "POST",
          body: { risk: this.risk },
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
              color: (params: any) =>
                typeof params.value === "number" && params.value >= 0
                  ? "rgba(0, 255, 0, 0.5)"
                  : "rgba(255, 0, 0, 0.5)",
            },
          },
        ],
      };
    },
    updateChart(netChange: number) {
      // Get chart options
      if (!this.chartInstance) throw new Error("Chart instance is not initialized");

      const option = this.chartInstance.getOption();
      const xAxis = Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis;
      const labels = (
        xAxis?.type === "category" &&
        Array.isArray(xAxis.data) ?
        xAxis.data : []
      ) as string[];
      const balanceData = Array.isArray(option.series) &&
        option.series[0]?.data ?
        (option.series[0].data as number[]) : [];
      const gainLossData = Array.isArray(option.series) &&
        option.series[1]?.data ? 
        (option.series[1].data as number[]) : [];

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
      this.setBalance(this.balance); // Update balance on the server
    },
    adjustRisk(amount: number) {
      // Minimum of 10 and maximum of balance
      this.risk = Math.max(
        10,
        Math.min(this.balance, this.risk + amount)
      );
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

/* Styles for the mobile-only Spin button */
.spin-button {
  touch-action: manipulation; /* Prevent double-tap zoom on mobile */
  width: 80%;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  background-color: #28a745;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
}

.spin-button:active {
  background-color: #218838;
}

/* Styles for the mobile-only risk adjustment buttons */
.risk-button {
  margin: 0 5px;
  padding: 10px;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  touch-action: manipulation; /* Prevent double-tap zoom on mobile */
}

.risk-button:active {
  background-color: #0056b3;
}

.plus-button {
  font-size: 0.8rem;
  font-weight: bold;
  color: #fff;
  background-color: #28a745;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 5px;
  padding: 2px 6px;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup {
  background-color: #333;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #fff;
  position: relative;
  width: 80%;
  max-width: 400px;
  max-height: 80vh; /* Fixed size */
  overflow-y: auto; /* Make it scrollable */
}

/* Dark theme scrollbar */
.popup::-webkit-scrollbar {
  width: 8px;
}

.popup::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 4px;
}

.popup::-webkit-scrollbar-thumb:hover {
  background-color: #777;
}

.popup::-webkit-scrollbar-track {
  background-color: #222;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-button:hover {
  color: #ccc;
}
</style>
