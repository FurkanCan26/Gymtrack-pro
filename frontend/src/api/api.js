import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

function getCurrentUserId() {
  try {
    const storedUser = localStorage.getItem("gymtrack_user");

    if (!storedUser) {
      return null;
    }

    const user = JSON.parse(storedUser);
    return user?.id || null;
  } catch (error) {
    return null;
  }
}

function replaceDemoUserInUrl(url, userId, method) {
  if (!url || !userId) return url;

  const httpMethod = String(method || "get").toLowerCase();

  /*
    Önemli:
    GET isteklerinde /photos/1 kullanıcı id'sidir.
    DELETE isteklerinde /photos/1 fotoğraf id'sidir.
    O yüzden DELETE isteklerinde URL değiştirmiyoruz.
  */
  if (httpMethod === "delete") {
    return url;
  }

  const userRoutes = [
    /^\/profile\/1($|\/)/,
    /^\/daily-tracking\/1($|\/)/,
    /^\/workout-plans\/1($|\/)/,
    /^\/measurements\/1($|\/)/,
    /^\/photos\/1($|\/)/,
    /^\/performance\/1($|\/)/,
    /^\/workout-logs\/1($|\/)/,
    /^\/workout-logs\/1\/date\//,
    /^\/workout-logs\/1\/daily-volume\//,
    /^\/workout-logs\/1\/weekly-volume($|\/)/,
  ];

  const shouldReplace = userRoutes.some((regex) => regex.test(url));

  if (!shouldReplace) {
    return url;
  }

  return url.replace("/1", `/${userId}`);
}

api.interceptors.request.use((config) => {
  const userId = getCurrentUserId();

  if (!userId) {
    return config;
  }

  config.url = replaceDemoUserInUrl(config.url, userId, config.method);

  if (config.data instanceof FormData) {
    if (config.data.get("user_id") === "1" || config.data.get("user_id") === 1) {
      config.data.set("user_id", String(userId));
    }

    return config;
  }

  if (config.data && Number(config.data.user_id) === 1) {
    config.data = {
      ...config.data,
      user_id: userId,
    };
  }

  return config;
});

export default api;