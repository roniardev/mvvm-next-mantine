// src/lib/react-query/query-client-manager.ts
import { QueryClient, type QueryKey, type QueryFunction } from '@tanstack/react-query'
import { injectable, unmanaged } from "inversify"

export interface IQueryClientManager {
  getClient(): QueryClient
  prefetchQuery<TData>(key: QueryKey, queryFn: QueryFunction<TData>): Promise<void>
  invalidateQueries(key?: QueryKey): Promise<void>
  setQueryData<TData>(key: QueryKey, data: TData): void
  clear(): void
}

@injectable()
export class QueryClientManager implements IQueryClientManager {
  private queryClient: QueryClient

  constructor(@unmanaged() config?: ConstructorParameters<typeof QueryClient>[0]) {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          retry: 1,
        },
        mutations: {
          retry: 1,
        },
      },
      ...config,
    })
  }

  getClient() {
    return this.queryClient
  }

  prefetchQuery<TData>(key: QueryKey, queryFn: QueryFunction<TData>) {
    return this.queryClient.prefetchQuery({ queryKey: key, queryFn })
  }

  invalidateQueries(key?: QueryKey) {
    return this.queryClient.refetchQueries({
      queryKey: key,
    })
  }

  setQueryData<TData>(key: QueryKey, data: TData) {
    this.queryClient.setQueryData(key, data)
  }

  clear() {
    this.queryClient.clear()
  }
}