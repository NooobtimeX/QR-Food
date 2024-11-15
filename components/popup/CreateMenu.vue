<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div
      class="relative max-h-[75vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg"
    >
      <h1 class="mb-5 text-center text-3xl font-bold text-black">
        สร้างเมนูอาหาร
      </h1>
      <form @submit.prevent="submitForm">
        <!-- Restaurant Selection -->
        <div>
          <label for="restaurant" class="block text-sm font-bold text-black"
            >เลือกร้านอาหาร</label
          >
          <select
            id="restaurant"
            v-model="selectedRestaurant"
            class="mt-1 block w-full rounded-lg border border-gray-400 p-2 text-black shadow-sm"
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
        <div class="mt-4 grid grid-cols-1 gap-4">
          <div class="flex space-x-4">
            <div class="w-4/5">
              <label for="menu-name" class="block text-sm font-bold text-black"
                >ชื่อเมนูอาหาร</label
              >
              <input
                id="menu-name"
                v-model="menuName"
                type="text"
                class="mt-1 block w-full border-gray-400 p-2 shadow-sm"
                placeholder="กรอกชื่อร้านอาหาร"
                aria-required="true"
                required
              />
            </div>
            <div class="w-1/5">
              <label
                for="price"
                class="block border-gray-400 text-sm font-bold text-black"
                >ราคา</label
              >
              <input
                id="price"
                v-model.number="price"
                type="number"
                class="mt-1 block w-full border-gray-400 p-2 shadow-sm"
                placeholder="ราคา"
                aria-required="true"
                required
              />
            </div>
          </div>
          <div class="w-full">
            <label for="photo" class="block text-sm font-bold text-black"
              >รูปภาพ</label
            >
            <input
              id="photo"
              ref="photoInput"
              type="file"
              accept="image/*"
              class="mt-1 block w-full text-black"
              @change="handlePhotoUpload"
            />
            <div v-if="previewUrl" class="mt-2">
              <img
                :src="previewUrl"
                alt="Photo preview"
                class="mx-auto mt-2 max-h-40"
              />
            </div>
          </div>
          <!-- Category Selection -->
          <div>
            <label for="category" class="block text-sm font-bold text-black"
              >หมวดหมู่อาหาร</label
            >
            <div class="flex items-center space-x-2">
              <select
                id="category"
                v-model="selectedCategory"
                class="mt-1 block w-full rounded-lg border border-gray-400 p-2 text-black shadow-sm"
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
                class="bg-green-500 text-white hover:bg-green-700"
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
              class="mt-1 block w-full rounded-lg border border-gray-400 p-2 text-black shadow-sm"
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
              class="mb-4 rounded-3xl border border-gray-400 p-2"
            >
              <div class="mb-1 flex items-center justify-between">
                <input
                  v-model="section.name"
                  type="text"
                  class="mb-1 block w-5/6 border-gray-400 p-2 shadow-sm"
                  placeholder="ตัวเลือก"
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
                  placeholder="Option Name"
                  aria-required="true"
                  required
                />
                <input
                  v-model.number="option.price"
                  type="number"
                  class="w-3/12 border-gray-400 p-2 shadow-sm"
                  placeholder="ตัวเลือกย่อย"
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
                class="5 mt-2 w-full bg-green-500 p-2 text-white hover:bg-green-700"
                @click="addOption(sectionIndex)"
              >
                เพิ่มตัวเลือกย่อย
              </button>
            </div>
            <button
              type="button"
              class="w-full bg-green-500 p-2 text-white hover:bg-green-700"
              @click="addSection"
            >
              เพิ่มตัวเลือก
            </button>
          </div>

          <!-- Submit and Cancel Buttons -->
          <div class="flex justify-end space-x-2">
            <button
              class="w-1/2 bg-red-500 p-2 text-white hover:bg-red-02"
              @click="closeModal"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="w-1/2 bg-green-500 p-2 text-white hover:bg-green-700"
            >
              สร้าง
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
        <h2 class="text-lg font-bold text-black">Add New Category</h2>
        <label
          for="new-category-name"
          class="block text-sm font-medium text-black"
          >Category Name</label
        >
        <input
          id="new-category-name"
          v-model="newCategoryName"
          type="text"
          class="mt-1 block w-full border-gray-400 p-2 shadow-sm"
          placeholder="Enter category name"
          aria-required="true"
          required
        />
        <div class="mt-4 flex justify-end space-x-2">
          <button
            class="bg-green-500 text-white hover:bg-green-700"
            @click="submitCategory"
          >
            Add Category
          </button>
          <button
            class="bg-red-500 text-white hover:bg-red-02"
            @click="closeAddCategoryPopup"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted, watch } from "vue";
import axios from "axios";

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
    const response = await axios.get("/api/restaurant/getAllRestaurants", {
      params: { userId: Number(localStorage.getItem("userId")) },
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
    const response = await axios.post("/api/get/categories", {
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
    await axios.post("/api/restaurant/addMenu", data);
    closeModal();
  } catch (error) {
    console.error("Error creating menu:", error);
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
    await axios.post("/api/restaurant/addCategory", {
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
