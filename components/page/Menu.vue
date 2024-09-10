<template>
  <div class="container mx-auto p-4">
    <h1 class="pb-4">รายการอาหาร</h1>

    <!-- Search Input -->
    <div class="mb-4 flex justify-center pt-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="ค้นหาเมนู..."
        class="w-1/2 rounded-xl border border-gray-300 p-2 shadow-sm focus:border-orange-500 focus:outline-none"
      />
    </div>
    <!-- No Menus Message -->
    <div v-if="filteredMenus.length === 0" class="text-gray-500">
      No menus available.
    </div>

    <!-- Menus Grouped by Category -->
    <div v-else class="space-y-8">
      <div v-for="(menus, category) in groupedMenus" :key="category">
        <h2 class="mb-4 text-2xl font-bold text-gray-800">{{ category }}</h2>

        <!-- Responsive Flexbox for Menus -->
        <div
          class="xl:grid-cols- grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          <div v-for="menu in menus" :key="menu.id" class="card block">
            <img
              :src="menu.photoUrl"
              alt="Menu photo"
              class="c-t-lg h-32 w-full object-cover"
            />
            <h3 class="text-xl font-semibold text-gray-900">
              {{ menu.name }}
            </h3>
            <!-- Price Display -->
            <p class="text-gray-800">{{ menu.price.toFixed(2) }}฿</p>
            <div class="flex justify-center">
              <label
                class="relative mt-1 inline-flex cursor-pointer items-center"
              >
                <input
                  type="checkbox"
                  class="peer sr-only"
                  :checked="menu.isActive"
                  @change="toggleMenuStatus(menu.id, !menu.isActive)"
                />
                <div
                  class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-focus:ring-4 peer-focus:ring-green-300"
                />
                <span class="ml-3 text-sm font-medium text-gray-900">
                  {{ menu.isActive ? "เปิด" : "ปิด" }}
                </span>
              </label>
            </div>
          </div>
          <!-- Toggle Status -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
const menus = ref([]);
const searchQuery = ref("");

const fetchMenus = async () => {
  const branchId = getDecryptedItem("branchId");
  const response = await axios.post("/api/branchMenu", {
    branchId: parseInt(branchId, 10),
  });
  if (response.status === 200) {
    menus.value = response.data.body.menus;
  }
};

const toggleMenuStatus = async (menuId, isActive) => {
  const branchId = getDecryptedItem("branchId");
  await axios.post("/api/branchMenu", {
    branchId: parseInt(branchId, 10),
    menuId,
    isActive,
  });
  await fetchMenus();
};

// Filter menus by search query
const filteredMenus = computed(() => {
  if (!searchQuery.value) return menus.value;
  return menus.value.filter((menu) =>
    menu.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// Group menus by category
const groupedMenus = computed(() => {
  return filteredMenus.value.reduce((groups, menu) => {
    const category = menu.category.name || "Uncategorized";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(menu);
    return groups;
  }, {});
});

onMounted(fetchMenus);
</script>
