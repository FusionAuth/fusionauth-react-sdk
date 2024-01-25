import React, {
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Cookies from 'js-cookie';

const DEFAULT_SCOPE = 'openid offline_access';
// 30 sec window before making network refresh call
const DEFAULT_ACCESS_TOKEN_EXPIRE_WINDOW = 30000;

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
    clientID: string;
    serverUrl: string;
    redirectUri: string;
    onRedirectSuccess?: RedirectSuccess;
    onRedirectFail?: RedirectFail;
    scope?: string;
    accessTokenExpireWindow?: number;

    loginPath?: string;
    logoutPath?: string;
    registerPath?: string;
    tokenRefreshPath?: string;
    mePath?: string;
}

export const FusionAuthProvider: React.FC<FusionAuthConfig> = props => {
    const { children, onRedirectSuccess, onRedirectFail, mePath } = props;

    const [isAuthenticated, setIsAuthenticated] = useState(
        () => !!Cookies.get('app.at_exp'), // TODO - look at idToken?
    );
    const [isLoading, setIsLoading] = useState(false);

    const [user, setUser] = useState<Record<string, any>>({});

    const generateServerUrl = useCallback(
        (
            serverEndpoint: ServerFunctionType,
            propPathOverride?: string,
            queryParams?: Record<string, string>,
        ) => {
            const query = new URLSearchParams(queryParams);
            const queryString = query.toString().length > 0 ? `?${query}` : '';
            const path = propPathOverride
                ? propPathOverride
                : `/app/${serverEndpoint}`;
            return `${props.serverUrl}${path}${queryString}`;
        },
        [props.serverUrl],
    );

    const login = useCallback(
        async (state = '') => {
            const stateParam = `${generateRandomString()}:${state}`;
            Cookies.set('lastState', stateParam);
            const fullUrl = generateServerUrl(
                ServerFunctionType.login,
                props.loginPath,
                {
                    client_id: props.clientID,
                    scope: props.scope ?? DEFAULT_SCOPE,
                    redirect_uri: props.redirectUri,
                    state: stateParam,
                },
            );
            window.location.assign(fullUrl);
        },
        [
            generateServerUrl,
            props.clientID,
            props.redirectUri,
            props.loginPath,
            props.scope,
        ],
    );

    const logout = useCallback(async () => {
        // Clear cookies
        Cookies.remove('user');
        Cookies.remove('lastState');

        const queryParams = {
            client_id: props.clientID,
            post_logout_redirect_uri: props.redirectUri,
        };

        const fullUrl = generateServerUrl(
            ServerFunctionType.logout,
            props.logoutPath,
            queryParams,
        );
        window.location.assign(fullUrl);
    }, [
        generateServerUrl,
        props.clientID,
        props.logoutPath,
        props.redirectUri,
    ]);

    const register = useCallback(
        async (state = '') => {
            const stateParam = `${generateRandomString()}:${state}`;
            Cookies.set('lastState', stateParam);
            const fullUrl = generateServerUrl(
                ServerFunctionType.register,
                props.registerPath,
                {
                    client_id: props.clientID,
                    redirect_uri: props.redirectUri,
                    scope: props.scope ?? DEFAULT_SCOPE,
                    state: stateParam,
                },
            );
            window.location.assign(fullUrl);
        },
        [
            generateServerUrl,
            props.clientID,
            props.redirectUri,
            props.registerPath,
            props.scope,
        ],
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
        const accessTokenExpires = Cookies.get('app.at_exp');
        const timeWindow =
            props.accessTokenExpireWindow ?? DEFAULT_ACCESS_TOKEN_EXPIRE_WINDOW;
        if (
            accessTokenExpires === undefined ||
            Number(accessTokenExpires) < Date.now() + timeWindow
        ) {
            await fetch(
                generateServerUrl(
                    ServerFunctionType.tokenRefresh,
                    props.tokenRefreshPath,
                ),
                {
                    method: 'POST',
                    headers: {
                        // some servers expect content-type, even with no body
                        'content-type': 'text/plain',
                    },
                    credentials: 'include',
                },
            );
        }
    }, [
        generateServerUrl,
        props.tokenRefreshPath,
        props.accessTokenExpireWindow,
    ]);

    const didFetchUser = useRef(false);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!Cookies.get('app.at_exp')) {
            setIsAuthenticated(false);
            return;
        }

        if (Cookies.get('user') || didFetchUser.current) {
            return;
        }

        setIsLoading(true);
        didFetchUser.current = true;
        const lastState = Cookies.get('lastState');

        fetch(generateServerUrl(ServerFunctionType.me, mePath), {
            credentials: 'include',
        })
            .then(response => response.json())
            .then(user => {
                setUser(user);
                setIsAuthenticated(true);

                if (lastState) {
                    const [, ...stateParam] = lastState.split(':');
                    const state = stateParam.join(':');
                    onRedirectSuccess?.(state);
                }
            })
            .catch(error => {
                onRedirectFail?.(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [
        isAuthenticated,
        isLoading,
        generateServerUrl,
        onRedirectFail,
        onRedirectSuccess,
        mePath,
    ]);

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
            refreshToken,
            user,
        ],
    );

    return (
        <FusionAuthContext.Provider value={providerValue}>
            {children}
        </FusionAuthContext.Provider>
    );
};

export const useFusionAuth = () => useContext(FusionAuthContext);

enum ServerFunctionType {
    login = 'login',
    logout = 'logout',
    register = 'register',
    tokenRefresh = 'refresh',
    me = 'me',
}

function dec2hex(dec: number) {
    return ('0' + dec.toString(16)).substr(-2);
}

function generateRandomString() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join('');
}
