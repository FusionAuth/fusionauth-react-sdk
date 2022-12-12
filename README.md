# FusionAuth React SDK
An SDK for using FusionAuth in React applications.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Configuring Provider](#configuring-provider)
    - [Server Code Requirements](#server-code-requirements)
- [Usage](#usage)
  - [Pre-built buttons](#pre-built-buttons)
  - [Programmatic usage](#programmatic-usage)
  - [Protecting content](#protecting-content)
- [Documentation](#documentation)

[//]: # (tag::forClientLibraryPage[])
## Overview

This SDK supports authentication via the Authorization Code Grant. Once authentication succeeds, the following secure, 
HTTP-only cookies will be set:

- `access_token` - an OAuth [Access Token](https://fusionauth.io/docs/v1/tech/oauth/tokens#access-token)
- `refresh_token` - a [Refresh Token](https://fusionauth.io/docs/v1/tech/oauth/tokens#refresh-token) used to obtain a new `access_token`. This cookie will only be set if refresh tokens are enabled on your FusionAuth instance.

Note that this setup requires you to have a server
that performs the OAuth token exchange. See [Server Code Requirements](#server-code-requirements) for more details.

## Getting Started

### Installation

NPM:
```bash
npm install fusionauth-react-sdk
```

Yarn:
```bash
yarn add fusionauth-react-sdk
```

### Configuring Provider
To configure the SDK, wrap your app with `FusionAuthProvider`:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FusionAuthProvider } from 'fusionauth-react-sdk';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <FusionAuthProvider
        baseUrl=""      // The base URL of your FusionAuth instance
        clientID=""     // Your FusionAuth client ID
        serverUrl=""    // The base URL of your server for the token exchange
        redirectUri=""  // The URI that the user is directed to after the login/register/logout action
    >
        <App />
    </FusionAuthProvider>
);
```

### Server Code Requirements

Authenticating with FusionAuth requires you to set up a server that will be used to perform
the OAuth token exchange. This server must have the following endpoints:

#### `POST /token-exchange`
This endpoint must:

1. Call [/oauth2/token](https://fusionauth.io/docs/v1/tech/oauth/endpoints#complete-the-authorization-code-grant-request)
   to complete the Authorization Code Grant request. The `code` and `code_verifier` parameters should come from the
   request body, while the rest of the parameters should be set/configured on the server side.
2. Once the token exchange succeeds, read the `access_token` from the response body and set it as a secure, HTTP-only cookie with the same name.
3. If you wish to support refresh tokens, repeat step 2 for the `refresh_token` cookie.
4. Call [/oauth2/userinfo](https://fusionauth.io/docs/v1/tech/oauth/endpoints#userinfo) to retrieve the user info object
   and respond back to the client with this object.

[Example implementation](https://github.com/FusionAuth/fusionauth-example-react-sdk/blob/main/server/routes/token-exchange.js)

#### `POST /jwt-refresh` (optional)

This endpoint is necessary if you wish to use refresh tokens. This endpoint must:

1. Call [/api/jwt/refresh](https://fusionauth.io/docs/v1/tech/apis/jwt#refresh-a-jwt) to get a new `access_token` and
   `refresh_token`.
2. Update the `access_token` and `refresh_token` cookies from the response.

[Example implementation](https://github.com/FusionAuth/fusionauth-example-react-sdk/blob/main/server/routes/jwt-refresh.js)

## Usage

### Pre-built buttons
There are three pre-styled buttons that are configured to perform login/logout/registration. They can be placed anywhere in your app as is.

```tsx
import {
    FusionAuthLoginButton,
    FusionAuthLogoutButton,
    FusionAuthRegisterButton
} from 'fusionauth-react-sdk';

export const LoginPage = () => (
    <>
        <h1>Welcome, please log in or register</h1>

        <FusionAuthLoginButton />

        <FusionAuthRegisterButton />
    </>
);

export const AccountPage = () => (
    <>
        <h1>Hello, user!</h1>

        <FusionAuthLogoutButton />
    </>
);
```

### Programmatic usage

Alternatively, you may interact with the SDK programmatically using the `useFusionAuth` hook or `withFusionAuth` HOC.

#### useFusionAuth

Use the `useFusionAuth` hook with your functional components to get access to the properties exposed by [FusionAuthContext](docs/context.md#fusionauthcontext):

```tsx
import React from 'react';
import { useFusionAuth } from 'fusionauth-react-sdk';

const App = () => {
    const { login, logout, register, isAuthenticated } = useFusionAuth();

    return isAuthenticated ? (
        <div>
          <span>Hello, user!</span>
          <button onClick={() => logout()}>Logout</button>
        </div>
    ) : (
        <div>
          <button onClick={() => login()}>Log in</button>
          <button onClick={() => register()}>Register</button>
        </div>
    );
};
```

See [useFusionAuth](docs/functions.md#usefusionauth) for more details.

#### withFusionAuth

The `withFusionAuth` higher-order component can be used to wrap your components and give them access to a `fusionAuth` 
prop which contains all the properties exposed by the `FusionAuthContext`. This works with both functional and class
components:

##### Functional Component

```tsx
import React from 'react';
import { withFusionAuth, WithFusionAuthProps } from 'fusionauth-react-sdk';

const LogoutButton: React.FC<WithFusionAuthProps> = props => {
    const { logout } = props.fusionAuth;

    return <button onClick={() => logout()}>Logout</button>;
}

export default withFusionAuth(LogoutButton);
```

##### Class Component

```tsx
import React, { Component } from 'react';
import { withFusionAuth, WithFusionAuthProps } from 'fusionauth-react-sdk';

class LogoutButton extends Component<WithFusionAuthProps> {
    render() {
        const { logout } = this.props.fusionAuth;
        return <button onClick={() => logout()}>Logout</button>;
    }
}

export default withFusionAuth(LogoutButton);
```

See [withFusionAuth](docs/functions.md#withfusionauth) for more details.

#### State parameter

The `login` and `register` functions both accept an optional string parameter called `state`. The state that is passed
in to the function call will be passed back to the `onRedirectSuccess` handler on your `FusionAuthProvider`. Though you
may pass any value you would like for the state parameter, it is often used to indicate which page the user
was on before redirecting to login or registration, so that the user can be returned to that location after a successful authentication.

### Protecting Content

The `RequireAuth` component can be used to protect information from unauthorized users. It takes an optional prop `withRole`
that can be used to ensure the user has a specific role.

```tsx
import { RequireAuth, useFusionAuth } from 'fusionauth-react-sdk';

const UserNameDisplay = () => {
    const { user } = useFusionAuth();

    return (
        <RequireAuth>
            <p>User: {user.name}</p> // Only displays if user is authenticated
        </RequireAuth>
    );
};

const AdminPanel = () => (
    <RequireAuth withRole="admin">
        <button>Delete User</button> // Only displays if user is authenticated and has 'admin' role
    </RequireAuth>
);
```

## Example App

See the [FusionAuth React SDK Example](https://github.com/FusionAuth/fusionauth-example-react-sdk) for functional example of a React client that utilizes the SDK as well as an Express server that performs the token exchange.

[//]: # (end::forClientLibraryPage[])

## Documentation

[Full library documentation](docs/documentation.md)
