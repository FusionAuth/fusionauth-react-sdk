import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { FusionAuthRegisterButton } from '../components/FusionAuthRegisterButton';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { mockUseFusionAuthContext } from './mocks/mockUseFusionAuthContext';
import { TEST_CONFIG } from './mocks/testConfig';

describe('FusionAuthRegisterButton', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Register buttons renders the correct text', async () => {
        await renderProvider();
        expect(await screen.findByText('Register Now')).toBeInTheDocument();
    });

    test('Register button will call the useFusionAuthContext hook', async () => {
        const register = jest.fn();
        mockUseFusionAuthContext({ register });

        await renderProvider();

        fireEvent.click(screen.getByText('Register Now'));

        expect(register).toBeCalledWith('state');
    });
});

const renderProvider = () => {
    return waitFor(() =>
        render(
            <FusionAuthProvider {...TEST_CONFIG}>
                <FusionAuthRegisterButton state="state" />
            </FusionAuthProvider>,
        ),
    );
};
