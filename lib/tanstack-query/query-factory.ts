import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { QueryClientManager } from './query-client-manager'

export class QueryFactory {
  private queryClientManager: QueryClientManager

  constructor(queryClientManager: QueryClientManager) {
    this.queryClientManager = queryClientManager
  }

  createQuery<TData, TError = Error>(
    key: [],
    queryFn: () => Promise<TData>,
    options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
  ) {
    return useQuery({
      queryKey: key,
      queryFn,
      ...options,
    })
  }
}