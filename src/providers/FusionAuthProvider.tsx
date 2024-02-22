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
    login: (state?: string) => void;
    logout: () => void;
    register: (state?: string) => void;
    user: Record<string, any>;
    isLoading: boolean;
    isAuthenticated: boolean;
    refreshToken: () => Promise<void>;
}

export const FusionAuthContext = React.createContext<IFusionAuthContext>({
    login: () => {},
    logout: () => {},
    register: () => {},
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
    accessTokenExpireCookieName?: string;
    loginPath?: string;
    logoutPath?: string;
    registerPath?: string;
    tokenRefreshPath?: string;
    mePath?: string;
}

export const FusionAuthProvider: React.FC<FusionAuthConfig> = props => {
    const { children, onRedirectSuccess, onRedirectFail, mePath } = props;

    const [isLoading, setIsLoading] = useState(false);

    type User = Record<string, any>;
    const [user, setUser] = useState<User>({});
    const isAuthenticated = useMemo(() => Object.keys(user).length > 0, [user]);

    const accessTokenExpireCookieName = useMemo(() => {
        if (props.accessTokenExpireCookieName?.length) {
            return props.accessTokenExpireCookieName;
        }

        console.warn(
            'Cannot set access token cookie name to empty string. Using default value.',
        );

        return 'app.at_exp';
    }, [props.accessTokenExpireCookieName]);

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
        (state = '') => {
            const stateParam = setUpRedirect(state);
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

    const logout = useCallback(() => {
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
        (state = '') => {
            const stateParam = setUpRedirect(state);
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

    const refreshToken = useCallback(async () => {
        const accessTokenExpires = Cookies.get(accessTokenExpireCookieName);
        const timeWindow =
            props.accessTokenExpireWindow ?? DEFAULT_ACCESS_TOKEN_EXPIRE_WINDOW;
        const fallbackTokenRefreshPath = `/app/refresh/${props.clientID}`;
        if (
            accessTokenExpires === undefined ||
            Number(accessTokenExpires) * 1000 < Date.now() + timeWindow
        ) {
            await fetch(
                generateServerUrl(
                    ServerFunctionType.tokenRefresh,
                    // add fallback so the optional tokenRefreshPath prop isn't required to construct the refresh URL
                    props.tokenRefreshPath || fallbackTokenRefreshPath,
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
        accessTokenExpireCookieName,
        props.accessTokenExpireWindow,
        props.tokenRefreshPath,
        props.clientID,
        generateServerUrl,
    ]);

    const setUserFromCookie = useCallback((cookie: string) => {
        try {
            /* JSON parse needs try/catch to not crash app */
            const parsedUserCookie = JSON.parse(cookie);
            setUser(parsedUserCookie);
        } catch {
            setUser({});
            Cookies.remove('user');
        }
    }, []);

    const fetchUserFromServer = useCallback(async () => {
        setIsLoading(true);
        // lastState indicates that this is a redirect
        const lastState = Cookies.get('lastState');

        try {
            const response = await fetch(
                generateServerUrl(ServerFunctionType.me, mePath),
                {
                    credentials: 'include',
                },
            );

            if (!response.ok) {
                throw new Error(
                    `Unable to fetch user. Request failed with status code ${response?.status}`,
                );
            }

            const user = await response.json();
            setUser(user);
            Cookies.set('user', JSON.stringify(user));

            if (lastState) {
                const [, ...stateParam] = lastState.split(':');
                const state = stateParam.join(':');
                onRedirectSuccess?.(state);
            }
        } catch (error) {
            if (lastState) {
                onRedirectFail?.(error);
            }
        }

        Cookies.remove('lastState');
        setIsLoading(false);
    }, [generateServerUrl, mePath, onRedirectSuccess, onRedirectFail]);

    const didAttemptToSetUser = useRef(false);
    useEffect(() => {
        if (isLoading || isAuthenticated || didAttemptToSetUser.current) {
            return;
        }

        // ensures this effect does not run multiple times if we fail to set the user
        didAttemptToSetUser.current = true;

        const userCookie = Cookies.get('user');
        if (userCookie) {
            setUserFromCookie(userCookie);
            return;
        }

        const hasIdToken = Boolean(Cookies.get('app.idt'));
        // the presence of app.idt indicates that we can fetch the user
        if (hasIdToken) {
            fetchUserFromServer();
        }
    }, [isAuthenticated, isLoading, setUserFromCookie, fetchUserFromServer]);

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

function setUpRedirect(state = '') {
    const stateParam = `${generateRandomString()}:${state}`;
    Cookies.set('lastState', stateParam);
    return stateParam;
}

function dec2hex(dec: number) {
    return ('0' + dec.toString(16)).substr(-2);
}

function generateRandomString() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join('');
}
