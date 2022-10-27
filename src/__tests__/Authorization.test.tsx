import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import { Authorization } from '../components/Authorization';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { FusionAuthLogoutButton } from '../components/FusionAuthLogoutButton';
import axios from 'axios';
import {
    TEST_REDIRECT_URL,
    TEST_CONFIGURATION,
} from './mocks/testConfiguration';

let location: Location;
describe('Authorization Component', () => {
    beforeEach(() => {
        location = window.location;
        jest.spyOn(window, 'location', 'get').mockRestore();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Authorization Component does not render children when no user is present and no role is passed', async () => {
        await renderProvider();

        expect(screen.queryByText('Logout')).toBeNull();
    });

    test('Authorization Component does not render children when user is not present', async () => {
        await renderProvider('admin');

        expect(screen.queryByText('Logout')).toBeNull();
    });

    test('Authorization Component renders children when user is present with the correct role', async () => {
        const mockedLocation = {
            ...location,
            search: TEST_REDIRECT_URL,
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        jest.spyOn(axios, 'post').mockResolvedValue({
            data: { user: { role: 'admin' } },
        });

        await renderProvider('admin');

        expect(await screen.findByText('Logout')).toBeInTheDocument();
    });

    test('Authorization Component does not render children when user is present with the incorrect role', async () => {
        const mockedLocation = {
            ...location,
            search: TEST_REDIRECT_URL,
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        jest.spyOn(axios, 'post').mockResolvedValue({
            data: { user: { role: 'user' } },
        });

        await renderProvider('admin');

        expect(screen.queryByText('Logout')).toBeNull();
    });

    test('Authorization Component renders children when user is present and no role is passed', async () => {
        const mockedLocation = {
            ...location,
            search: TEST_REDIRECT_URL,
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        jest.spyOn(axios, 'post').mockResolvedValue({
            data: { user: { role: 'admin' } },
        });

        await renderProvider();

        expect(await screen.findByText('Logout')).toBeInTheDocument();
    });
});

const renderProvider = async (role?: string) => {
    waitFor(() =>
        render(
            <FusionAuthProvider configuration={TEST_CONFIGURATION}>
                <Authorization authorizedRole={role}>
                    <FusionAuthLogoutButton />
                </Authorization>
            </FusionAuthProvider>,
        ),
    );
};
