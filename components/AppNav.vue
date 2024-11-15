<template>
  <nav class="bg-white p-6 shadow-xl">
    <div class="container mx-auto flex max-w-7xl items-center justify-between">
      <h1 class="text-3xl font-bold text-black">
        QR Food<span class="text-3xl text-orange-04">.</span>
      </h1>
      <button
        class="rounded-xl bg-red-500 p-2 text-white shadow-xl hover:bg-red-02"
        @click="signOut"
      >
        ออกจากระบบ
      </button>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";

const router = useRouter();
const signOut = () => {
  localStorage.removeItem("userId");
  router.push("/");
};
</script>
