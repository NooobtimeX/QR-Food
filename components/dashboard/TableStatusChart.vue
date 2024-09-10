<template>
  <div class="card m-auto w-full">
    <h2 class="mb-2 text-xl font-semibold">สถานะโต็ะอาหาร</h2>
    <canvas ref="tableChart" class="max-h-80"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";

Chart.register(ChartDataLabels);

const props = defineProps({ branchId: String });
const tableChart = ref(null);
let chartInstance = null;

async function fetchTableData() {
  const response = await axios.get(
    `/api/restaurant/dashboard/tables?branchId=${props.branchId}`,
  );
  return response.data;
}

function updateChart(chart, tableStatusCounts) {
  chart.data.labels = Object.keys(tableStatusCounts).map((status) =>
    getStatusLabel(status),
  );
  chart.data.datasets[0].data = Object.values(tableStatusCounts);
  chart.update();
}

function getStatusColor(status) {
  switch (status) {
    case "isReserved":
      return "#34d399"; // green
    case "isOpen":
      return "#d1d5db"; // gray
    case "isUnavailable":
      return "#f87171"; // red
    default:
      return "#000000"; // fallback to black
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "isReserved":
      return "ใช้งานอยู่"; // Reserved (in Thai)
    case "isOpen":
      return "ว่าง"; // Open (in Thai)
    case "isUnavailable":
      return "ใช้ไม่ได้"; // Unavailable (in Thai)
    default:
      return status; // fallback to original status if not found
  }
}

onMounted(async () => {
  const tableData = await fetchTableData();
  const tableStatusCounts = tableData.reduce((acc, table) => {
    acc[table.status] = (acc[table.status] || 0) + 1;
    return acc;
  }, {});

  const statusColors = Object.keys(tableStatusCounts).map((status) =>
    getStatusColor(status),
  );

  chartInstance = new Chart(tableChart.value, {
    type: "pie",
    data: {
      labels: Object.keys(tableStatusCounts).map((status) =>
        getStatusLabel(status),
      ),
      datasets: [
        {
          data: Object.values(tableStatusCounts),
          backgroundColor: statusColors,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        datalabels: {
          color: "#ffffff",
          font: {
            weight: "bold",
          },
          formatter: (value, ctx) => {
            return value; // Display the value on the segment
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });

  const interval = setInterval(async () => {
    const updatedTableData = await fetchTableData();
    const updatedTableStatusCounts = updatedTableData.reduce((acc, table) => {
      acc[table.status] = (acc[table.status] || 0) + 1;
      return acc;
    }, {});
    updateChart(chartInstance, updatedTableStatusCounts);
  }, 30000);

  onUnmounted(() => {
    clearInterval(interval);
    if (chartInstance) chartInstance.destroy();
  });
});
</script>
