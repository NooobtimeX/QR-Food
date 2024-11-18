<template>
  <div class="card m-auto w-full">
    <h2 class="mb-2 text-xl font-semibold">คำสั่งซื้อ</h2>
    <canvas ref="chart" class="max-h-80"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Chart from "chart.js/auto";
import axios from "axios";

const props = defineProps({ branchId: String });
const chart = ref(null);
let chartInstance = null;

async function fetchData() {
  const response = await axios.get(
    `/api/dashboard/orders?branchId=${props.branchId}`,
  );
  return response.data;
}

function prepareChartData(data) {
  return data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
}

function getStatusColor(status) {
  // Map statuses to colors
  const colorMap = {
    finish: "#34d399", // Green
    pending: "#fbbf24", // Yellow
    cancel: "#f87171", // Red
  };
  return colorMap[status] || "#60a5fa"; // Default to blue if no match
}

function createChart(chartElement, dataCounts) {
  return new Chart(chartElement, {
    type: "pie",
    data: {
      labels: Object.keys(dataCounts),
      datasets: [
        {
          label: "Order Counts by Status",
          data: Object.values(dataCounts),
          backgroundColor: Object.keys(dataCounts).map(getStatusColor), // Apply dynamic colors
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  });
}

onMounted(async () => {
  const data = await fetchData();
  const dataCounts = prepareChartData(data);

  chartInstance = createChart(chart.value, dataCounts);

  const interval = setInterval(async () => {
    const updatedData = await fetchData();
    const updatedCounts = prepareChartData(updatedData);
    chartInstance.data.labels = Object.keys(updatedCounts);
    chartInstance.data.datasets[0].data = Object.values(updatedCounts);
    chartInstance.data.datasets[0].backgroundColor =
      Object.keys(updatedCounts).map(getStatusColor);
    chartInstance.update();
  }, 2000);

  onUnmounted(() => {
    clearInterval(interval);
    if (chartInstance) chartInstance.destroy();
  });
});
</script>
