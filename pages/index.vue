<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="mx-auto w-full max-w-3xl rounded-lg bg-white p-4">
      <div class="w-full rounded-xl border-2 border-gray-300 p-2 shadow-2xl">
        <div class="flex gap-1 text-lg md:text-2xl">
          <!-- Register Button -->
          <button
            class="m-0 flex-1 p-2"
            :class="{
              'rounded-lg border-2 border-gray-300 bg-orange-04 text-white hover:bg-orange-03':
                showSignUp,
              'rounded-lg bg-white text-black hover:bg-white hover:text-orange-03':
                !showSignUp,
            }"
            @click="showSignUp = true"
          >
            สมัครสมาชิก
          </button>
          <!-- Login Button -->
          <button
            class="m-0 flex-1 p-2"
            :class="{
              'rounded-lg border-2 border-gray-300 bg-orange-04 text-white hover:bg-orange-03':
                !showSignUp,
              'rounded-lg bg-white text-black hover:bg-white hover:text-orange-03':
                showSignUp,
            }"
            @click="showSignUp = false"
          >
            เข้าสู่ระบบ
          </button>
        </div>

        <hr
          class="mx-auto my-4 h-1 w-full rounded border-0 shadow-sm dark:bg-gray-300"
        />

        <form
          class="p-2"
          @submit.prevent="showSignUp ? handleSignup() : handleSignin()"
        >
          <h1 class="my-2 mt-1 text-center text-lg text-black md:text-2xl">
            {{ showSignUp ? "สมัครสมาชิก" : "เข้าสู่ระบบ" }}
          </h1>

          <div class="mb-4 mt-6 shadow-md">
            <label class="block text-sm font-bold text-gray-700 md:text-base"
              >อีเมล<span class="text-red-600">*</span></label
            >
            <input
              v-model="email"
              placeholder="name@company.com"
              type="email"
              class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
              required
            />
          </div>

          <div class="mb-4 shadow-md">
            <label class="block text-sm font-bold text-gray-700 md:text-base"
              >รหัสผ่าน<span class="text-red-600">*</span></label
            >
            <input
              v-model="password"
              placeholder="••••••••"
              type="password"
              class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
              required
            />
          </div>

          <button
            type="submit"
            class="mt-5 w-full rounded-lg bg-orange-04 px-4 py-2 text-white shadow-sm hover:bg-orange-03"
          >
            {{ showSignUp ? "สมัครมาชิก" : "เข้าสู่ระบบ" }}
          </button>

          <div
            v-if="errorMessage"
            class="mt-4 text-sm text-red-500 md:text-base"
          >
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import {
  setEncryptedItem,
  getDecryptedItem,
  removeItem,
} from "@/utils/storageUtils";
// Reactive state variables
const errorMessage = ref<string | null>(null);
const showSignUp = ref(true);
const email = ref("");
const password = ref("");

// Router instance
const router = useRouter();

// Error handling function
const handleError = (error: unknown, defaultMessage: string) => {
  console.error(error);

  if (axios.isAxiosError(error) && error.response) {
    errorMessage.value = error.response.data?.statusMessage || defaultMessage;
  } else {
    errorMessage.value = defaultMessage;
  }
};

// Handle user sign-up
const handleSignup = async () => {
  try {
    const response = await axios.post("/api/restaurant/authentication/signup", {
      email: email.value,
      password: password.value,
    });
    // Handle successful sign-up
    console.log("User created successfully:", response.data);
    errorMessage.value = null;
    // Automatically sign in the user
    await handleSignin(); // Call handleSignin to auto-login after signup
  } catch (error) {
    handleError(error, "Error signing up. Please try again.");
  }
};

// Handle user sign-in
const handleSignin = async () => {
  try {
    const response = await axios.post("/api/restaurant/authentication/signin", {
      email: email.value,
      password: password.value,
    });
    // Save userId to localStorage
    setEncryptedItem("userId", response.data.body.userId); // Save userId to localStorage
    errorMessage.value = null;
    // Redirect to home or another route
    console.log("Redirecting to /");
    await router.push("/restaurant");
  } catch (error) {
    handleError(error, "Error signing in. Please check your credentials.");
  }
};

// Check for existing userId in localStorage on component mount
onMounted(() => {
  const userId = getDecryptedItem("userId");
  if (userId) {
    // Redirect to / if userId is found in localStorage
    router.push("/restaurant");
  }
});
</script>
