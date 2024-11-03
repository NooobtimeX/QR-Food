<template>
  <div>
    <!-- Sidebar and Menu Items -->
    <button
      aria-controls="default-sidebar"
      type="button"
      class="ms-3 mt-2 inline-flex items-center rounded-xl p-2 text-sm focus:outline-none focus:ring-2"
      @click="toggleSidebar"
    >
      <span class="sr-only">Open sidebar</span>
      <svg
        class="h-6 w-6"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clip-rule="evenodd"
          fill-rule="evenodd"
          d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
        />
      </svg>
    </button>
    <aside
      id="default-sidebar"
      :class="{
        '-translate-x-full': !isSidebarOpen,
        'translate-x-0': isSidebarOpen,
      }"
      class="fixed left-0 top-0 z-10 h-screen w-64 transition-transform md:translate-x-0"
      aria-label="Sidebar"
    >
      <div class="relative h-full overflow-y-auto bg-green-05 px-3 py-4">
        <div class="flex items-center justify-center text-white">
          <img width="50px" src="/logo/logo.png" />
        </div>
        <div
          class="flex flex-col items-center justify-center text-2xl text-white"
        >
          <div>{{ restaurantName }}</div>
          <div>{{ branchName }}</div>
        </div>
        <button
          type="button"
          class="absolute right-4 top-4 inline-flex items-center rounded-xl p-2 text-sm focus:outline-none focus:ring-2 md:hidden"
          @click="toggleSidebar"
        >
          <img
            src="/icon/close.svg"
            alt="Close"
            class="h-6 w-6"
            aria-hidden="true"
          />
        </button>
        <ul class="mt-2 space-y-2 font-medium">
          <li v-for="item in menuItems" :key="item.text">
            <button
              v-if="item.component"
              class="group flex items-center rounded-xl p-2 text-white hover:bg-green-03"
              @click="selectComponent(item)"
            >
              <img width="25px" height="25px" :src="item.icon" />
              <span class="ms-3">{{ item.text }}</span>
            </button>
            <router-link
              v-else
              :to="item.link || '/'"
              class="group flex items-center rounded-xl p-2 text-white hover:bg-green-03"
            >
              <img width="25px" height="25px" :src="item.icon" />
              <span class="ms-3">{{ item.text }}</span>
            </router-link>
          </li>
        </ul>
        <button
          class="mt-6 bg-red-500 hover:bg-red-700 active:bg-red-700"
          @click="signOut"
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>

    <!-- Dynamic Component Display -->
    <div class="p-1 md:ml-64">
      <component :is="currentComponent" v-if="currentComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

// Menu item interface
interface MenuItem {
  text: string;
  link?: string; // Links for navigation
  icon: string;
  badge?: string;
  component?: any; // Dynamic component reference (optional)
}

// Initialize with an empty array and populate after declaration
const menuItems = ref<MenuItem[]>([]);

onMounted(() => {
  menuItems.value = [
    {
      text: "Dashboard",
      link: "/restaurant/dashboard",
      icon: "/icon/dashboard.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Dashboard.vue"),
      ),
    },
    {
      text: "Table",
      link: "/restaurant/table",
      icon: "/icon/table.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Table.vue"),
      ),
    },
    {
      text: "Order",
      link: "/restaurant/order",
      icon: "/icon/order.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Order.vue"),
      ),
    },
    {
      text: "Menu",
      link: "/restaurant/menu",
      icon: "/icon/menu.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Menu.vue"),
      ),
    },
    {
      text: "Staff",
      link: "/restaurant/staff",
      icon: "/icon/staff.svg",
      component: defineAsyncComponent(
        () => import("@/components/page/Staff.vue"),
      ),
    },
    {
      text: "Switch Restaurant",
      link: "/restaurant/switch",
      icon: "/icon/restaurant.svg",
    },
  ];
});

const router = useRouter();
const route = useRoute();
const isSidebarOpen = ref(false);
const restaurantName = ref("Loading...");
const branchName = ref("Loading...");
const currentComponent = ref(null); // Current component being displayed

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function closeSidebarOnMobile() {
  if (window.innerWidth < 640) {
    isSidebarOpen.value = false;
  }
}

function selectComponent(item: MenuItem) {
  if (item.component) {
    currentComponent.value = item.component;
  }
  closeSidebarOnMobile();
}

async function checkRestaurantAndBranch(
  resId: string | undefined,
  branchId: string | undefined,
): Promise<boolean> {
  if (!resId || !branchId) return false;

  try {
    const response = await axios.post("/api/check/checkRestaurantAndBranch", {
      restaurantId: resId,
      branchId: branchId,
    });

    if (response.status === 200 && response.data.exists) {
      restaurantName.value = response.data.restaurant.name;
      branchName.value = response.data.branch.name;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking restaurant and branch existence:", error);
    return false;
  }
}

async function signOut() {
  router.push("/"); // Redirect to home or login page
}

onMounted(async () => {
  const resId = Array.isArray(route.params.restaurantId)
    ? route.params.restaurantId[0]
    : route.params.restaurantId;
  const branchId = Array.isArray(route.params.branchId)
    ? route.params.branchId[0]
    : route.params.branchId;

  if (!resId || !branchId) {
    alert("Missing restaurant or branch ID in route");
    signOut();
    return;
  }

  try {
    const exists = await checkRestaurantAndBranch(resId, branchId);

    if (!exists) {
      alert("Restaurant or Branch does not exist. Redirecting.");
      router.push("/restaurant");
      return;
    }
  } catch (error) {
    console.error("Error during existence checks:", error);
    alert("An error occurred. Please try again.");
    signOut();
  }
});
</script>
