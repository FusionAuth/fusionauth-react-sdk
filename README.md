# FusionAuth React SDK
An SDK for using FusionAuth with React. Currently under development.

# Installation
From npm:
`npm install fusionauth-react-sdk`
From yarn:
`yarn add fusionauth-react-sdk`

# Using the Provider
This SDK includes a Provider that you can add to your application using:
```
import {FusionAuthProvider} from 'fusionauth-react-sdk'

...

<FusionAuthProvider
    config={...}
>
    ...
</FusionAuthProvider>
```

This config prop is set up as follows:
```
baseUrl: string;      // The base URL of your FusionAuth instance
clientID: string;     // Your client id (found in FusionAuth)
serverUrl: string;    // The base URL of your server
scope: string;        // openid offline_access
redirectUri: string;  // The URI that the user is directed to after the login/register/logout action
idTokenHint?: string; // The id_token returned from the auth code grant
```

# Using the Hook
The `useFusionAuthContext` hook exports 3 functions, `login`, `logout`, and `register`.

`login` and `register` both accept a `state` variable. This is a dehydratedstate JSON object which can be used for passing arbitrary values to the react app after returning from a successful login/register.

It also has an exported `user` variable that is returned by your FusionAuth instance.

# Using the Components
There are 3 buttons that are configured to call their corresponding function: `FusionAuthLoginButton`, `FusionAuthLogoutButton`, and `FusionAuthRegisterButton`.
There is a `RequireAuth` component that can be used to hide information from unauthorized users. This takes an optional prop `authorizedRole` that will hide information from users without that role.