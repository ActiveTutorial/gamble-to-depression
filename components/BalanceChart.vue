<template>
  <div id="balanceChart" class="chart">
    <BarChart :chart-data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Chart from 'chart.js/auto';
import { BarChart } from "vue-chart-3";

export default defineComponent({
  name: "BalanceChart",
  components: { BarChart },
  props: {
    balanceHistory: {
      type: Array as () => number[],
      required: true,
    },
    netChange: {
      type: Number,
      required: false,
    },
  },
  setup(props) {
    const limitedBalanceHistory = ref(props.balanceHistory.slice(-50));

    const chartData = ref({
      labels: limitedBalanceHistory.value.map((_, index) => index.toString()),
      datasets: [
        {
          type: "line",
          label: "Balance",
          data: limitedBalanceHistory.value,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 2,
          fill: false,
        },
        {
          type: "bar",
          label: "Gain/Loss",
          data: limitedBalanceHistory.value.map((_, index) =>
            index === 0 ? 0 : limitedBalanceHistory.value[index] - limitedBalanceHistory.value[index - 1]
          ),
          backgroundColor: limitedBalanceHistory.value.map((_, index) => {
            if (index === 0) return "rgba(0, 0, 0, 0.5)";
            const diff = limitedBalanceHistory.value[index] - limitedBalanceHistory.value[index - 1];
            return diff >= 0 ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)";
          }),
          borderColor: limitedBalanceHistory.value.map((_, index) => {
            if (index === 0) return "rgba(0, 0, 0, 1)";
            const diff = limitedBalanceHistory.value[index] - limitedBalanceHistory.value[index - 1];
            return diff >= 0 ? "rgba(0, 200, 0, 1)" : "rgba(200, 0, 0, 1)";
          }),
          borderWidth: 1,
        },
      ],
    });

    const chartOptions = ref({
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        x: { grid: { color: "#444" }, ticks: { color: "#777" } },
        y: { grid: { color: "#444" }, ticks: { color: "#777" } },
      },
    });

    watch(
      () => props.balanceHistory,
      (newHistory) => {
        limitedBalanceHistory.value = newHistory.slice(-50);
        chartData.value.labels = limitedBalanceHistory.value.map((_, index) => index.toString());
        chartData.value.datasets[0].data = limitedBalanceHistory.value;
        chartData.value.datasets[1].data = limitedBalanceHistory.value.map((_, index) =>
          index === 0 ? 0 : limitedBalanceHistory.value[index] - limitedBalanceHistory.value[index - 1]
        );
        chartData.value.datasets[1].backgroundColor = limitedBalanceHistory.value.map((_, index) => {
          if (index === 0) return "rgba(0, 0, 0, 0.5)";
          const diff = limitedBalanceHistory.value[index] - limitedBalanceHistory.value[index - 1];
          return diff >= 0 ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)";
        });
        chartData.value.datasets[1].borderColor = limitedBalanceHistory.value.map((_, index) => {
          if (index === 0) return "rgba(0, 0, 0, 1)";
          const diff = limitedBalanceHistory.value[index] - limitedBalanceHistory.value[index - 1];
          return diff >= 0 ? "rgba(0, 200, 0, 1)" : "rgba(200, 0, 0, 1)";
        });
      },
      { deep: true }
    );

    return { chartData, chartOptions };
  },
});
</script>

<style scoped>
.chart {
  width: 90%;
  height: 60vh;
  background-color: #333;
  border-radius: 8px;
  margin-bottom: 20px;
}
</style>
