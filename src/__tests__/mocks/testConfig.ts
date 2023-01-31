import { FusionAuthConfig } from '../../providers/FusionAuthProvider';

export const TEST_REDIRECT_URL =
    'http://localhost?code=here&state=00000000000000000000000000000000000000000000000000000000:state&error=none';

export const TEST_COOKIE =
    'lastState=00000000000000000000000000000000000000000000000000000000:state; access_token_expires=1675102108594; ';

export const TEST_CONFIG: FusionAuthConfig = {
    clientID: '85a03867-dccf-4882-adde-1a79aeec50df',
    serverUrl: 'http://localhost:9000',
    scope: 'openid offline_access',
    redirectUri: 'http://localhost',
};
