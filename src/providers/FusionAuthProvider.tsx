import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { TextEncoder } from 'util';
import axios from 'axios';

export interface IFusionAuthContext {
    login: (state: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (state: string) => Promise<void>;
    user: Record<string, any>;
}

export const FusionAuthContext = React.createContext<IFusionAuthContext>({
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    register: () => Promise.resolve(),
    user: {},
});

interface Props {
    baseUrl: string;
    clientID: string;
    serverUrl: string;
    scope: string;
    redirectUri: string;
    idTokenHint?: string;
    children?: React.ReactNode;
}

export const FusionAuthProvider: React.FC<Props> = ({
    baseUrl,
    clientID,
    serverUrl,
    scope,
    redirectUri,
    idTokenHint,
    children,
}) => {
    const [user, setUser] = useState<Record<string, any>>({});

    const generateUrl = useCallback(
        (functionType: FunctionType, queryParams: Record<string, string>) => {
            const query = new URLSearchParams(queryParams);

            return `${baseUrl}/oauth2/${functionType}?${query}`;
        },
        [baseUrl],
    );

    const login = useCallback(
        async (state = '') => {
            const queryParams = {
                client_id: clientID,
                scope: scope,
                response_type: 'code',
                redirect_uri: redirectUri,
                code_challenge: await generatePKCE(),
                code_challenge_method: 'S256',
                state: `${generateRandomString()}:${state}`,
            };
            const fullUrl = generateUrl(FunctionType.login, queryParams);
            window.location.assign(fullUrl);
        },
        [clientID, scope, redirectUri, generateUrl],
    );

    const logout = useCallback(async () => {
        const queryParams = {
            client_id: clientID,
            post_logout_redirect_uri: redirectUri,
            id_token_hint: idTokenHint ?? '',
        };
        const fullUrl = generateUrl(FunctionType.logout, queryParams);
        window.location.assign(fullUrl);
    }, [clientID, redirectUri, idTokenHint, generateUrl]);

    const register = useCallback(
        async (state = '') => {
            const queryParams = {
                client_id: clientID,
                scope: scope,
                response_type: 'code',
                redirect_uri: redirectUri,
                code_challenge: await generatePKCE(),
                code_challenge_method: 'S256',
                state: `${generateRandomString()}:${state}`,
            };
            const fullUrl = generateUrl(FunctionType.register, queryParams);
            window.location.assign(fullUrl);
        },
        [clientID, scope, redirectUri, generateUrl],
    );

    useEffect(() => {
        try {
            if (hasAuthParams()) {
                const urlParams = window.location.search;
                const queryParams = urlParams.split('&');
                const parsedQuery: Record<string, any> = {};
                queryParams.forEach(qp => {
                    const [key, val] = qp.split('=');
                    parsedQuery[key] = decodeURIComponent(val);
                });

                axios
                    .post(serverUrl, { client_id: parsedQuery.client_id })
                    .then(response => {
                        setUser(response.data.user);
                    });
            }
        } catch (error) {
            console.log(error);
        }
    }, [serverUrl]);

    const providerValue = useMemo(
        () => ({
            login,
            logout,
            register,
            user,
        }),
        [login, logout, register, user],
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

    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateRandomString() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    const string = Array.from(array, dec2hex).join('');
    return string;
}

function hasAuthParams(): boolean {
    return (
        (/[?&]code=[^&]+/.test(window.location.search) ||
            /[?&]state=[^&]+/.test(window.location.search)) &&
        /[?&]error=[^&]+/.test(window.location.search)
    );
}
