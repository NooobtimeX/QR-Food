import { onMounted } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";

export function setupAuth() {
  const router = useRouter();

  onMounted(() => {
    const userId = Cookies.get("userId");
    if (!userId) {
      alert("Need to sign in to access this page");
      router.push("/authentication");
    }
  });
}
