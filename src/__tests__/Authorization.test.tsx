import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import { Authorization } from '../components/Authorization';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { FusionAuthLogoutButton } from '../components/FusionAuthLogoutButton';

describe('Authorization Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Authorization Component does not render children when no user is present and no role is passed', async () => {
        await renderProvider({});

        expect(screen.queryByText('Logout')).toBeNull();
    });

    test('Authorization Component does not render children when user is not present', async () => {
        await renderProvider({}, 'admin');

        expect(screen.queryByText('Logout')).toBeNull();
    });

    test('Authorization Component renders children when user is present with the correct role', async () => {
        const user = {
            role: 'admin',
        };
        await renderProvider(user, 'admin');

        expect(await screen.findByText('Logout')).toBeInTheDocument();
    });

    test('Authorization Component does not render children when user is present with the incorrect role', async () => {
        const user = {
            role: 'user',
        };
        await renderProvider(user, 'admin');

        expect(screen.queryByText('Logout')).toBeNull();
    });

    test('Authorization Component renders children when user is present and no role is passed', async () => {
        const user = {
            role: 'user',
        };
        await renderProvider(user);

        expect(await screen.findByText('Logout')).toBeInTheDocument();
    });
});

const renderProvider = async (user: Record<string, any>, role?: string) => {
    waitFor(() =>
        render(
            <FusionAuthProvider
                baseUrl="https://sandbox.fusionauth.io"
                clientID="85a03867-dccf-4882-adde-1a79aeec50df"
                scope="openid offline_access"
                redirectUri="http://localhost"
                idTokenHint=""
                user={user}
            >
                <Authorization role={role}>
                    <FusionAuthLogoutButton />
                </Authorization>
            </FusionAuthProvider>,
        ),
    );
};
