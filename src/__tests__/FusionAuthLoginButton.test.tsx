import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { FusionAuthLoginButton } from '../components/FusionAuthLoginButton';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { mockUseFusionAuthContext } from './mocks/mockUseFusionAuthContext';
import { TEST_CONFIG } from './mocks/testConfig';

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
            <FusionAuthProvider config={TEST_CONFIG}>
                <FusionAuthLoginButton state="state" />
            </FusionAuthProvider>,
        ),
    );
};
