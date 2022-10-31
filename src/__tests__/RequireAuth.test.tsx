import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import { RequireAuth } from '../components/RequireAuth';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { FusionAuthLogoutButton } from '../components/FusionAuthLogoutButton';
import axios from 'axios';
import { TEST_REDIRECT_URL, TEST_CONFIG } from './mocks/testConfiguration';
import { mockCrypto } from './mocks/mockCrypto';

let location: Location;
describe('RequireAuth Component', () => {
    beforeEach(() => {
        location = window.location;
        jest.spyOn(window, 'location', 'get').mockRestore();

        mockCrypto();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('RequireAuth Component does not render children when no user is present and no role is passed', async () => {
        await renderProvider();

        expect(screen.queryByText('Logout')).toBeNull();
    });

    test('RequireAuth Component does not render children when user is not present', async () => {
        await renderProvider('admin');

        expect(screen.queryByText('Logout')).toBeNull();
    });

    test('RequireAuth Component renders children when user is present with the correct role', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
            search: TEST_REDIRECT_URL,
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        jest.spyOn(axios, 'post').mockResolvedValue({
            data: { user: { role: 'admin' } },
        });

        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: 'lastState=00000000000000000000000000000000000000000000000000000000; ',
        });

        await renderProvider('admin');

        expect(await screen.findByText('Logout')).toBeInTheDocument();
    });

    test('RequireAuth Component does not render children when user is present with the incorrect role', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
            search: TEST_REDIRECT_URL,
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        jest.spyOn(axios, 'post').mockResolvedValue({
            data: { user: { role: 'user' } },
        });

        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: 'lastState=00000000000000000000000000000000000000000000000000000000; ',
        });

        await renderProvider('admin');

        expect(screen.queryByText('Logout')).toBeNull();
    });

    test('RequireAuth Component renders children when user is present and no role is passed', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
            search: TEST_REDIRECT_URL,
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        jest.spyOn(axios, 'post').mockResolvedValue({
            data: { user: { role: 'admin' } },
        });

        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: 'lastState=00000000000000000000000000000000000000000000000000000000; ',
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

        jest.spyOn(axios, 'post').mockResolvedValue({
            data: { user: { role: 'admin' } },
        });

        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: 'lastState=1111; ',
        });

        await renderProvider();

        expect(screen.queryByText('Logout')).toBeNull();
    });
});

const renderProvider = async (role?: string) => {
    waitFor(() =>
        render(
            <FusionAuthProvider config={TEST_CONFIG}>
                <RequireAuth withRole={role}>
                    <FusionAuthLogoutButton />
                </RequireAuth>
            </FusionAuthProvider>,
        ),
    );
};
