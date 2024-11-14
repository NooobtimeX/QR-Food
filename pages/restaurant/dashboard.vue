<template>
  <div>
    <!-- Navbar -->
    <nav
      class="bg-background/90 sticky top-0 z-40 rounded-b-xl py-4 shadow-xl backdrop-blur"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="relative flex h-16 items-center justify-between">
          <!-- Mobile menu button -->
          <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              class="bg-800 inline-flex items-center justify-center p-2 text-black focus:outline-none focus:ring-2 focus:ring-inset"
              @click="toggleMobileMenu"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                />
              </svg>
            </button>
          </div>

          <!-- Logo and Restaurant Info -->
          <div
            class="flex w-full flex-shrink-0 items-center justify-center sm:w-auto sm:justify-start"
          >
            <img src="/logo/logo.png" alt="Logo" width="50px" />
            <div class="ml-3 hidden sm:block">
              <div class="text-lg font-bold">{{ restaurantName }}</div>
              <div class="text-sm">{{ branchName }}</div>
            </div>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden sm:ml-6 sm:block">
            <div class="flex space-x-4">
              <a
                v-for="item in menuItems"
                :key="item.text"
                :class="{ 
                  'bg-orange-600 text-white':
                    currentComponentText === item.text,
                  'text-gray-500 hover:text-orange-600':
                    currentComponentText !== item.text,
                }"
                class="mx-auto flex cursor-pointer flex-col items-center rounded-md px-3 py-2 text-sm font-semibold"
                @click="selectComponent(item)"
              >
                <img width="25px" height="25px" :src="item.icon" class="mb-1" />
                {{ item.text }}
              </a>
            </div>
          </div>

          <!-- Sign Out Button (Visible on larger screens) -->
          <button
            class="hidden rounded-xl bg-red-500 p-2 text-white hover:bg-red-02 sm:block"
            @click="changerestaurant"
          >
            เปลี่ยนร้านอาหาร
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" class="sm:hidden">
        <div class="px-2 pb-3 pt-2">
          <!-- Restaurant Info (Visible on smaller screens) -->
          <div class="mb-2 text-center">
            <div class="text-lg font-bold">{{ restaurantName }}</div>
            <div class="text-sm">{{ branchName }}</div>
          </div>

          <div class="space-y-1">
            <a
              v-for="item in menuItems"
              :key="item.text"
              :class="{
                'bg-orange-600 text-white': currentComponentText === item.text,
                'text-gray-500 hover:text-orange-600':
                  currentComponentText !== item.text,
              }"
              class="flex cursor-pointer items-center rounded-md px-3 py-2 text-base font-medium"
              @click="selectComponent(item)"
            >
              <img width="25px" height="25px" :src="item.icon" class="mr-3" />
              {{ item.text }}
            </a>

            <!-- Sign Out Button (Visible on smaller screens) -->
            <button
              class="mt-2 block w-full rounded-md bg-red-500 p-2 text-white hover:bg-red-02"
              @click="changerestaurant"
            >
              เปลี่ยนร้านอาหาร
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Dynamic Component -->
    <div class="mx-auto max-w-7xl p-4">
      <component :is="currentComponent" v-if="currentComponent" />
    </div>
  </div>
  <NotificationPopUp />
</template>

<script setup lang="ts">
import NotificationPopUp from "@/components/popup/NotificationPopUp.vue";
import { ref, defineAsyncComponent, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// Interfaces
interface MenuItem {
  text: string;
  icon: string;
  component?: any;
}

// Data and Methods
const menuItems = ref<MenuItem[]>([]);
const isMobileMenuOpen = ref(false);
const restaurantName = ref("Loading...");
const branchName = ref("Loading...");
const currentComponent = ref<any>(null);
const currentComponentText = ref<string>(""); // Track the active component text
const router = useRouter();

// Toggle mobile menu
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

// Sign out function
function signOut() {
  router.push("/"); // Redirect to home or login
}
function changerestaurant() {
  router.push("/restaurant");
}
// Function to select component
function selectComponent(item: MenuItem) {
  if (item.component) {
    currentComponent.value = item.component;
    currentComponentText.value = item.text; // Set the active component text
    localStorage.setItem("lastSelectedComponent", item.text); // Store the selected component in localStorage
  }
  if (isMobileMenuOpen.value) {
    toggleMobileMenu(); // Close mobile menu after selecting
  }
}

// Async function to check restaurant and branch
async function checkRestaurantAndBranch(
  restaurantId: string,
  branchId: string,
): Promise<boolean> {
  try {
    const { data } = await axios.post("/api/check/checkRestaurantAndBranch", {
      restaurantId,
      branchId,
    });
    if (data.exists) {
      restaurantName.value = data.restaurant.name;
      branchName.value = data.branch.name;
      return true;
    }
  } catch (error) {
    console.error("Error checking restaurant and branch:", error);
  }
  return false;
}

// On Mounted
onMounted(() => {
  menuItems.value = [
    {
      text: "แดชบอร์ด",
      icon: "/icon/dashboard.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Dashboard.vue"),
      ),
    },
    {
      text: "โต๊ะอาหาร",
      icon: "/icon/table.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Table.vue"),
      ),
    },
    {
      text: "ออเดอร์",
      icon: "/icon/order.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Order.vue"),
      ),
    },
    {
      text: "รายการอาหาร",
      icon: "/icon/menu.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Menu.vue"),
      ),
    },
    {
      text: "บิลส์",
      icon: "/icon/bill.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Bills.vue"),
      ),
    },
    {
      text: "พนักงาน",
      icon: "/icon/staff.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Staff.vue"),
      ),
    },
  ];

  const restaurantId = localStorage.getItem("restaurantId");
  const branchId = localStorage.getItem("branchId");

  if (!restaurantId || !branchId) {
    alert("Missing restaurant or branch ID in localStorage");
    signOut();
    return;
  }

  checkRestaurantAndBranch(restaurantId, branchId).then((exists) => {
    if (!exists) {
      alert("Restaurant or Branch does not exist. Redirecting.");
      router.push("/restaurant");
    }
  });

  const lastSelectedComponent = localStorage.getItem("lastSelectedComponent");
  if (lastSelectedComponent) {
    const matchedItem = menuItems.value.find(
      (item) => item.text === lastSelectedComponent,
    );
    if (matchedItem && matchedItem.component) {
      currentComponent.value = matchedItem.component;
      currentComponentText.value = matchedItem.text; // Set the current component text as active
    } else {
      currentComponent.value = defineAsyncComponent(
        () => import("@/components/page/Dashboard.vue"),
      );
      currentComponentText.value = "Dashboard"; // Default to Dashboard
    }
  } else {
    currentComponent.value = defineAsyncComponent(
      () => import("@/components/page/Dashboard.vue"),
    );
    currentComponentText.value = "Dashboard"; // Default to Dashboard
  }
});
</script>
