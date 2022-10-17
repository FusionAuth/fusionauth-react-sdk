import React, { useCallback, useContext, useMemo } from 'react';
import { TextEncoder } from 'util';

export interface IFusionAuthContext {
    login: (redirectURI: string, state: string) => void;
}

export const FusionAuthContext = React.createContext<IFusionAuthContext>({
    login: () => {},
});

interface Props {
    baseURL: string;
    clientID: string;
    scope: string;
    children: React.ReactNode;
}

export const FusionAuthProvider: React.FC<Props> = ({
    baseURL,
    clientID,
    scope,
    children,
}) => {
    const login = useCallback(
        async (redirectURI: string, state: string) => {
            const fullURL = await generateURL(
                FunctionType.login,
                baseURL,
                clientID,
                scope,
                redirectURI,
                state,
            );
            window.location.assign(fullURL);
        },
        [baseURL, clientID, scope],
    );

    const providerValue = useMemo(
        () => ({
            login,
        }),
        [login],
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

async function generateURL(
    functionType: FunctionType,
    baseURL: string,
    clientID: string,
    scope: string,
    redirectURI: string,
    state: string,
) {
    let fullURL = baseURL;
    fullURL += `/${functionType}?`;
    fullURL += `client_id=${clientID}&`;
    fullURL += `scope=${scope}&`;
    fullURL += `response_type=code&`;
    fullURL += `redirect_uri=${redirectURI}&`;
    fullURL += `code_challenge=${await generatePKCE()}&`;
    fullURL += `code_challenge_method=S256&`;
    fullURL += `state=${generateRandomString()}:${state}`;

    return fullURL;
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
