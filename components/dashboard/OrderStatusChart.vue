<template>
  <div class="card m-auto w-full">
    <h2 class="mb-2 text-xl font-semibold">คำสั่งซื้อของโต๊ะที่ใช้งาน</h2>
    <canvas ref="chart" class="max-h-80"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the plugin
import axios from "axios";

Chart.register(ChartDataLabels); // Register the plugin

const props = defineProps({ branchId: String });
const chart = ref(null);
let chartInstance = null;

async function fetchData() {
  const response = await axios.get(
    `/api/restaurant/dashboard/orders?branchId=${props.branchId}`,
  );
  return response.data;
}

function prepareChartData(data) {
  return data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
}

function getStatusLabel(status) {
  // Map statuses to Thai labels
  const labelMap = {
    finish: "สำเร็จ",
    pending: "กำลังจัดเตรียม",
    cancel: "ยกเลิก",
  };
  return labelMap[status] || "ไม่ทราบสถานะ"; // Default to "Unknown status" in Thai
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
      labels: Object.keys(dataCounts).map(getStatusLabel), // Use Thai labels
      datasets: [
        {
          label: "",
          data: Object.values(dataCounts),
          backgroundColor: Object.keys(dataCounts).map(getStatusColor), // Apply dynamic colors
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        datalabels: {
          color: "#ffffff", // Set label color to white
          font: {
            weight: "bold",
          },
          formatter: (value) => {
            return value; // Show the number on the segment
          },
        },
      },
    },
    plugins: [ChartDataLabels], // Add the plugin to the chart
  });
}

onMounted(async () => {
  const data = await fetchData();
  const dataCounts = prepareChartData(data);

  chartInstance = createChart(chart.value, dataCounts);

  const interval = setInterval(async () => {
    const updatedData = await fetchData();
    const updatedCounts = prepareChartData(updatedData);
    chartInstance.data.labels = Object.keys(updatedCounts).map(getStatusLabel); // Use Thai labels
    chartInstance.data.datasets[0].data = Object.values(updatedCounts);
    chartInstance.data.datasets[0].backgroundColor =
      Object.keys(updatedCounts).map(getStatusColor);
    chartInstance.update();
  }, 30000);

  onUnmounted(() => {
    clearInterval(interval);
    if (chartInstance) chartInstance.destroy();
  });
});
</script>
