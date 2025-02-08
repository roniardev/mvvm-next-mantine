// src/lib/react-query/query-client-manager.ts
import { QueryClient, type QueryKey, type QueryFunction } from '@tanstack/react-query'
import { injectable } from "inversify";

export interface IQueryClientManager {
  getClient(): QueryClient;
  prefetchQuery<TData>(key: QueryKey, queryFn: QueryFunction<TData>): Promise<void>;
  invalidateQueries(key?: QueryKey): Promise<void>;
  setQueryData<TData>(key: QueryKey, data: TData): void;
  clear(): void;
}

@injectable()
export class QueryClientManager implements IQueryClientManager {
  private queryClient: QueryClient

  constructor(config?: ConstructorParameters<typeof QueryClient>[0]) {
    this.queryClient = new QueryClient(config)
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