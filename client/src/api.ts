import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:3000" });

//basically whenever api request is made, this interceptor adds the token to the headers if it exists in localStorage
api.interceptors.request.use((cfg) => {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (t) {
    if (cfg.headers && typeof cfg.headers.set === "function") {
      cfg.headers.set("Authorization", `Bearer ${t}`);
    } else if (cfg.headers && typeof cfg.headers === "object") {
      cfg.headers["Authorization"] = `Bearer ${t}`;
    } else if (!cfg.headers) {
      cfg.headers = { Authorization: `Bearer ${t}` } as any;
    }
  }
  return cfg;
});
export default api;