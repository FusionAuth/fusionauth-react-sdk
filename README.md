An SDK for using FusionAuth in React applications.

# Table of Contents

-   [Overview](#overview)

-   [Getting Started](#getting-started)

    -   [Installation](#installation)

    -   [Configuring Provider](#configuring-provider)

-   [Usage](#usage)

    -   [Pre-built buttons](#pre-built-buttons)

    -   [Programmatic usage](#programmatic-usage)

    -   [Protecting content](#protecting-content)

    -   [Known issues](#known-issues)

-   [Example App](#example-app)

-   [Quickstart](#quickstart)

-   [Documentation](#documentation)

-   [Releases](#releases)

<!--
this tag, and the corresponding end tag, are used to delineate what is pulled into the FusionAuth docs site (the client libraries pages). Don't remove unless you also change the docs site.

Please also use ``` instead of indenting for code blocks. The backticks are translated correctly to adoc format.
-->

# Overview

<!--
tag::forDocSite[]
-->

This SDK allows you to add login, logout, and registration buttons to
your React application. You can do this via pre-built buttons, hooks, or
higher-order components.

Your users will be sent to FusionAuth’s themeable hosted login pages and
then log in. After that, they are sent back to your React application.

Once authentication succeeds, the following secure, HTTP-only cookies
will be set:

-   `app.at` - an OAuth [Access
    Token](https://fusionauth.io/docs/v1/tech/oauth/tokens#access-token)

-   `app.rt` - a [Refresh
    Token](https://fusionauth.io/docs/v1/tech/oauth/tokens#refresh-token)
    used to obtain a new `app.at`. This cookie will only be set if
    refresh tokens are enabled on your FusionAuth instance.

The access token can be presented to APIs to authorize the request and
the refresh token can be used to get a new access token.

There are 2 ways to interact with this SDK:
1. By hosting your own server that performs the OAuth token exchange and meets the [server code requirements for FusionAuth Web SDKs](https://github.com/FusionAuth/fusionauth-javascript-sdk-express#server-code-requirements).
2. By using the server hosted on your FusionAuth instance, i.e., not writing your own server code.

If you are hosting your own server, see [server code requirements](https://github.com/FusionAuth/fusionauth-javascript-sdk-express#server-code-requirements).

You can use this library against any version of FusionAuth or any OIDC
compliant identity server.

## Getting Started

### Installation

NPM:

```bash
npm install @fusionauth/react-sdk
```

Yarn:

```bash
yarn add @fusionauth/react-sdk
```

### Configuring Provider

To configure the SDK, wrap your app with `FusionAuthProvider`:

```react
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FusionAuthProvider } from '@fusionauth/react-sdk';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

    root.render(
        <FusionAuthProvider
            clientID=""     // Your FusionAuth client ID
            serverUrl=""    // The URL of the server that performs the token exchange
            redirectUri=""  // The URI that the user is directed to after the login/register/logout action
        >
            <App />
        </FusionAuthProvider>
    );
```

## Usage

### Pre-built buttons

There are three pre-styled buttons that are configured to perform
login/logout/registration. They can be placed anywhere in your app as
is.

```react
import {
  FusionAuthLoginButton,
  FusionAuthLogoutButton,
  FusionAuthRegisterButton
} from '@fusionauth/react-sdk';

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

Alternatively, you may interact with the SDK programmatically using the
`useFusionAuth` hook or `withFusionAuth` HOC.

#### useFusionAuth

Use the `useFusionAuth` hook with your functional components to get
access to the properties exposed by
[FusionAuthContext](https://github.com/FusionAuth/fusionauth-react-sdk/blob/main/docs/context.md#fusionauthcontext):

```react
import React from 'react';
import { useFusionAuth } from '@fusionauth/react-sdk';

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

See
[useFusionAuth](https://github.com/FusionAuth/fusionauth-react-sdk/blob/main/docs/functions.md#usefusionauth)
for more details.

#### withFusionAuth

The `withFusionAuth` higher-order component can be used to wrap your
components and give them access to a `fusionAuth` prop which contains
all the properties exposed by the `FusionAuthContext`. This works with
both functional and class components:

##### Functional Component

```react
import React from 'react';
import { withFusionAuth, WithFusionAuthProps } from '@fusionauth/react-sdk';

const LogoutButton: React.FC<WithFusionAuthProps> = props => {
  const { logout } = props.fusionAuth;

  return <button onClick={() => logout()}>Logout</button>;
}

export default withFusionAuth(LogoutButton);
```

##### Class Component

```react
import React, { Component } from 'react';
import { withFusionAuth, WithFusionAuthProps } from '@fusionauth/react-sdk';

class LogoutButton extends Component<WithFusionAuthProps> {
  render() {
    const { logout } = this.props.fusionAuth;
    return <button onClick={() => logout()}>Logout</button>;
  }
}

export default withFusionAuth(LogoutButton);
```

See
[withFusionAuth](https://github.com/FusionAuth/fusionauth-react-sdk/blob/main/docs/functions.md#withfusionauth)
for more details.

#### State parameter

The `login` and `register` functions both accept an optional string
parameter called `state`. The state that is passed in to the function
call will be passed back to the `onRedirectSuccess` handler on your
`FusionAuthProvider`. Though you may pass any value you would like for
the state parameter, it is often used to indicate which page the user
was on before redirecting to login or registration, so that the user can
be returned to that location after a successful authentication.

### Protecting Content

The `RequireAuth` component can be used to protect information from
unauthorized users. It takes an optional prop `withRole` that can be
used to ensure the user has a specific role. If an array of roles is
passed, the user must have at least one of the roles to be authorized.

```react
import { RequireAuth, useFusionAuth } from '@fusionauth/react-sdk';

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

### Known Issues

#### Token exchange endpoint being called repeatedly

If you see the token exchange endpoint being called multiple times, this
is due to a dev time setting in React 18. When running using
`StrictMode` in development mode, React 18 will mount, unmount, and
remount all components in this mode, which results in the network call
running twice.

This will not happen in a production build or if `StrictMode` is
disabled.

If you remove the `React.StrictMode` tags in `index.tsx` of the example
app, the call is only made once.

## Quickstart

See the [FusionAuth React Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-react-web) for a full tutorial on using FusionAuth and React.

## Documentation

[Full library
documentation](https://github.com/FusionAuth/fusionauth-react-sdk/blob/main/docs/documentation.md)

<!--
end::forDocSite[]
-->

Use backticks for code in this readme. This readme is included on the FusionAuth website, and backticks show the code in the best light there.

## Formatting

There are several linting packages run when you push to a branch. One is `prettier`. If this fails, you can fix the files from the command line:

* npm run install
* npm run prettier -- -w /path/to/file

Doing this will overwrite your file, but fix prettier's objections.

## Releases

To perform a release to NPM, create a release on GitHub. That will automatically publish a release to GitHub.
