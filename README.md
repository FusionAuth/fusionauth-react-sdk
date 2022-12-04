# FusionAuth React SDK
An SDK for using FusionAuth in React applications.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Configuring Provider](#configuring-provider)
- [Usage](#usage)
  - [Pre-built buttons](#pre-built-buttons)
  - [Programmatic usage](#programmatic-usage)
  - [Protecting content](#protecting-content)
- [Documentation](#documentation)

## Overview

This SDK supports authentication via the Authorization Code Grant. Note that this setup requires you to have a server
that performs the OAuth token exchange. See the [Example App](#example-app) as a reference for how to do this.

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
the OAuth token exchange. See the [server requirements]()

## Usage

### Pre-built buttons
There are three pre-styled buttons that are configured to perform login/logout/registration. They can be placed anywhere in your app as is.

```TSX
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

#### withFusionAuth

The `withFusionAuth` higher-order component can be used to wrap your components and give them access to a `fusionAuth` 
prop which contains all the properties exposed by the `FusionAuthContext`. This works with both functional and class
components:

##### Functional Component

```TSX
import React from 'react';
import { withFusionAuth, WithFusionAuthProps } from 'fusionauth-react-sdk';

const LogoutButton: React.FC<WithFusionAuthProps> = props => {
    const { logout } = props.fusionAuth;

    return <button onClick={() => logout()}>Logout</button>;
}

export default withFusionAuth(LogoutButton);
```

##### Class Component

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

#### useFusionAuth
The `useFusionAuth` hook exports 3 functions, `login`, `logout`, and `register`.

`login` and `register` both accept a `state` variable. This is a dehydratedstate JSON object which can be used for passing arbitrary values to the react app after returning from a successful login/register.

It also has an exported `user` variable that is returned by your FusionAuth instance.


### Protecting Content

The `RequireAuth` component can be used to protect information from unauthorized users. It takes an optional prop `withRole`
that can be used to ensure the user has a specific role.

```TSX
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

## Documentation

[Full library documentation](docs/documentation.md)
