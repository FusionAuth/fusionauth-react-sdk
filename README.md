An SDK for using FusionAuth in React applications.

# Table of Contents

-   [Overview](#overview)

-   [Getting Started](#getting-started)

    -   [Installation](#installation)

    -   [Configuring Provider](#configuring-provider)

    -   [Server Code Requirements](#server-code-requirements)

-   [Usage](#usage)

    -   [Pre-built buttons](#pre-built-buttons)

    -   [Programmatic usage](#programmatic-usage)

    -   [Protecting content](#protecting-content)

    -   [Known issues](#known-issues)

-   [Example App](#example-app)

-   [Documentation](#documentation)

-   [Releases](#releases)

<!--
this tag, and the corresponding end tag, are used to delineate what is pulled into the FusionAuth docs site (the client libraries pages). Don't remove unless you also change the docs site.

Please also use ``` instead of indenting for code blocks. The backticks are translated correctly to adoc format.
-->

<!--
tag::forDocSite[]
-->

# Overview

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
1. Host your own server that performs the OAuth token exchange. See [Server Code
Requirements](#server-code-requirements) for more details.
    - Example app with server code: [fusionauth-example-react-sdk](https://github.com/FusionAuth/fusionauth-example-react-sdk)
2. Use the endpoints hosted by your FusionAuth instance to perform the OAuth token exchange for you.
    - Example app without server code: [fusionauth-quickstart-javascript-react-web](https://github.com/FusionAuth/fusionauth-quickstart-javascript-react-web)

You can use this library against any version of FusionAuth or any OIDC
compliant identity server.

# Getting Started

## Installation

NPM:

```bash
npm install @fusionauth/react-sdk
```

Yarn:

```bash
yarn add @fusionauth/react-sdk
```

## Configuring Provider

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

<!-- this is pulled into docs and our link checker complains if we don't have the id tag here -->
<h2 id="server-code-requirements">Server Code Requirements</h2>

If you set up your own server to perform the OAuth token exchange, it must have the following endpoints:

### `GET /app/login`

This endpoint must:

1.  Generate PKCE code.
    a. The code verifier should be saved in a secure HTTP-only cookie.
    b. The code challenge is passed along
2.  Encode and save `redirect_url` from react app to `state`.
3.  Redirect browser to `/oauth2/authorize` with a `redirect_uri` to `/app/token-exchange`

[Example
implementation](https://github.com/FusionAuth/fusionauth-example-react-sdk/blob/main/server/routes/login.js)

### `GET /app/callback`

This endpoint must:

1.  Call
    [/oauth2/token](https://fusionauth.io/docs/v1/tech/oauth/endpoints#complete-the-authorization-code-grant-request)
    to complete the Authorization Code Grant request. The `code` comes from the request query parameter and
    `code_verifier` should be available in the secure HTTP-only cookie, while
    the rest of the parameters should be set/configured on the server
    side.

2.  Once the token exchange succeeds, read the `app.at` from the
    response body and set it as a secure, HTTP-only cookie with the same
    name.

3.  If you wish to support refresh tokens, repeat step 2 for the
    `app.rt` cookie.

4.  Save the expiration time in a readable `app.at_exp` cookie.  And save the `app.idt` id token in a readable cookie.

5.  Redirect browser back to encoded url saved in `state`.

4.  Call
    [/oauth2/userinfo](https://fusionauth.io/docs/v1/tech/oauth/endpoints#userinfo)
    to retrieve the user info object and respond back to the client with
    this object.

[Example
implementation](https://github.com/FusionAuth/fusionauth-example-react-sdk/blob/main/server/routes/callback.js)

### `GET /app/register`

This endpoint is similar to `/login`.  It must:

1.  Generate PKCE code.
    a. The code verifier should be saved in a secure HTTP-only cookie.
    b. The code challenge is passed along
2.  Encode and save `redirect_url` from react app to `state`.
3.  Redirect browser to `/oauth2/register` with a `redirect_uri` to `/app/callback`

[Example
implementation](https://github.com/FusionAuth/fusionauth-example-react-sdk/blob/main/server/routes/register.js)

### `GET /app/me`

This endpoint must:

1.  Use `app.at` from cookie and use as the Bearer token to call `/oauth2/userinfo`
2.  Return json data

[Example
implementation](https://github.com/FusionAuth/fusionauth-example-react-sdk/blob/main/server/routes/me.js)

### `GET /app/logout`

This endpoint must:

1.  Clear the `app.at` and `app.rt` secure, HTTP-only
    cookies.
2.  Clear the `app.at_exp` and `app.idt` secure cookies.
3.  Redirect to `/oauth2/logout`

[Example
implementation](https://github.com/FusionAuth/fusionauth-example-react-sdk/blob/main/server/routes/logout.js)

### `POST /app/token-refresh` (optional)

This endpoint is necessary if you wish to use refresh tokens. This
endpoint must:

1.  Call
    [/oauth2/token](https://fusionauth.io/docs/v1/tech/oauth/endpoints#refresh-token-grant-request)
    to get a new `app.at` and `app.rt`.

2.  Update the `app.at`, `app.at_exp`, `app.idt`, and `app.rt` cookies from the
    response.

[Example
implementation](https://github.com/FusionAuth/fusionauth-example-react-sdk/blob/main/server/routes/token-refresh.js)

# Usage

## Pre-built buttons

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

## Programmatic usage

Alternatively, you may interact with the SDK programmatically using the
`useFusionAuth` hook or `withFusionAuth` HOC.

### useFusionAuth

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

### withFusionAuth

The `withFusionAuth` higher-order component can be used to wrap your
components and give them access to a `fusionAuth` prop which contains
all the properties exposed by the `FusionAuthContext`. This works with
both functional and class components:

#### Functional Component

```react
import React from 'react';
import { withFusionAuth, WithFusionAuthProps } from '@fusionauth/react-sdk';

const LogoutButton: React.FC<WithFusionAuthProps> = props => {
  const { logout } = props.fusionAuth;

  return <button onClick={() => logout()}>Logout</button>;
}

export default withFusionAuth(LogoutButton);
```

#### Class Component

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

### State parameter

The `login` and `register` functions both accept an optional string
parameter called `state`. The state that is passed in to the function
call will be passed back to the `onRedirectSuccess` handler on your
`FusionAuthProvider`. Though you may pass any value you would like for
the state parameter, it is often used to indicate which page the user
was on before redirecting to login or registration, so that the user can
be returned to that location after a successful authentication.

## Protecting Content

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

## Known Issues

### Token exchange endpoint being called repeatedly

If you see the token exchange endpoint being called multiple times, this
is due to a dev time setting in React 18. When running using
`StrictMode` in development mode, React 18 will mount, unmount, and
remount all components in this mode, which results in the network call
running twice.

This will not happen in a production build or if `StrictMode` is
disabled.

If you remove the `React.StrictMode` tags in `index.tsx` of the example
app, the call is only made once.

# Example App

See the [FusionAuth React SDK
Example](https://github.com/FusionAuth/fusionauth-example-react-sdk) for
functional example of a React client that utilizes the SDK as well as an
Express server that performs the token exchange.

# Documentation

[Full library
documentation](https://github.com/FusionAuth/fusionauth-react-sdk/blob/main/docs/documentation.md)

<!--
end::forDocSite[]
-->

Use backticks for code in this readme. This readme gets turned into asciidoc and included on the fusionauth website, and backticks show the code in the best light there.

# Formatting

There are several linting packages run when you push to a branch. One is `prettier`. If this fails, you can fix the files from the command line:

* npm run install
* npm run prettier -- -w /path/to/file

Doing this will overwrite your file, but fix prettier's objections.

# Releases

To perform a release:

-   Pull the code to your local machine

-   Bump the version in `package.json`

-   Run `npm run webpack`

-   Run `npm publish`

You may have to set up your machine to be able to publish, which will
involve updating your .npmrc file.

There’s information [here that you can
use](https://dev.to/alexeagleson/how-to-create-and-publish-a-react-component-library-2oe)
to do that (look for the `.npmrc` section).
