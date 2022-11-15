import React from 'react';
export interface IFusionAuthContext {
    login: (state: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (state: string) => Promise<void>;
    user: Record<string, any>;
}
export declare const FusionAuthContext: React.Context<IFusionAuthContext>;
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
export declare const FusionAuthProvider: React.FC<Props>;
export declare const useFusionAuthContext: () => IFusionAuthContext;
export {};
