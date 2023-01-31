fusionauth-react-sdk Changes

Changes in 0.24.0

-   _Breaking change_ Refactoring to work with upcoming FusionAuth hosted token exchange endpoints. _Many_ changes with server communication.
    -   Updates simplify configuration and offload pkce code generation from the browser
    -   Corresponding server side update in fusionauth-example-react-sdk
    -   New access_token_expires cookie lets us know when access_token expires
    -   refreshToken() only makes network call if access_token about to expire
    -   Server routes now scoped under `/app/` (this is overrideable)
    -   `jwt-refresh` now named `/app/token-refresh`
    -   User info no longer returned from `/app/token-exchange`. Now, explicit call to `/app/me` is made. Json data is top level and not scoped under `{"user": {} }`

Changes in 0.23.0

-   _Breaking change_ Module is now scoped and renamed to `@fusionauth/react-sdk`. Users will need to update `package.json` and imports.

Changes in 0.22.1

-   _Breaking change_ Logout calls new server `/logout` endpoint before redirecting to `/oauth2/logout`
