import { apiClient } from "./apiClient"
import type { SearchRequest, SearchResponse } from "@/types/api"

export const searchService = {
  async search(body: SearchRequest): Promise<SearchResponse> {
    const { data } = await apiClient.post<SearchResponse>("/search", body)
    return data
  },
}
