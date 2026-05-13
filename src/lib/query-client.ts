import { QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | undefined;

export function getQueryClient() {
  queryClient ??= new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: process.env.NODE_ENV !== "development",
      },
    },
  });

  return queryClient;
}
