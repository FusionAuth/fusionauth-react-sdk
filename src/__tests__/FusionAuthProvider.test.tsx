import React from 'react';
import { waitFor, renderHook } from '@testing-library/react';
import {
    FusionAuthProvider,
    useFusionAuth,
} from '../providers/FusionAuthProvider';
import { mockCrypto } from './mocks/mockCrypto';
import { mockFetchJson } from './mocks/mockFetchJson';
import { TEST_CONFIG } from './mocks/testConfig';

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
            <FusionAuthProvider {...TEST_CONFIG}>{children}</FusionAuthProvider>
        );
        const { result } = renderHook(() => useFusionAuth(), {
            wrapper,
        });

        await waitFor(() => result.current.login('state'));

        const expectedUrl =
            'http://localhost:9000/app/login?client_id=85a03867-dccf-4882-adde-1a79aeec50df&scope=openid+offline_access&redirect_uri=http%3A%2F%2Flocalhost&state=00000000000000000000000000000000000000000000000000000000%3Astate';
        await waitFor(() =>
            expect(mockedLocation.assign).toBeCalledWith(expectedUrl),
        );
    });

    test('User set to the value stored in the cookie', () => {
        const trent = { name: 'trent anderson' };
        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: `user=${JSON.stringify(trent)}`,
        });

        const wrapper = ({ children }) => (
            <FusionAuthProvider {...TEST_CONFIG}>{children}</FusionAuthProvider>
        );
        const { result } = renderHook(() => useFusionAuth(), {
            wrapper,
        });

        expect(result.current.user).toEqual(trent);
        expect(result.current.isAuthenticated).toBe(true);
    });

    test('Will fetch the user from the server when the id token cookie is set', async () => {
        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: `app.idt=12345`,
        });

        const user = { name: 'Mr. Userton' };
        const mockResponse = {
            ok: true,
            json: () => Promise.resolve(user),
        } as Response;
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

        const serverUrl = 'my-server.com';
        const mePath = '/my-me-path';

        const { result } = renderHook(() => useFusionAuth(), {
            wrapper: ({ children }) => (
                <FusionAuthProvider
                    {...TEST_CONFIG}
                    serverUrl={serverUrl}
                    mePath={mePath}
                >
                    {children}
                </FusionAuthProvider>
            ),
        });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.user).toEqual({});
        expect(result.current.isAuthenticated).toBe(false);
        expect(fetch).toHaveBeenCalledWith(serverUrl + mePath, {
            credentials: 'include',
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.user).toEqual(user);
            expect(result.current.isAuthenticated).toBe(true);
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    });

    test('User to empty when user cookie is not json parsable', () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: 'user=undefined',
        });

        const wrapper = ({ children }) => (
            <FusionAuthProvider {...TEST_CONFIG}>{children}</FusionAuthProvider>
        );
        const { result } = renderHook(() => useFusionAuth(), {
            wrapper,
        });

        expect(result.current.user).toEqual({});
        expect(result.current.isAuthenticated).toEqual(false);
    });

    test('Logout function will navigate to the correct url', async () => {
        mockFetchJson({});
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        const wrapper = ({ children }) => (
            <FusionAuthProvider {...TEST_CONFIG}>{children}</FusionAuthProvider>
        );
        const { result } = renderHook(() => useFusionAuth(), {
            wrapper,
        });

        await result.current.logout();

        const expectedUrl =
            'http://localhost:9000/app/logout?client_id=85a03867-dccf-4882-adde-1a79aeec50df&post_logout_redirect_uri=http%3A%2F%2Flocalhost';

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
            <FusionAuthProvider {...TEST_CONFIG}>{children}</FusionAuthProvider>
        );
        const { result } = renderHook(() => useFusionAuth(), {
            wrapper,
        });

        await waitFor(() => result.current.register('state'));

        const expectedUrl =
            'http://localhost:9000/app/register?client_id=85a03867-dccf-4882-adde-1a79aeec50df&redirect_uri=http%3A%2F%2Flocalhost&scope=openid+offline_access&state=00000000000000000000000000000000000000000000000000000000%3Astate';
        await waitFor(() =>
            expect(mockedLocation.assign).toBeCalledWith(expectedUrl),
        );
    });

    test.only('Will invoke the onRedirectFail callback only once', async () => {
        Object.defineProperty(document, 'cookie', {
            writable: true,
            // lastState should ensure redirect handlers are called
            value: 'lastState=abc123; app.idt=abc123;',
        });

        const redirectFailHandler = jest.fn();

        const errorResponse = {
            ok: false,
            json: () => Promise.resolve({ message: 'something went wrong' }),
        } as Response;
        jest.spyOn(global, 'fetch').mockResolvedValue(errorResponse);

        renderHook(() => useFusionAuth(), {
            wrapper: ({ children }) => (
                <FusionAuthProvider
                    {...TEST_CONFIG}
                    onRedirectFail={redirectFailHandler}
                >
                    {children}
                </FusionAuthProvider>
            ),
        });

        await waitFor(() => {
            expect(redirectFailHandler).toHaveBeenCalledTimes(1);
            expect(redirectFailHandler).toHaveBeenCalled();
            expect(document.cookie).toContain('lastState=;'); // lastState cookie was removed
        });
    });

    test('Will invoke the onRedirectSuccess callback only once', async () => {
        const stateValue = 'some-value';
        Object.defineProperty(document, 'cookie', {
            writable: true,
            // lastState should ensure redirect handlers are called
            value: `lastState=12345:${stateValue}; app.idt=abc123;`,
        });

        const redirectSuccessHandler = jest.fn();
        const response = {
            ok: true,
            json: () => Promise.resolve({ name: 'Johnny' }),
        } as Response;
        jest.spyOn(global, 'fetch').mockResolvedValue(response);

        renderHook(() => useFusionAuth(), {
            wrapper: ({ children }) => (
                <FusionAuthProvider
                    {...TEST_CONFIG}
                    onRedirectSuccess={redirectSuccessHandler}
                >
                    {children}
                </FusionAuthProvider>
            ),
        });

        await waitFor(() => {
            expect(redirectSuccessHandler).toHaveBeenCalledTimes(1);
            expect(redirectSuccessHandler).toHaveBeenCalledWith(stateValue);
            expect(document.cookie).toContain('lastState=;'); // lastState cookie was removed
        });
    });

    test('Will not invoke onRedirectSuccess when lastState cookie is not set', async () => {
        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: `app.idt=abc123;`,
        });

        const redirectSuccessHandler = jest.fn();
        const alan = { name: 'Alan Turing' };
        const response = {
            ok: true,
            json: () => Promise.resolve(alan),
        } as Response;
        jest.spyOn(global, 'fetch').mockResolvedValue(response);

        const { result } = renderHook(() => useFusionAuth(), {
            wrapper: ({ children }) => (
                <FusionAuthProvider
                    {...TEST_CONFIG}
                    onRedirectSuccess={redirectSuccessHandler}
                >
                    {children}
                </FusionAuthProvider>
            ),
        });

        await waitFor(() => {
            expect(result.current.user.name).toBe('Alan Turing'); // user was fetched successfully without invoking redirect handler
            expect(redirectSuccessHandler).not.toHaveBeenCalled();
        });
    });
});
