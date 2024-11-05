<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
  >
    <div class="relative w-full max-w-4xl rounded-lg bg-white p-4 shadow-lg">
      <button
        class="absolute right-4 top-4 text-black hover:text-gray-700"
        @click="$emit('close')"
      >
        <span class="text-2xl">&times;</span>
      </button>

      <!-- Category Navigation -->
      <nav
        class="sticky top-0 z-50 flex overflow-x-auto rounded-xl border border-orange-300 bg-white"
      >
        <div
          v-for="category in categories"
          :key="category.name"
          class="px-2 py-4"
        >
          <a :href="'#' + category.name" class="font-bold text-black">{{
            category.name
          }}</a>
        </div>
      </nav>

      <!-- Categories and Menus -->
      <div class="mt-4">
        <div
          v-for="category in categories"
          :id="category.name"
          :key="category.name"
          class="mb-2 rounded-xl border border-orange-300 p-2"
        >
          <h2 class="text-2xl font-bold">{{ category.name }}</h2>
          <div class="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
            <div
              v-for="menu in category.menus"
              :key="menu.id"
              class="block cursor-pointer rounded-xl border border-orange-300 bg-white p-2 transition-shadow duration-300 hover:shadow-lg"
              @click="selectMenu(menu.id)"
            >
              <img
                :src="menu.photoUrl"
                class="c-t-lg h-32 w-full object-cover"
              />
              <div class="p-1">
                <h2 class="text-xl font-semibold">{{ menu.name }}</h2>
                <p class="text-black">{{ menu.price }}฿</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Close Button -->
      <div class="mt-6 flex justify-end">
        <button
          class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>

      <!-- Modal for Menu Details -->
      <MenuModal
        v-if="isModalOpen"
        :menu-id="selectedMenuId"
        :qr-code-id="qrCodeId"
        @close="closeMenuModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import MenuModal from "./MenuModal.vue"; // Import the MenuModal component

// Define props for CustomerMenu component
const props = defineProps({
  qrCodeId: {
    type: String,
    required: true,
  },
  menus: {
    type: Array,
    required: true,
  },
});

// Local state
const categories = ref([]); // Categories for rendering
const isModalOpen = ref(false); // Modal state
const selectedMenuId = ref(null); // Track the selected menu ID

// Watch the menus prop and group them by category
watch(
  () => props.menus,
  (newMenus) => {
    const categoryMap = new Map();
    newMenus.forEach((menu) => {
      if (!categoryMap.has(menu.category.name)) {
        categoryMap.set(menu.category.name, []);
      }
      categoryMap.get(menu.category.name).push({
        id: menu.id,
        name: menu.name,
        price: menu.price,
        photoUrl: menu.photoUrl,
      });
    });

    categories.value = Array.from(categoryMap, ([name, menus]) => ({
      name,
      menus,
    }));
  },
  { immediate: true }, // Ensure it runs when the component is mounted
);

// Function to open the modal for a selected menu
const selectMenu = (menuId) => {
  selectedMenuId.value = menuId;
  isModalOpen.value = true;
};

// Function to close the modal
const closeMenuModal = () => {
  isModalOpen.value = false;
};
</script>

<style scoped>
/* Add any necessary styling here */
</style>
