<template>
  <slot />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
// Define the expected types
interface User {
  name: string;
}

interface ApiResponse {
  success: boolean;
  user?: User;
  redirectTo?: string;
  body?: Record<string, any>; // Define if you need specific body details
}

const router = useRouter();
const user = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  const userId = getDecryptedItem("userId");
  if (!userId) {
    error.value = "No user ID found.";
    loading.value = false;
    return;
  }

  try {
    const response: ApiResponse = await $fetch(
      `/api/restaurant/user/isExist/${userId}`,
    );
    if (response.success) {
      user.value = response.user || null; // Ensure `user` is assigned only when available
    } else {
      removeItem("userId");
      router.push("/");
    }
  } catch (err) {
    error.value = "Failed to fetch user information.";
  } finally {
    loading.value = false;
  }
});
</script>
