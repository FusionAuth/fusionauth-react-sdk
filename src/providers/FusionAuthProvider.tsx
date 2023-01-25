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

    loginPath?: string;
    logoutPath?: string;
    registerPath?: string;
    tokenRefreshPath?: string;
    mePath?: string;
}

export const FusionAuthProvider: React.FC<FusionAuthConfig> = props => {
    const { children } = props;

    const [isAuthenticated, setIsAuthenticated] = useState(
        () => !!Cookies.get('access_token_expires'), // TODO - look at idToken?
    );
    const [isLoading, setIsLoading] = useState(false);

    const [user, setUser] = useState<Record<string, any>>({});

    const generateOauthUrl = useCallback(
        (
            oauthFunctionType: OauthFunctionType,
            queryParams?: Record<string, string>,
        ) => {
            const query = new URLSearchParams(queryParams);
            const queryString = query.toString().length > 0 ? `?${query}` : '';

            return `${props.baseUrl}/oauth2/${oauthFunctionType}${queryString}`;
        },
        [props.baseUrl],
    );

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
            // TODO use mapping config
            return `${props.serverUrl}${path}${queryString}`;
        },
        [props.serverUrl],
    );

    const login = useCallback(
        async (state = '') => {
            // const stateParam = `${generateRandomString()}:${state}`;
            // Cookies.set('lastState', stateParam);
            const fullUrl = generateServerUrl(
                ServerFunctionType.login,
                props?.loginPath,
                { client_id: props.clientID },
            );
            window.location.assign(fullUrl);
        },
        [generateOauthUrl, props.clientID, props.redirectUri, props?.scope], // TODO be accurate
    );

    const logout = useCallback(async () => {
        // Clear cookies
        Cookies.remove('user');
        Cookies.remove('lastState');

        fetch(generateServerUrl(ServerFunctionType.logout, props?.logoutPath), {
            credentials: 'include',
        }).then(() => {
            const queryParams = {
                client_id: props.clientID,
                post_logout_redirect_uri: props.redirectUri,
                id_token_hint: props.idTokenHint ?? '',
            };
            const fullUrl = generateOauthUrl(
                OauthFunctionType.logout,
                queryParams,
            );
            window.location.assign(fullUrl);
        });
    }, [
        generateOauthUrl,
        props.clientID,
        props.idTokenHint,
        props.redirectUri,
        props.serverUrl,
    ]);

    const register = useCallback(
        async (state = '') => {
            // const stateParam = `${generateRandomString()}:${state}`;
            // Cookies.set('lastState', stateParam);
            const fullUrl = generateServerUrl(
                ServerFunctionType.register,
                props?.registerPath,
                { client_id: props.clientID },
            );
            window.location.assign(fullUrl);
        },
        [generateOauthUrl, props.clientID, props.redirectUri, props.scope], // TODO be accurate
    );

    useEffect(() => {
        const userCookie = Cookies.get('user');
        if (userCookie) {
            try {
                setUser(JSON.parse(userCookie));
            } catch {
                // ignore errors
            }
        }
    }, [setUser]);

    const refreshToken = async () => {
        const accessTokenExpires = Cookies.get('access_token_expires');
        if (
            accessTokenExpires === undefined ||
            Number(accessTokenExpires) < Date.now() + 60000
        ) {
            // TODO use constant
            await fetch(
                generateServerUrl(
                    ServerFunctionType.tokenRefresh,
                    props?.tokenRefreshPath,
                ),
                {
                    method: 'POST',
                    credentials: 'include',
                },
            );
        }
    }; // TODO - keep value in props?

    // TODO - keep this logic in useLayoutEffect()?
    useLayoutEffect(() => {
        console.log('in useLayoutEffect');
        // TODO - get info from url location?  cookies?  how about user info?
        const lastState = Cookies.get('lastState');

        console.log(
            `access_token_expires is ${Cookies.get('access_token_expires')}`,
        );
        console.log(`user is ${Cookies.get('user')}`);
        // TODO - difference between this and isAuthenticated?  check for id_token?

        // if (hasAuthParams() && lastState !== undefined && lastState !== null) {
        if (Cookies.get('access_token_expires') && !Cookies.get('user')) {
            console.log('in useLayoutEffect()  getting user....');

            const urlParams = new URLSearchParams(window.location.search);
            setIsAuthenticated(true);
            setIsLoading(false);

            fetch(generateServerUrl(ServerFunctionType.me, props?.mePath), {
                credentials: 'include',
            })
                .then(response => response.json())
                .then(user => {
                    Cookies.set('user', JSON.stringify(user));
                    setUser(user);
                    setIsAuthenticated(true);

                    // const [, ...stateParam] = lastState.split(':');
                    // const state = stateParam.join(':');
                    // props.onRedirectSuccess?.(state);
                })
                .catch(error => {
                    props.onRedirectFail?.(error);
                })
                .finally(() => setIsLoading(false));
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

enum OauthFunctionType {
    login = 'authorize',
    logout = 'logout',
    register = 'register',
}

enum ServerFunctionType {
    login = 'login',
    logout = 'logout',
    register = 'register',
    tokenRefresh = 'token-refresh',
    me = 'me',
}

function hasAuthParams(): boolean {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const userState = searchParams.get('userState'); // TODO keep?
    const error = searchParams.get('error');
    return (
        code !== null || state !== null || userState !== null || error !== null
    );
}
