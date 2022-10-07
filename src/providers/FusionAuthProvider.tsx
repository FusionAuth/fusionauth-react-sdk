import React, { useCallback, useContext, useMemo, useState } from "react";

export interface IFusionAuthContext {
    baseURL: string;
    clientID: string;
    scope: string;
}

export const FusionAuthContext = React.createContext<IFusionAuthContext>({
    baseURL: "https://sandbox.fusionauth.io/oauth2",
    clientID: "85a03867-dccf-4882-adde-1a79aeec50df",
    scope: "openid offline_access"
});

export const FusionAuthProvider: React.FC = (props, children) => {

    const [baseURL, setBaseURL] = useState("");
    const [clientID, setClientID] = useState("");
    const [scope, setScope] = useState("");

    const login = useCallback((redirectURI: string) => {
        const fullURL = generateURL(FunctionType.login, baseURL, clientID, scope, redirectURI)
    }, []);
    
    const providerValue = useMemo(
        () => ({
            login: login,
        }),
        [],
    );

    return <FusionAuthContext.Provider value={providerValue}>{children}</FusionAuthContext.Provider>;
};

export const useFusionAuthContext = useContext(FusionAuthContext);

enum FunctionType {
    login = "authorize",
    logout = "logout",
    register = "register"
}

function generateURL(functionType: FunctionType, baseURL: string, clientID: string, scope: string, redirectURI: string) {
    let fullURL = baseURL
    fullURL += `/${functionType}?`
    fullURL += `client_id=${clientID}&`
    fullURL += `scope=${scope}&`
    fullURL += `response_type=code&`
    fullURL += `redirect_url=${redirectURI}&`
    fullURL += `code_challenge=${generatePKCE()}&`
    fullURL += `code_challenge_method=S256&`
    fullURL += `state=${state}`

    return fullURL
}

function dec2hex(dec: number) {
    return ('0' + dec.toString(16)).substr(-2)
}

async function generatePKCE() {
    const array = new Uint32Array(56/2);
    window.crypto.getRandomValues(array);
    const code_verifier = Array.from(array, dec2hex).join('');

    const encoder = new TextEncoder();
    const data = encoder.encode(code_verifier);
    const sha256 = await window.crypto.subtle.digest('SHA-256', data);

    let str = "";
    const bytes = new Uint8Array(sha256);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        str += String.fromCharCode(bytes[i]);
    }

    return btoa(str)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}