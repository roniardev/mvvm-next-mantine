export const authQueryKeys = {
  user: () => ['auth', 'user'],
  token: () => ['auth', 'token'],
}

export const generalQueryKeys = {
  config: () => ['app-config'],
}

export const quoteQueryKeys = {
  list: (param?: string) => param ? ['quotes', 'list', param] : ['quotes', 'list'],
  detail: (id: string) => ['quotes', 'detail', id],
}

export type QueryKeys = typeof authQueryKeys & typeof generalQueryKeys & typeof quoteQueryKeys