<template>
  <div class="m-auto my-4 w-full rounded-lg border p-4 shadow">
    <h2 class="mb-2 text-xl font-semibold">Table Status</h2>
    <canvas ref="tableChart" class="max-h-80"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";
import axios from "axios";

const props = defineProps({ branchId: String });
const tableChart = ref(null);

async function fetchTableData() {
  const response = await axios.get(
    `/api/dashboard/tables?branchId=${props.branchId}`,
  );
  return response.data;
}

onMounted(async () => {
  const tableData = await fetchTableData();
  const tableStatusCounts = tableData.reduce((acc, table) => {
    acc[table.status] = (acc[table.status] || 0) + 1;
    return acc;
  }, {});

  new Chart(tableChart.value, {
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
});
</script>
