<template>
  <div class="card m-auto w-full">
    <h2 class="mb-2 text-xl font-semibold">สถานะโต็ะอาหาร</h2>
    <canvas ref="tableChart" class="max-h-80"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Chart from "chart.js/auto";
import axios from "axios";

const props = defineProps({ branchId: String });
const tableChart = ref(null);
let chartInstance = null;

async function fetchTableData() {
  const response = await axios.get(
    `/api/dashboard/tables?branchId=${props.branchId}`,
  );
  return response.data;
}

function updateChart(chart, tableStatusCounts) {
  chart.data.labels = Object.keys(tableStatusCounts);
  chart.data.datasets[0].data = Object.values(tableStatusCounts);
  chart.update();
}

onMounted(async () => {
  const tableData = await fetchTableData();
  const tableStatusCounts = tableData.reduce((acc, table) => {
    acc[table.status] = (acc[table.status] || 0) + 1;
    return acc;
  }, {});

  chartInstance = new Chart(tableChart.value, {
    type: "pie",
    data: {
      labels: Object.keys(tableStatusCounts),
      datasets: [
        {
          data: Object.values(tableStatusCounts),
          backgroundColor: ["#f87171", "#34d399", "#60a5fa"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  });

  const interval = setInterval(async () => {
    const updatedTableData = await fetchTableData();
    const updatedTableStatusCounts = updatedTableData.reduce((acc, table) => {
      acc[table.status] = (acc[table.status] || 0) + 1;
      return acc;
    }, {});
    updateChart(chartInstance, updatedTableStatusCounts);
  }, 2000);

  onUnmounted(() => {
    clearInterval(interval);
    if (chartInstance) chartInstance.destroy();
  });
});
</script>
