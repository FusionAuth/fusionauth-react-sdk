import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { FusionAuthLoginButton } from '../components/FusionAuthLoginButton';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { mockUseFusionAuth } from './mocks/mockUseFusionAuth';
import { TEST_CONFIG } from './mocks/testConfig';

describe('FusionAuthLoginButton', () => {
    test('Login button will call the useFusionAuth hook', () => {
        const login = jest.fn();
        mockUseFusionAuth({ login });

        const stateValue = 'state-value-for-login';
        render(
            <FusionAuthProvider {...TEST_CONFIG}>
                <FusionAuthLoginButton state={stateValue} />
            </FusionAuthProvider>,
        );

        fireEvent.click(screen.getByText('Login'));
        expect(login).toHaveBeenCalledWith(stateValue);
    });
});
