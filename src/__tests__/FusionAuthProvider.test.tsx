import React from 'react';
import { waitFor, renderHook } from '@testing-library/react';
import {
    FusionAuthProvider,
    useFusionAuthContext,
} from '../providers/FusionAuthProvider';
import { mockCrypto } from './mocks/mockCrypto';

let location: Location;

describe('FusionAuthProvider', () => {
    beforeEach(() => {
        location = window.location;
        jest.spyOn(window, 'location', 'get').mockRestore();

        mockCrypto();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Login function will navigate to the correct url', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        const wrapper = ({ children }) => (
            <FusionAuthProvider
                baseUrl="https://woodridge-theme.fusionauth.io/oauth2"
                clientID="17cafba1-c0c1-430a-bfe8-3ed438df9fc0"
                scope="openid offline_access"
                redirectUri="http://localhost"
            >
                {children}
            </FusionAuthProvider>
        );
        const { result } = renderHook(() => useFusionAuthContext(), {
            wrapper,
        });

        expect(typeof result.current.login).toBe('function');

        await result.current.login('');

        const expectedUrl =
            'https://woodridge-theme.fusionauth.io/oauth2/authorize?client_id=17cafba1-c0c1-430a-bfe8-3ed438df9fc0&scope=openid+offline_access&response_type=code&redirect_uri=http%3A%2F%2Flocalhost&code_challenge=vQOsFCjw6ob0uDpzH_x5Z7uChm2FRTIviI0vboV__Bg&code_challenge_method=S256&state=00000000000000000000000000000000000000000000000000000000%3Astate';
        await waitFor(() =>
            expect(mockedLocation.assign).toBeCalledWith(expectedUrl),
        );
    });
});