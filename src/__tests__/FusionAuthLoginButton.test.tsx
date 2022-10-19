import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { FusionAuthLoginButton } from '../components/FusionAuthLoginButton';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { mockUseFusionAuthContext } from './mocks/mockUseFusionAuthContext';

describe('FusionAuthLoginButton', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Login buttons renders the correct text', async () => {
        await renderProvider();
        expect(await screen.findByText('Login')).toBeInTheDocument();
    });

    test('Login button will call the useFusionAuthContext hook', async () => {
        const login = jest.fn();
        mockUseFusionAuthContext({ login });

        await renderProvider();

        await fireEvent.click(screen.getByText('Login'));

        expect(login).toBeCalledWith('state');
    });
});

const renderProvider = async () => {
    waitFor(() =>
        render(
            <FusionAuthProvider
                baseUrl="https://woodridge-theme.fusionauth.io/oauth2"
                clientID="17cafba1-c0c1-430a-bfe8-3ed438df9fc0"
                scope="openid offline_access"
                redirectUri="http://localhost"
            >
                <FusionAuthLoginButton state="state" />
            </FusionAuthProvider>,
        ),
    );
};
