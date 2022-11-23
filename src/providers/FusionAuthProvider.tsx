import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import Cookies from 'js-cookie';

export interface IFusionAuthContext {
    login: (state: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (state: string) => Promise<void>;
    user: Record<string, any>;
    refreshToken: () => Promise<void>;
}

export const FusionAuthContext = React.createContext<IFusionAuthContext>({
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    register: () => Promise.resolve(),
    user: {},
    refreshToken: () => Promise.resolve(),
});

export interface FusionAuthConfig {
    baseUrl: string;
    clientID: string;
    serverUrl: string;
    scope: string;
    redirectUri: string;
    idTokenHint?: string;
}

interface Props {
    config: FusionAuthConfig;
    children?: React.ReactNode;
}

export const FusionAuthProvider: React.FC<Props> = ({ config, children }) => {
    const [user, setUser] = useState<Record<string, any>>({});

    const generateUrl = useCallback(
        (functionType: FunctionType, queryParams: Record<string, string>) => {
            const query = new URLSearchParams(queryParams);

            return `${config.baseUrl}/oauth2/${functionType}?${query}`;
        },
        [config],
    );

    const login = useCallback(
        async (state = '') => {
            const stateParam = `${generateRandomString()}:${state}`;
            Cookies.set('lastState', stateParam);
            const code = await generatePKCE();
            Cookies.set('codeVerifier', code.code_verifier);
            const queryParams = {
                client_id: config.clientID,
                scope: config.scope,
                response_type: 'code',
                redirect_uri: config.redirectUri,
                code_challenge: code.code_challenge,
                code_challenge_method: 'S256',
                state: stateParam,
            };
            const fullUrl = generateUrl(FunctionType.login, queryParams);
            window.location.assign(fullUrl);
        },
        [config, generateUrl],
    );

    const logout = useCallback(async () => {
        // Clear cookies
        Cookies.remove('user');
        Cookies.remove('lastState');
        Cookies.remove('codeVerifier');
        Cookies.remove('refresh_token');
        Cookies.remove('access_token');
        const queryParams = {
            client_id: config.clientID,
            post_logout_redirect_uri: config.redirectUri,
            id_token_hint: config.idTokenHint ?? '',
        };
        const fullUrl = generateUrl(FunctionType.logout, queryParams);
        window.location.assign(fullUrl);
    }, [config, generateUrl]);

    const register = useCallback(
        async (state = '') => {
            const stateParam = `${generateRandomString()}:${state}`;
            Cookies.set('lastState', stateParam);
            const code = await generatePKCE();
            Cookies.set('codeVerifier', code.code_verifier);
            const queryParams = {
                client_id: config.clientID,
                scope: config.scope,
                response_type: 'code',
                redirect_uri: config.redirectUri,
                code_challenge: code.code_challenge,
                code_challenge_method: 'S256',
                state: stateParam,
            };
            const fullUrl = generateUrl(FunctionType.register, queryParams);
            window.location.assign(fullUrl);
        },
        [config, generateUrl],
    );

    useEffect(() => {
        const userCookie = Cookies.get('user');
        if (userCookie) {
            setUser(JSON.parse(userCookie));
        }
    }, [setUser]);

    const refreshToken = useCallback(async () => {
        fetch(`${config.serverUrl}/jwt-refresh`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            credentials: 'include',
        });
    }, [config]);

    useEffect(() => {
        try {
            const lastState = Cookies.get('lastState');
            const codeVerifier = Cookies.get('codeVerifier');

            if (hasAuthParams() && lastState !== null) {
                const urlParams = new URLSearchParams(window.location.search);

                if (lastState === urlParams.get('state')) {
                    fetch(`${config.serverUrl}/token-exchange`, {
                        method: 'POST',
                        body: JSON.stringify({
                            code: urlParams.get('code'),
                            code_verifier: codeVerifier,
                        }),
                        headers: {
                            'content-type': 'application/json',
                        },
                        credentials: 'include',
                    })
                        .then(response => response.json())
                        .then(data => {
                            Cookies.set('user', JSON.stringify(data.user));
                            setUser(data.user);
                        });
                }
            }
        } catch (error) {
            console.error(error);
        }
    }, [config]);

    const providerValue = useMemo(
        () => ({
            login,
            logout,
            register,
            user,
            refreshToken,
        }),
        [login, logout, register, user, refreshToken],
    );

    return (
        <FusionAuthContext.Provider value={providerValue}>
            {children}
        </FusionAuthContext.Provider>
    );
};

export const useFusionAuthContext = () => useContext(FusionAuthContext);

enum FunctionType {
    login = 'authorize',
    logout = 'logout',
    register = 'register',
}

function dec2hex(dec: number) {
    return ('0' + dec.toString(16)).substr(-2);
}

async function generatePKCE() {
    const code_verifier = generateRandomString();

    const encoder = new TextEncoder();
    const data = encoder.encode(code_verifier);
    const sha256 = await window.crypto.subtle.digest('SHA-256', data);

    let str = '';
    const bytes = new Uint8Array(sha256);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        str += String.fromCharCode(bytes[i]);
    }

    const code_challenge = btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return { code_verifier, code_challenge };
}

function generateRandomString() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    const string = Array.from(array, dec2hex).join('');
    return string;
}

function hasAuthParams(): boolean {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    return code !== null || state !== null || error !== null;
}
