import React from 'react';
import { waitFor, renderHook, act } from '@testing-library/react';
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
                baseUrl="https://sandbox.fusionauth.io"
                clientID="85a03867-dccf-4882-adde-1a79aeec50df"
                serverUrl=""
                scope="openid offline_access"
                redirectUri="http://localhost"
                idTokenHint=""
            >
                {children}
            </FusionAuthProvider>
        );
        const { result } = renderHook(() => useFusionAuthContext(), {
            wrapper,
        });

        await waitFor(() =>
            act(() => {
                result.current.login('state');
            }),
        );

        const expectedUrl =
            'https://sandbox.fusionauth.io/oauth2/authorize?client_id=85a03867-dccf-4882-adde-1a79aeec50df&scope=openid+offline_access&response_type=code&redirect_uri=http%3A%2F%2Flocalhost&code_challenge=vQOsFCjw6ob0uDpzH_x5Z7uChm2FRTIviI0vboV__Bg&code_challenge_method=S256&state=00000000000000000000000000000000000000000000000000000000%3Astate';
        await waitFor(() =>
            expect(mockedLocation.assign).toBeCalledWith(expectedUrl),
        );
    });

    test('Logout function will navigate to the correct url', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        const wrapper = ({ children }) => (
            <FusionAuthProvider
                baseUrl="https://sandbox.fusionauth.io"
                clientID="85a03867-dccf-4882-adde-1a79aeec50df"
                serverUrl=""
                scope=""
                redirectUri="http://localhost"
                idTokenHint="token_hint"
            >
                {children}
            </FusionAuthProvider>
        );
        const { result } = renderHook(() => useFusionAuthContext(), {
            wrapper,
        });

        await result.current.logout();

        const expectedUrl =
            'https://sandbox.fusionauth.io/oauth2/logout?client_id=85a03867-dccf-4882-adde-1a79aeec50df&post_logout_redirect_uri=http%3A%2F%2Flocalhost&id_token_hint=token_hint';
        await waitFor(() =>
            expect(mockedLocation.assign).toBeCalledWith(expectedUrl),
        );
    });

    test('Register function will navigate to the correct url', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        const wrapper = ({ children }) => (
            <FusionAuthProvider
                baseUrl="https://sandbox.fusionauth.io"
                clientID="85a03867-dccf-4882-adde-1a79aeec50df"
                serverUrl=""
                scope="openid offline_access"
                redirectUri="http://localhost"
                idTokenHint=""
            >
                {children}
            </FusionAuthProvider>
        );
        const { result } = renderHook(() => useFusionAuthContext(), {
            wrapper,
        });

        await waitFor(() =>
            act(() => {
                result.current.register('state');
            }),
        );

        const expectedUrl =
            'https://sandbox.fusionauth.io/oauth2/register?client_id=85a03867-dccf-4882-adde-1a79aeec50df&scope=openid+offline_access&response_type=code&redirect_uri=http%3A%2F%2Flocalhost&code_challenge=vQOsFCjw6ob0uDpzH_x5Z7uChm2FRTIviI0vboV__Bg&code_challenge_method=S256&state=00000000000000000000000000000000000000000000000000000000%3Astate';
        await waitFor(() =>
            expect(mockedLocation.assign).toBeCalledWith(expectedUrl),
        );
    });
});
