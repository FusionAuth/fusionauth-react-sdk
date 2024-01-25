import React, { ReactNode } from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import { RequireAuth } from '../components/RequireAuth';
import {
    FusionAuthContext,
    FusionAuthProvider,
    IFusionAuthContext,
} from '../providers/FusionAuthProvider';
import { FusionAuthLogoutButton } from '../components/FusionAuthLogoutButton';
import { TEST_REDIRECT_URL, TEST_CONFIG } from './mocks/testConfig';
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

    test('RequireAuth Component does not render children when no user is present and no role is passed', () => {
        renderWithContext({
            context: {
                isAuthenticated: false,
                user: {},
            },
            content: (
                <RequireAuth withRole={undefined}>
                    <h1>Hello</h1>
                </RequireAuth>
            ),
        });
        expect(screen.queryByText('Hello')).toBeNull();
    });

    test('RequireAuth Component does not render children when user is not present', () => {
        renderWithContext({
            context: {
                user: {},
            },
            content: (
                <RequireAuth withRole={'admin'}>
                    <h1>Hello</h1>
                </RequireAuth>
            ),
        });
        expect(screen.queryByText('Hello')).toBeNull();
    });

    test('RequireAuth Component renders children when user is present with one of the roles', () => {
        const protectedContent = 'Hello world';

        renderWithContext({
            context: {
                user: {
                    roles: ['admin', 'super-admin'],
                },
            },
            content: (
                <RequireAuth withRole={'admin'}>
                    <h1>{protectedContent}</h1>
                </RequireAuth>
            ),
        });

        expect(screen.queryByText(protectedContent)).toBeInTheDocument();
    });

    test('RequireAuth Component does not render children when user is present with the incorrect role', async () => {
        const protectedContent = 'Only for admins';

        renderWithContext({
            context: {
                user: {
                    roles: ['non-admin'],
                },
            },
            content: (
                <RequireAuth withRole={'admin'}>
                    <h1>{protectedContent}</h1>
                </RequireAuth>
            ),
        });

        expect(screen.queryByText(protectedContent)).toBeNull();
    });

    test('RequireAuth Component renders children when user is present and no role is passed', () => {
        renderWithContext({
            context: {
                isAuthenticated: true,
                user: {
                    roles: ['non-admin'],
                },
            },
            content: (
                <RequireAuth withRole={undefined}>
                    <h1>Hello</h1>
                </RequireAuth>
            ),
        });

        expect(screen.queryByText('Hello')).toBeInTheDocument();
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

const renderWithContext = ({
    context,
    content,
}: {
    context: Partial<IFusionAuthContext>;
    content: ReactNode;
}) => {
    // mock fusion auth context
    const providerValue: IFusionAuthContext = {
        login: () => Promise.resolve(),
        logout: () => Promise.resolve(),
        register: () => Promise.resolve(),
        user: {},
        isLoading: false,
        isAuthenticated: true,
        refreshToken: () => Promise.resolve(),
        ...context,
    };

    return render(
        <FusionAuthContext.Provider value={providerValue}>
            {content}
        </FusionAuthContext.Provider>,
    );
};
