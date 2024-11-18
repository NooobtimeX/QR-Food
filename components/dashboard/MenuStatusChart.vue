<template>
  <div class="card m-auto w-full">
    <h2 class="mb-2 text-xl font-semibold">Menu Activity</h2>
    <canvas ref="menuChart" class="max-h-80"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Chart from "chart.js/auto";
import axios from "axios";

const props = defineProps({ branchId: String });
const menuChart = ref(null);
let chartInstance = null;
let intervalId = null;

async function fetchMenuData() {
  const response = await axios.get(
    `/api/dashboard/menus?branchId=${props.branchId}`,
  );
  return response.data;
}

function updateChart(data) {
  const menuStatusCounts = {
    Active: data.filter((menu) => menu.isActive).length,
    Inactive: data.filter((menu) => !menu.isActive).length,
  };

  if (chartInstance) {
    chartInstance.data.datasets[0].data = Object.values(menuStatusCounts);
    chartInstance.update();
  } else {
    chartInstance = new Chart(menuChart.value, {
      type: "doughnut",
      data: {
        labels: ["Active", "Inactive"],
        datasets: [
          {
            data: Object.values(menuStatusCounts),
            backgroundColor: ["#34d399", "#f87171"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
      },
    });
  }
}

onMounted(() => {
  async function fetchAndUpdateChart() {
    const menuData = await fetchMenuData();
    updateChart(menuData);
  }

  fetchAndUpdateChart(); // Initial fetch
  intervalId = setInterval(fetchAndUpdateChart, 2000); // Fetch every 2 seconds
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId); // Clear interval when the component is unmounted
  }
});
</script>
