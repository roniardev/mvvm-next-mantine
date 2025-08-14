// src/lib/react-query/mutation-factory.ts
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import type { QueryClientManager } from './query-client-manager'

export class MutationFactory {
  private queryClientManager: QueryClientManager

  constructor(queryClientManager: QueryClientManager) {
    this.queryClientManager = queryClientManager
  }

  createMutation<TData, TError = Error, TVariables = void>(
    options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
  ) {
    return useMutation({
      ...options
    })
  }
}