import { IFusionAuthConfiguration } from '../../providers/FusionAuthProvider';

export const TEST_REDIRECT_URL =
    'http://localhost?code=here&state=00000000000000000000000000000000000000000000000000000000&error=none';

export const TEST_CONFIGURATION: IFusionAuthConfiguration = {
    baseUrl: 'https://sandbox.fusionauth.io',
    clientID: '85a03867-dccf-4882-adde-1a79aeec50df',
    serverUrl: 'http://localhost:9000',
    scope: 'openid offline_access',
    redirectUri: 'http://localhost',
    idTokenHint: 'token_hint',
};
