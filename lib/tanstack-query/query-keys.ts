export const authQueryKeys = {
    user: () => ['auth', 'user'],
    token: () => ['auth', 'token'],
  }
  
  export const generalQueryKeys = {
    config: () => ['app-config'],
  }
  
  export type QueryKeys = typeof authQueryKeys & typeof generalQueryKeys