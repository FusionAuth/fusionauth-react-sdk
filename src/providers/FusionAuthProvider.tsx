import React, {
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';
import Cookies from 'js-cookie';

const DEFAULT_SCOPE = 'openid offline_access';

export interface IFusionAuthContext {
    login: (state?: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (state?: string) => Promise<void>;
    user: Record<string, any>;
    isLoading: boolean;
    isAuthenticated: boolean;
    refreshToken: () => Promise<void>;
}

export const FusionAuthContext = React.createContext<IFusionAuthContext>({
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    register: () => Promise.resolve(),
    user: {},
    isLoading: false,
    isAuthenticated: false,
    refreshToken: () => Promise.resolve(),
});

export type RedirectSuccess = (state: string) => void;
export type RedirectFail = (error: any) => void;

export interface FusionAuthConfig extends PropsWithChildren {
    baseUrl: string;
    clientID: string;
    serverUrl: string;
    redirectUri: string;
    idTokenHint?: string;
    onRedirectSuccess?: RedirectSuccess;
    onRedirectFail?: RedirectFail;
    scope?: string;
}

export const FusionAuthProvider: React.FC<FusionAuthConfig> = props => {
    const { children } = props;

    const [isAuthenticated, setIsAuthenticated] = useState(
        () => !!Cookies.get('user'),
    );
    const [isLoading, setIsLoading] = useState(false);

    const [user, setUser] = useState<Record<string, any>>({});

    const generateUrl = useCallback(
        (functionType: FunctionType, queryParams: Record<string, string>) => {
            const query = new URLSearchParams(queryParams);

            return `${props.baseUrl}/oauth2/${functionType}?${query}`;
        },
        [props.baseUrl],
    );

    const login = useCallback(
        async (state = '') => {
            const stateParam = `${generateRandomString()}:${state}`;
            Cookies.set('lastState', stateParam);
            const code = await generatePKCE();
            Cookies.set('codeVerifier', code.code_verifier);
            const queryParams = {
                client_id: props.clientID,
                scope: props?.scope ?? DEFAULT_SCOPE,
                response_type: 'code',
                redirect_uri: props.redirectUri,
                code_challenge: code.code_challenge,
                code_challenge_method: 'S256',
                state: stateParam,
            };
            const fullUrl = generateUrl(FunctionType.login, queryParams);
            window.location.assign(fullUrl);
        },
        [generateUrl, props.clientID, props.redirectUri, props?.scope],
    );

    const logout = useCallback(async () => {
        // Clear cookies
        Cookies.remove('user');
        Cookies.remove('lastState');
        Cookies.remove('codeVerifier');

        fetch(`${props.serverUrl}/logout`, { credentials: 'include' }).then(
            () => {
                const queryParams = {
                    client_id: props.clientID,
                    post_logout_redirect_uri: props.redirectUri,
                    id_token_hint: props.idTokenHint ?? '',
                };
                const fullUrl = generateUrl(FunctionType.logout, queryParams);
                window.location.assign(fullUrl);
            },
        );
    }, [
        generateUrl,
        props.clientID,
        props.idTokenHint,
        props.redirectUri,
        props.serverUrl,
    ]);

    const register = useCallback(
        async (state = '') => {
            const stateParam = `${generateRandomString()}:${state}`;
            Cookies.set('lastState', stateParam);
            const code = await generatePKCE();
            Cookies.set('codeVerifier', code.code_verifier);
            const queryParams = {
                client_id: props.clientID,
                scope: props.scope ?? DEFAULT_SCOPE,
                response_type: 'code',
                redirect_uri: props.redirectUri,
                code_challenge: code.code_challenge,
                code_challenge_method: 'S256',
                state: stateParam,
            };
            const fullUrl = generateUrl(FunctionType.register, queryParams);
            window.location.assign(fullUrl);
        },
        [generateUrl, props.clientID, props.redirectUri, props.scope],
    );

    useEffect(() => {
        const userCookie = Cookies.get('user');
        if (userCookie) {
            try {
                setUser(JSON.parse(userCookie));
            } catch {
                /* if JSON parse fails doesn't crash the app */
            }
        }
    }, [setUser]);

    const refreshToken = useCallback(async () => {
        await fetch(`${props.serverUrl}/jwt-refresh`, {
            method: 'POST',
            credentials: 'include',
        });
    }, [props.serverUrl]);

    useLayoutEffect(() => {
        const lastState = Cookies.get('lastState');
        const codeVerifier = Cookies.get('codeVerifier');

        if (hasAuthParams() && lastState !== null) {
            const urlParams = new URLSearchParams(window.location.search);

            if (lastState === urlParams.get('state')) {
                setIsLoading(true);
                fetch(`${props.serverUrl}/token-exchange`, {
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
                        // If for some reason they don't send back a user then don't set the cookie and
                        // clear out any old cookie
                        if (data.user) {
                            Cookies.set('user', JSON.stringify(data.user));
                        } else {
                            Cookies.remove('user');
                        }
                        setUser(data.user);
                        setIsAuthenticated(true);

                        const [, ...stateParam] = lastState.split(':');
                        const state = stateParam.join(':');
                        props.onRedirectSuccess?.(state);
                    })
                    .catch(error => {
                        props.onRedirectFail?.(error);
                    })
                    .finally(() => setIsLoading(false));
            }
        }
    }, [props, props.serverUrl]);

    const providerValue = useMemo(
        () => ({
            login,
            logout,
            register,
            isAuthenticated,
            isLoading,
            user,
            refreshToken,
        }),
        [
            login,
            logout,
            register,
            isAuthenticated,
            isLoading,
            user,
            refreshToken,
        ],
    );

    return (
        <FusionAuthContext.Provider value={providerValue}>
            {children}
        </FusionAuthContext.Provider>
    );
};

export const useFusionAuth = () => useContext(FusionAuthContext);

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
    return Array.from(array, dec2hex).join('');
}

function hasAuthParams(): boolean {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    return code !== null || state !== null || error !== null;
}
