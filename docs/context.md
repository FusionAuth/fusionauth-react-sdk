## Context

## FusionAuthProvider

#### Props

| Name              | Type                                 | Description                                                               | Example                                |
| ----------------- | ------------------------------------ | ------------------------------------------------------------------------- | -------------------------------------- |
| baseUrl           | `string`                             | The base URL of your FusionAuth intance                                   | `https://sandbox.fusionauth.io`        |
| clientID          | `string`                             | The client ID of your FusionAuth application                              | `90ba1caf-c0c1-b30a-af38-3ed438df9fc0` |
| serverUrl         | `string`                             | The URL to your server which will perform the token exchange              | `https://localhost:9000`               |
| redirectUri       | `string`                             | The URL to redirect to from FusionAuth. Typically your React application. | `https://localhost:3000`               |
| onRedirectSuccess | `(state: string) => void` (optional) | Callback function to customize redirect success handling                  | N/A                                    |
| onRedirectFail    | `(error: any) => void` (optional)    | Callback function to customize redirect fail handling                     | N/A                                    |
| scope             | `string` (optional)                  | Optional scope to pass to FusionAuth. Default is `openid offline_access`  | `openid offline_access`                |

## FusionAuthContext

The context provides the following values:

### login (`function`)

A function that will redirect to FusionAuth's login experience and then back to the `redirectUri` provided to `FusionAuthProvider`

#### Arguments

| Name  | Type                | Description                                                                                                                              |
| ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| state | `string` (optional) | An optional state parameter that will be passed back in the `FusionAuthProvider`'s `onRedirectSuccess` method. Defaults to empty string. |

### register (`function`)

A function that will redirect to FusionAuth's register experience and then back to the `redirectUri` provided to `FusionAuthProvider`

#### Arguments

| Name  | Type                | Description                                                                                                                              |
| ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| state | `string` (optional) | An optional state parameter that will be passed back in the `FusionAuthProvider`'s `onRedirectSuccess` method. Defaults to empty string. |

### logout (`function`)

A function that will redirect to FusionAuth's logout experience and then back to the `redirectUri` provided to `FusionAuthProvider`

### refreshToken (`function`)

A function that will refresh the access token when called

### user (`object`)

An object containing user information (if authenticated)

### isLoading (`boolean`)

A boolean indicating whether the token exchange is currently in progress

### isAuthenticated (`boolean`)

A boolean indicating whether the user is currently authenticated
