import { api } from "@/services/api";

export const healthService = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await api.get("/health");
      return res.status === 200;
    } catch (err) {
      return false;
    }
  },
};