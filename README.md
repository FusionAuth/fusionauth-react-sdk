# FusionAuth React SDK
An SDK for using FusionAuth in React applications.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Configuring Provider](#configuring-provider)

## Overview

This SDK supports authentication via the Authorization Code Grant

## Getting Started

### Installation

NPM:
```bash
npm install fusionauth-react-sdk
````

Yarn:
```bash
yarn add fusionauth-react-sdk
````

### Configuring Provider
To configure the SDK, wrap your app with `FusionAuthProvider`:

```TSX
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FusionAuthProvider } from 'fusionauth-react-sdk';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <FusionAuthProvider config={{
    baseUrl: ''       // The base URL of your FusionAuth instance
    clientID: '',     // Your FusionAuth client ID
    serverUrl: '',    // The base URL of your server for the token exchange
    scope: '',        // openid offline_access
    redirectUri: '',  // The URI that the user is directed to after the login/register/logout action
  }}>
    <App />
  </FusionAuthProvider>
);
```

### withFusionAuth

The `withFusionAuth` higher-order component can be used to wrap your components and give them access to a `fusionAuth` 
prop which contains all the properties exposed by the `FusionAuthContext`. This works with both functional and class
components:

#### Functional Component

```TSX
import React from 'react';
import { withFusionAuth, WithFusionAuthProps } from 'fusionauth-react-sdk';

const LogoutButton: React.FC<WithFusionAuthProps> = props => {
    const { logout } = props.fusionAuth;

    return <button onClick={() => logout()}>Logout</button>;
}

export default withFusionAuth(LogoutButton);
```

#### Class Component

```TSX
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

### Using the Hook
The `useFusionAuthContext` hook exports 3 functions, `login`, `logout`, and `register`.

`login` and `register` both accept a `state` variable. This is a dehydratedstate JSON object which can be used for passing arbitrary values to the react app after returning from a successful login/register.

It also has an exported `user` variable that is returned by your FusionAuth instance.

### Using the Components
There are 3 buttons that are configured to call their corresponding function: `FusionAuthLoginButton`, `FusionAuthLogoutButton`, and `FusionAuthRegisterButton`.

```TSX
import {FusionAuthLoginButton, FusionAuthLogoutButton, FusionAuthRegisterButton} from 'fusionauth-react-sdk';

<FusionAuthLoginButton />
<FusionAuthRegisterButton />
<FusionAuthLogoutButton />
```


There is a `RequireAuth` component that can be used to hide information from unauthorized users. This takes an optional prop `authorizedRole` that will hide information from users without that role.

```TSX
import {RequireAuth, useFusionAuthContext} from 'fusionauth-react-sdk';

const { user } = useFusionAuthContext();

...

// This will only show if there's an authenticated user
<RequireAuth>
    <p>User: {user.name}</p>
</RequireAuth>

// This will only show if there's an authenticated user with the admin role
<RequireAuth withRole="admin" >
    <p>User: {user.name}</p>
</RequireAuth>
```
