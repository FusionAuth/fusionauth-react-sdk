import React from 'react';
import { screen, render, waitFor, act } from '@testing-library/react';
import { RequireAuth } from '../components/RequireAuth';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { FusionAuthLogoutButton } from '../components/FusionAuthLogoutButton';
import {
    TEST_REDIRECT_URL,
    TEST_CONFIG,
    TEST_COOKIE,
} from './mocks/testConfig';
import { mockCrypto } from './mocks/mockCrypto';
import { mockFetchJson } from './mocks/mockFetchJson';

let location: Location;
describe('RequireAuth Component', () => {
    beforeEach(() => {
        location = window.location;
        jest.spyOn(window, 'location', 'get').mockRestore();

        mockCrypto();
        mockFetchJson({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('RequireAuth Component does not render children when no user is present and no role is passed', async () => {
        await renderProvider();

        expect(await screen.queryByText('Logout')).toBeNull();
    });

    test('RequireAuth Component does not render children when user is not present', async () => {
        await renderProvider('admin');

        expect(await screen.queryByText('Logout')).toBeNull();
    });

    test('RequireAuth Component renders children when user is present with the correct role', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
            search: TEST_REDIRECT_URL,
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);
        mockFetchJson({ roles: ['admin'] });

        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: TEST_COOKIE,
        });

        await act(() => {
            renderProvider('admin');
        });

        // expect(await screen.queryByText('Logout')).toBeNull();
        expect(await screen.findByText('Logout')).toBeInTheDocument();
    });

    test('RequireAuth Component does not render children when user is present with the incorrect role', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
            search: TEST_REDIRECT_URL,
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);
        mockFetchJson({ roles: ['user'] });

        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: TEST_COOKIE,
        });

        await act(() => {
            renderProvider('admin');
        });

        expect(await screen.queryByText('Logout')).toBeNull();
    });

    test('RequireAuth Component renders children when user is present and no role is passed', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
            search: TEST_REDIRECT_URL,
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);
        mockFetchJson({ roles: ['admin'] });

        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: TEST_COOKIE,
        });

        await renderProvider();

        expect(await screen.findByText('Logout')).toBeInTheDocument();
    });

    test('RequireAuth Component does not render children when CSRF check fails', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
            search: TEST_REDIRECT_URL,
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);
        mockFetchJson({ roles: ['admin'] });

        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: 'lastState=1111; ',
        });

        await renderProvider();

        expect(await screen.queryByText('Logout')).toBeNull();
    });
});

const renderProvider = (role?: string) => {
    return waitFor(() =>
        render(
            <FusionAuthProvider {...TEST_CONFIG}>
                <RequireAuth withRole={role}>
                    <FusionAuthLogoutButton />
                </RequireAuth>
            </FusionAuthProvider>,
        ),
    );
};
