import React, { useCallback, useContext, useMemo } from 'react';
import { TextEncoder } from 'util';

export interface IFusionAuthContext {
    login: (state: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const FusionAuthContext = React.createContext<IFusionAuthContext>({
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
});

interface Props {
    baseUrl: string;
    clientID: string;
    scope: string;
    redirectUri: string;
    idTokenHint?: string;
    children?: React.ReactNode;
}

export const FusionAuthProvider: React.FC<Props> = ({
    baseUrl,
    clientID,
    scope,
    redirectUri,
    idTokenHint,
    children,
}) => {
    const login = useCallback(
        async (state = '') => {
            const fullUrl = await generateUrl(
                FunctionType.login,
                baseUrl,
                clientID,
                redirectUri,
                scope,
                state,
            );
            window.location.assign(fullUrl);
        },
        [baseUrl, clientID, scope, redirectUri],
    );

    const logout = useCallback(async () => {
        const fullUrl = await generateUrl(
            FunctionType.logout,
            baseUrl,
            clientID,
            redirectUri,
            '',
            '',
            idTokenHint,
        );
        window.location.assign(fullUrl);
    }, [baseUrl, clientID, redirectUri, idTokenHint]);

    const providerValue = useMemo(
        () => ({
            login,
            logout,
        }),
        [login, logout],
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

async function generateUrl(
    functionType: FunctionType,
    baseUrl: string,
    clientID: string,
    redirectUri: string,
    scope: string,
    state = '',
    idTokenHint = '',
) {
    let queryString: URLSearchParams;
    if (
        functionType == FunctionType.login ||
        functionType == FunctionType.register
    ) {
        queryString = new URLSearchParams({
            client_id: clientID,
            scope: scope,
            response_type: 'code',
            redirect_uri: redirectUri,
            code_challenge: await generatePKCE(),
            code_challenge_method: 'S256',
            state: `${generateRandomString()}:${state}`,
        });
    } else {
        queryString = new URLSearchParams({
            client_id: clientID,
            post_logout_redirect_uri: redirectUri,
            id_token_hint: idTokenHint,
        });
    }

    return `${baseUrl}/${functionType}?${queryString}`;
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
    return Array.from(array, dec2hex).join('');
}
