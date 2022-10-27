import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { FusionAuthLogoutButton } from '../components/FusionAuthLogoutButton';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { mockUseFusionAuthContext } from './mocks/mockUseFusionAuthContext';
import {
    baseUrl,
    redirectUri,
    scope,
    clientID,
    serverUrl,
    idTokenHint,
} from './mocks/testConfiguration';

describe('FusionAuthLogoutButton', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Logout buttons renders the correct text', async () => {
        await renderProvider();
        expect(await screen.findByText('Logout')).toBeInTheDocument();
    });

    test('Logout button will call the useFusionAuthContext hook', async () => {
        const logout = jest.fn();
        mockUseFusionAuthContext({ logout });

        await renderProvider();

        await fireEvent.click(screen.getByText('Logout'));

        expect(logout).toBeCalledWith();
    });
});

const renderProvider = async () => {
    waitFor(() =>
        render(
            <FusionAuthProvider
                baseUrl={baseUrl}
                clientID={clientID}
                serverUrl={serverUrl}
                scope={scope}
                redirectUri={redirectUri}
                idTokenHint={idTokenHint}
            >
                <FusionAuthLogoutButton />
            </FusionAuthProvider>,
        ),
    );
};
