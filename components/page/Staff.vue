<template>
  <div>
    <section class="container mx-auto p-4">
      <h1 class="pb-4">พนักงาน</h1>

      <!-- Search Input -->
      <div class="mb-6 mt-4 flex items-center justify-center space-x-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาด้วยอีเมล..."
          class="w-3/5 rounded-xl border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          class="bg-green-500 px-4 py-2 text-white transition duration-300 hover:bg-green-700"
          @click="showAddModal = true"
        >
          เพิ่มพนักงาน
        </button>
      </div>

      <!-- Staffs Grid Grouped by Role -->
      <div
        v-for="roleGroup in filteredGroups"
        :key="roleGroup.role"
        class="mb-6"
      >
        <h3 class="mb-4 text-2xl font-semibold text-gray-800">
          {{ roleGroup.role === "owner" ? "ผู้จัดการ" : "พนักงาน" }}
        </h3>

        <div
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          <div
            v-for="staff in roleGroup.staffs"
            :key="staff.id"
            class="card flex w-full flex-col items-center justify-center"
          >
            <span class="text-base font-semibold text-gray-900">{{
              staff.email
            }}</span>
            <span class="mt-1 text-sm text-gray-500">
              ตำแหน่ง:
              {{ roleGroup.role === "owner" ? "ผู้จัดการ" : "พนักงาน" }}
            </span>
            <button
              class="mt-3 bg-red-500 px-4 py-1 text-white transition duration-300 hover:bg-red-700"
              @click="deleteStaff(staff.id)"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>

      <!-- Add Employee Modal -->
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @keydown.escape="showAddModal = false"
      >
        <div
          class="w-80 rounded-lg border border-gray-300 bg-white p-6 shadow-xl"
        >
          <h2 class="mb-4 text-xl font-bold text-black">เพิ่มพนักงาน</h2>
          <form @submit.prevent="addEmployee">
            <div class="mb-4">
              <label for="email" class="block text-base font-bold text-gray-700"
                >อีเมล<span class="text-red-600">*</span></label
              >
              <input
                id="email"
                v-model="newEmployee.email"
                type="email"
                required
                placeholder="name@company.com"
                class="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div class="mb-4">
              <label for="role" class="block text-base font-bold text-gray-700"
                >ตำแหน่ง<span class="text-red-600">*</span></label
              >
              <select
                id="role"
                v-model="newEmployee.role"
                class="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="owner">ผู้จัดการ</option>
                <option value="staff">พนักงาน</option>
              </select>
            </div>
            <div class="grid grid-cols-2">
              <button
                type="submit"
                class="bg-green-500 px-4 py-2 text-white transition duration-300 hover:bg-green-700"
              >
                เพิ่มพนักงาน
              </button>
              <button
                type="button"
                class="border bg-red-500 px-4 py-2 text-white transition duration-300 hover:bg-red-700"
                @click="showAddModal = false"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
// Define the Staff interface
interface Staff {
  id: number;
  email: string;
  role: "owner" | "staff";
}

// States
const staffs = ref<Staff[]>([]);
const showAddModal = ref(false);
const newEmployee = ref<{ email: string; role: "owner" | "staff" }>({
  email: "",
  role: "staff",
});
const searchQuery = ref("");

// Router
const router = useRouter();

// Local Storage
const restaurantId = parseInt(getDecryptedItem("restaurantId") || "0", 10);
const branchId = parseInt(getDecryptedItem("branchId") || "0", 10);
const userId = parseInt(getDecryptedItem("userId") || "0", 10);

// Fetch Staffs
const fetchStaffs = async () => {
  try {
    const { data } = await axios.get<{ body: Staff[] }>(
      "/api/restaurant/staff/getById",
      {
        params: { branchId },
      },
    );
    staffs.value = data.body.map(({ id, email, role }) => ({
      id,
      email,
      role,
    }));
  } catch (error) {
    console.error("Error fetching staff:", error);
  }
};

// Computed Properties
const filteredGroups = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const grouped: { owner: Staff[]; staff: Staff[] } = { owner: [], staff: [] };
  staffs.value.forEach((staff) => {
    if (staff.email.toLowerCase().includes(query)) {
      grouped[staff.role].push(staff);
    }
  });
  return [
    { role: "owner", staffs: grouped.owner },
    { role: "staff", staffs: grouped.staff },
  ];
});

// Check Ownership
const checkOwnership = async () => {
  const { data } = await axios.get<{ isOwner: boolean }>(
    "/api/restaurant/isOwner",
    {
      params: { userId, restaurantId },
    },
  );
  return data.isOwner;
};

// Add Employee
const addEmployee = async () => {
  try {
    const isOwner = await checkOwnership();
    if (isOwner || newEmployee.value.role === "owner") {
      await axios.post("/api/restaurant/assignUserRole", {
        ...newEmployee.value,
        branchId,
      });
      resetModal();
      fetchStaffs();
    } else {
      alert("Only the restaurant owner can add staff members.");
    }
  } catch (error) {
    console.error("Error adding employee:", error);
    alert("Failed to add employee. Please try again.");
  }
};

// Delete Employee
const deleteStaff = async (id: number): Promise<void> => {
  const isConfirmed = window.confirm("คุณแน่ใจหรือว่าต้องการลบพนักงานนี้?");
  if (!isConfirmed) {
    return; // If not confirmed, exit the function
  }

  try {
    await axios.delete("/api/restaurant/staff/delete", {
      params: {
        id,
        userId: parseInt(getDecryptedItem("userId") || "0", 10),
        restaurantId: parseInt(getDecryptedItem("restaurantId") || "0", 10),
        branchId: branchId, // Pass the branchId here
      },
    });

    await fetchStaffs(); // Refresh the staff list after successful deletion
  } catch (error: any) {
    console.error("Error deleting staff:", error);

    if (axios.isAxiosError(error)) {
      switch (error.response?.status) {
        case 403:
          alert("Only the restaurant owner can delete staff members.");
          break;
        case 400:
          alert("Invalid request. Please check your input.");
          break;
        default:
          alert("Failed to delete staff. Please try again.");
      }
    } else {
      alert("An unexpected error occurred.");
    }
  }
};

// Reset Modal
const resetModal = () => {
  showAddModal.value = false;
  newEmployee.value.email = "";
};

onMounted(async () => {
  fetchStaffs();
});
</script>
