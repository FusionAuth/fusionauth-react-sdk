var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useCallback, useContext, useEffect, useMemo, useState, } from 'react';
import { TextEncoder } from 'util';
import axios from 'axios';
import Cookies from 'js-cookie';
export const FusionAuthContext = React.createContext({
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    register: () => Promise.resolve(),
    user: {},
});
export const FusionAuthProvider = ({ config, children }) => {
    const [user, setUser] = useState({});
    const generateUrl = useCallback((functionType, queryParams) => {
        const query = new URLSearchParams(queryParams);
        return `${config.baseUrl}/oauth2/${functionType}?${query}`;
    }, [config]);
    const login = useCallback((state = '') => __awaiter(void 0, void 0, void 0, function* () {
        const stateParam = `${generateRandomString()}:${state}`;
        Cookies.set('lastState', stateParam);
        const queryParams = {
            client_id: config.clientID,
            scope: config.scope,
            response_type: 'code',
            redirect_uri: config.redirectUri,
            code_challenge: yield generatePKCE(),
            code_challenge_method: 'S256',
            state: stateParam,
        };
        const fullUrl = generateUrl(FunctionType.login, queryParams);
        window.location.assign(fullUrl);
    }), [config, generateUrl]);
    const logout = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const queryParams = {
            client_id: config.clientID,
            post_logout_redirect_uri: config.redirectUri,
            id_token_hint: (_a = config.idTokenHint) !== null && _a !== void 0 ? _a : '',
        };
        const fullUrl = generateUrl(FunctionType.logout, queryParams);
        window.location.assign(fullUrl);
    }), [config, generateUrl]);
    const register = useCallback((state = '') => __awaiter(void 0, void 0, void 0, function* () {
        const stateParam = `${generateRandomString()}:${state}`;
        Cookies.set('lastState', stateParam);
        const queryParams = {
            client_id: config.clientID,
            scope: config.scope,
            response_type: 'code',
            redirect_uri: config.redirectUri,
            code_challenge: yield generatePKCE(),
            code_challenge_method: 'S256',
            state: stateParam,
        };
        const fullUrl = generateUrl(FunctionType.register, queryParams);
        window.location.assign(fullUrl);
    }), [config, generateUrl]);
    useEffect(() => {
        try {
            const lastState = Cookies.get('lastState');
            if (hasAuthParams() && lastState !== null) {
                const urlParams = new URLSearchParams(window.location.search);
                if (lastState === urlParams.get('state')) {
                    axios
                        .post(`${config.serverUrl}/token-exchange`, {
                        client_id: urlParams.get('client_id'),
                        code: urlParams.get('code'),
                    })
                        .then(response => {
                        setUser(response.data.user);
                    });
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }, [config]);
    const providerValue = useMemo(() => ({
        login,
        logout,
        register,
        user,
    }), [login, logout, register, user]);
    return (React.createElement(FusionAuthContext.Provider, { value: providerValue }, children));
};
export const useFusionAuthContext = () => useContext(FusionAuthContext);
var FunctionType;
(function (FunctionType) {
    FunctionType["login"] = "authorize";
    FunctionType["logout"] = "logout";
    FunctionType["register"] = "register";
})(FunctionType || (FunctionType = {}));
function dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2);
}
function generatePKCE() {
    return __awaiter(this, void 0, void 0, function* () {
        const code_verifier = generateRandomString();
        const encoder = new TextEncoder();
        const data = encoder.encode(code_verifier);
        const sha256 = yield window.crypto.subtle.digest('SHA-256', data);
        let str = '';
        const bytes = new Uint8Array(sha256);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    });
}
function generateRandomString() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    const string = Array.from(array, dec2hex).join('');
    return string;
}
function hasAuthParams() {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    return code !== null || state !== null || error !== null;
}
//# sourceMappingURL=FusionAuthProvider.js.map