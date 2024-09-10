<template>
  <NuxtLayout name="customer">
    <!-- Category Navigation -->
    <nav class="card scrollbar-hide sticky top-0 z-10 flex overflow-x-auto">
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
        class="card mb-2"
      >
        <h3 class="mb-2 text-2xl font-bold">{{ category.name }}</h3>
        <div
          class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <div
            v-for="menu in category.menus"
            :key="menu.id"
            class="card block cursor-pointer"
            @click="openMenuModal(menu)"
          >
            <img :src="menu.photoUrl" class="c-t-lg h-32 w-full object-cover" />
            <div class="p-1">
              <h2 class="text-xl font-semibold">{{ menu.name }}</h2>
              <p class="text-black">{{ menu.price.toFixed(2) }}฿</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <!-- Modal for Menu Details -->
      <MenuModal
        v-if="isModalOpen"
        :menu-item="selectedMenu"
        :qr-code-id="qrCodeId"
        @close="closeMenuModal"
      />
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import MenuModal from "../../components/customer/MenuModal.vue"; // Import the modal component

const categories = ref([]);
const qrCodeId = ref(null);
const isModalOpen = ref(false); // State to manage modal visibility
const selectedMenu = ref(null); // Store the selected menu object
const tableNumber = ref("");
const restaurantName = ref("");

const openMenuModal = (menu) => {
  selectedMenu.value = menu; // Save the full menu object
  isModalOpen.value = true;
};

const closeMenuModal = () => {
  isModalOpen.value = false;
};

onMounted(async () => {
  const route = useRoute();
  qrCodeId.value = route.params.table;

  if (qrCodeId.value) {
    try {
      const response = await axios.get(`/api/customer/${qrCodeId.value}`);
      const { menus } = response.data.body;

      const categoryMap = new Map();
      menus.forEach((menu) => {
        if (!categoryMap.has(menu.category.name)) {
          categoryMap.set(menu.category.name, []);
        }
        categoryMap.get(menu.category.name).push({
          id: menu.id,
          name: menu.name,
          price: menu.price,
          photoUrl: menu.photoUrl || "/default-image.jpg", // Fallback image
          description: menu.description,
          options: menu.options || [],
        });
      });

      categories.value = Array.from(categoryMap, ([name, menus]) => ({
        name,
        menus,
      }));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }
});
</script>
