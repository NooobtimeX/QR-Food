<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div
      class="relative max-h-[90vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg"
    >
      <h1 class="text-center text-3xl font-bold text-black">สร้างเมนูอาหาร</h1>
      <form @submit.prevent="submitForm">
        <!-- Restaurant Selection -->
        <div>
          <label for="restaurant" class="block text-sm font-bold text-black"
            >เลือกร้านอาหาร<span class="text-red-600">*</span></label
          >
          <select
            id="restaurant"
            v-model="selectedRestaurant"
            class="block w-full rounded-lg border border-gray-400 p-2 text-black shadow-sm"
            aria-required="true"
            required
          >
            <option
              v-for="restaurant in restaurants"
              :key="restaurant.id"
              :value="restaurant.id"
              class="text-black"
            >
              {{ restaurant.name }}
            </option>
          </select>
        </div>

        <!-- Menu Name and Price -->
        <div class="mt-2 grid grid-cols-1 gap-4">
          <div class="flex space-x-2">
            <div class="w-4/5">
              <label for="menu-name" class="block text-sm font-bold text-black"
                >ชื่อเมนูอาหาร<span class="text-red-600">*</span></label
              >
              <input
                id="menu-name"
                v-model="menuName"
                type="text"
                class="block w-full border-gray-400 p-2 shadow-sm"
                placeholder="กรอกชื่ออาหาร"
                aria-required="true"
                required
              />
            </div>
            <div class="w-1/5">
              <label
                for="price"
                class="block border-gray-400 text-sm font-bold text-black"
                >ราคา<span class="text-red-600">*</span></label
              >
              <input
                id="price"
                v-model.number="price"
                type="number"
                class="block w-full border-gray-400 p-2 shadow-sm"
                placeholder="ราคา"
                aria-required="true"
                required
              />
            </div>
          </div>
          <div class="w-full">
            <label for="photo" class="block text-sm font-bold text-black"
              >รูปภาพ<span class="text-red-600">*</span></label
            >
            <input
              id="photo"
              ref="photoInput"
              type="file"
              accept="image/*"
              class="block w-full text-black"
              @change="handlePhotoUpload"
              required
            />
            <div v-if="previewUrl" class=" ">
              <img
                :src="previewUrl"
                alt="Photo preview"
                class="mx-auto max-h-40"
              />
            </div>
          </div>
          <!-- Category Selection -->
          <div>
            <label for="category" class="block text-sm font-bold text-black"
              >หมวดหมู่อาหาร<span class="text-red-600">*</span></label
            >
            <div class="flex flex-col items-center">
              <select
                id="category"
                v-model="selectedCategory"
                class="block w-full rounded-lg border border-gray-400 p-2 text-black shadow-sm"
                aria-required="true"
                required
              >
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                  class="text-black"
                >
                  {{ category.name }}
                </option>
              </select>
              <button
                type="button"
                class="mx-auto mt-2 w-full justify-center bg-green-500 text-white hover:bg-green-700"
                @click="openAddCategoryPopup"
              >
                เพิ่มหมวดหมู่อาหาร
              </button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-bold text-black"
              >คำอธิบาย</label
            >
            <textarea
              id="description"
              v-model="description"
              class="block w-full rounded-lg border border-gray-400 p-2 text-black shadow-sm"
              placeholder="กรอกคำอธิบายอาหาร เช่น มีกุ้งเป็นส่วนผสม"
              aria-required="true"
            />
          </div>

          <!-- Sections -->
          <div>
            <label class="block text-sm font-bold text-black">ตัวเลือก</label>
            <div
              v-for="(section, sectionIndex) in sections"
              :key="sectionIndex"
              class="rounded-3xl border border-gray-400 p-2"
            >
              <div class="flex items-center justify-between">
                <input
                  v-model="section.name"
                  type="text"
                  class="block w-5/6 border-gray-400 p-2 shadow-sm"
                  placeholder="ตัวเลือก เช่น เส้น"
                  aria-required="true"
                  requiredw
                />
                <button
                  type="button"
                  class="w-2/12 bg-red-500 p-2 text-white hover:bg-red-02"
                  @click="removeSection(sectionIndex)"
                >
                  ลบ
                </button>
              </div>

              <div
                v-for="(option, optionIndex) in section.options"
                :key="optionIndex"
                class="flex items-center gap-1"
              >
                <input
                  v-model="option.name"
                  type="text"
                  class="w-7/12 border-gray-400 p-2 shadow-sm"
                  placeholder="ตัวเลือกย่อย เช่น เส้นเล็ก"
                  aria-required="true"
                  required
                />
                <input
                  v-model.number="option.price"
                  type="number"
                  class="w-3/12 border-gray-400 p-2 shadow-sm"
                  placeholder="ราคา"
                  aria-required="true"
                  required
                />
                <button
                  type="button"
                  class="w-2/12 bg-red-500 text-white hover:bg-red-02"
                  @click="removeOption(sectionIndex, optionIndex)"
                >
                  ลบ
                </button>
              </div>
              <button
                type="button"
                class="w-full bg-green-500 p-2 text-white hover:bg-green-700"
                @click="addOption(sectionIndex)"
              >
                เพิ่มตัวเลือกย่อย
              </button>
            </div>
            <button
              type="button"
              class="mt-2 w-full bg-green-500 p-2 text-white hover:bg-green-700"
              @click="addSection"
            >
              เพิ่มตัวเลือก
            </button>
          </div>

          <!-- Submit and Cancel Buttons -->
          <div class="-mt-3 grid grid-cols-2 gap-2">
            <button
              type="submit"
              class="w-full bg-green-500 p-2 text-white hover:bg-green-700 disabled:bg-gray-400"
              :disabled="loading"
            >
              {{ loading ? "กำลังสร้าง..." : "สร้าง" }}
            </button>
            <button
              class="w-full bg-red-500 p-2 text-white hover:bg-red-02"
              @click="closeModal"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Popup for adding category -->
    <div
      v-if="showAddCategoryPopup"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="relative max-w-md rounded-lg bg-white p-4 shadow-lg">
        <h2 class="text-lg font-bold text-black">เพิ่มหมวดหมู่อาหาร</h2>
        <label
          for="new-category-name"
          class="block text-sm font-medium text-black"
          >ชื่อหมวดหมู่อาหาร</label
        >
        <input
          id="new-category-name"
          v-model="newCategoryName"
          type="text"
          class="block w-full border-gray-400 p-2 shadow-sm"
          placeholder="กรอกชื่อหมวดหมู่"
          aria-required="true"
          required
        />
        <div class="grid grid-cols-2">
          <button
            class="bg-green-500 text-white hover:bg-green-700"
            @click="submitCategory"
          >
            เพิ่มหมวดหมู่
          </button>
          <button
            class="bg-red-500 text-white hover:bg-red-02"
            @click="closeAddCategoryPopup"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted, watch } from "vue";
import axios from "axios";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
// Define interfaces for restaurants, categories, sections, and options
interface Restaurant {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Section {
  name: string;
  options: Option[];
}

interface Option {
  name: string;
  price: number;
}

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const loading = ref(false);
const menuName = ref("");
const description = ref<string>("");
const price = ref<number | null>(null);
const sections = ref<Section[]>([
  { name: "", options: [{ name: "", price: 0 }] },
]);
const categories = ref<Category[]>([]);
const restaurants = ref<Restaurant[]>([]);
const selectedCategory = ref<number | null>(null);
const selectedRestaurant = ref<number | null>(null);
const showAddCategoryPopup = ref(false);
const newCategoryName = ref("");
const tags = ref<string[]>([]);
const previewUrl = ref<string | null>(null);
const selectedPhoto = ref<File | null>(null);

// Fetch all restaurants owned by the user
const fetchRestaurants = async () => {
  try {
    const response = await axios.get("/api/restaurant/getAll", {
      params: { userId: Number(getDecryptedItem("userId")) },
    });
    restaurants.value = response.data.body.ownedRestaurants;
    if (restaurants.value.length > 0) {
      selectedRestaurant.value = restaurants.value[0].id;
    }
  } catch (error) {
    console.error("Error fetching restaurants:", error);
  }
};
// Handle photo upload
const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedPhoto.value = target.files[0];
    previewUrl.value = URL.createObjectURL(target.files[0]);
  }
};
const uploadPhoto = async () => {
  if (!selectedPhoto.value) {
    console.error("No photo selected.");
    return null;
  }

  const formData = new FormData();
  formData.append("file", selectedPhoto.value);

  try {
    const response = await axios.post("/api/uploadMenu", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.url; // Return the uploaded photo URL
  } catch (error) {
    console.error("Error uploading photo:", error);
    return null;
  }
};

// Fetch categories for the selected restaurant
const fetchCategories = async () => {
  if (!selectedRestaurant.value) return;

  try {
    const response = await axios.post("/api/restaurant/get/categories", {
      restaurantId: selectedRestaurant.value,
    });
    categories.value = response.data;
    if (categories.value.length > 0) {
      selectedCategory.value = categories.value[0].id;
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
};

// Watch the selectedRestaurant for changes and fetch categories accordingly
watch(selectedRestaurant, (newRestaurantId) => {
  if (newRestaurantId) {
    fetchCategories();
  }
});

const addSection = () => {
  sections.value.push({ name: "", options: [{ name: "", price: 0 }] });
};

const removeSection = (index: number) => {
  sections.value.splice(index, 1);
};

const addOption = (sectionIndex: number) => {
  sections.value[sectionIndex].options.push({ name: "", price: 0 });
};

const removeOption = (sectionIndex: number, optionIndex: number) => {
  sections.value[sectionIndex].options.splice(optionIndex, 1);
};

const submitForm = async () => {
  if (!selectedCategory.value || !selectedRestaurant.value) {
    console.error("Restaurant and Category are required.");
    return;
  }

  const photoUrl = await uploadPhoto();
  if (!photoUrl) {
    console.error("Failed to upload photo.");
    return;
  }

  const data = {
    name: menuName.value,
    description: description.value,
    price: price.value,
    categoryId: selectedCategory.value,
    restaurantId: selectedRestaurant.value,
    sections: sections.value,
    tags: tags.value,
    photoUrl, // Attach the uploaded photo URL
  };

  try {
    if (loading.value) return; // Prevent multiple submissions
    loading.value = true;
    await axios.post("/api/restaurant/menu/add", data);
    closeModal();
  } catch (error) {
    console.error("Error creating menu:", error);
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit("close");
};

const openAddCategoryPopup = () => {
  showAddCategoryPopup.value = true;
};

const closeAddCategoryPopup = () => {
  showAddCategoryPopup.value = false;
};

const submitCategory = async () => {
  try {
    await axios.post("/api/restaurant/category/add", {
      restaurantId: selectedRestaurant.value,
      name: newCategoryName.value,
    });
    await fetchCategories();
    closeAddCategoryPopup();
  } catch (error) {
    console.error("Error adding category:", error);
  }
};

onMounted(() => {
  fetchRestaurants();
});
</script>
