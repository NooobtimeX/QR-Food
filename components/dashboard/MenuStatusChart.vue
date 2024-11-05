<template>
  <div class="m-auto my-4 w-full rounded-lg border p-4 shadow">
    <h2 class="mb-2 text-xl font-semibold">Menu Activity</h2>
    <canvas ref="menuChart" class="max-h-80"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";
import axios from "axios";

const props = defineProps({ branchId: String });
const menuChart = ref(null);

async function fetchMenuData() {
  const response = await axios.get(
    `/api/dashboard/menus?branchId=${props.branchId}`,
  );
  return response.data;
}

onMounted(async () => {
  const menuData = await fetchMenuData();
  const menuStatusCounts = {
    Active: menuData.filter((menu) => menu.isActive).length,
    Inactive: menuData.filter((menu) => !menu.isActive).length,
  };

  new Chart(menuChart.value, {
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
});
</script>
