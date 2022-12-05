# Functions

## useFusionAuth

A hook that returns an object containing the [FusionAuthContext](context.md#fusionauthcontext)

#### Properties

| Name            | Type                       | Description                                                                        |
| --------------- | -------------------------- | ---------------------------------------------------------------------------------- |
| logout          | `(state?: string) => void` | Used to login to FusionAuth                                                        |
| register        | `(state?: string) => void` | Used to register for FusionAuth                                                    |
| logout          | `() => void`               | Used to logout of FusionAuth                                                       |
| refreshToken    | `() => void`               | Refreshes the user's access token                                                  |
| user            | `object`                   | An object containing user data                                                     |
| isLoading       | `boolean`                  | `true` if the token exchange is in progress, `false` otherwise                     |
| isAuthenticated | `boolean`                  | `true` if the user is successfully authenticatd with FusionAuth, `false` otherwise |

## withFusionAuth

A higher-order component used to give components access to the [FusionAuthContext](context.md#fusionauthcontext).

#### Arguments

| Name      | Type                  | Description           |
| --------- | --------------------- | --------------------- |
| component | `React.ComponentType` | The component to wrap |
