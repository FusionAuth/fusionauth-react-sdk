# Components

The following components are exported by the SDK:

## FusionAuthLoginButton

A pre-styled button component that calls [login](context.md#login-function) when clicked. This button

## FusionAuthLogoutButton

A pre-styled button component that calls [logout](context.md#logout-function) when clicked

## FusionAuthRegisterButton

A pre-styled button component that calls [register](context.md#register-function) when clicked

## RequireAuth

A component that will only render its children if the user is authenticated, and optionally if they match a given role.

#### Props

| Name     | Type                   | Description                                                   |
| -------- | ---------------------- | ------------------------------------------------------------- |
| withRole | `string` (optional)    | A role the user must have in order for the children to render |
| children | `ReactNode` (optional) | The children to render when the user is authenticated         |
