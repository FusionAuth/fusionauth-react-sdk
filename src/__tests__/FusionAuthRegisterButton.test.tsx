import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { FusionAuthRegisterButton } from '../components/FusionAuthRegisterButton';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { mockUseFusionAuth } from './mocks/mockUseFusionAuth';
import { TEST_CONFIG } from './mocks/testConfig';

describe('FusionAuthRegisterButton', () => {
    test('Register button will call the useFusionAuth hook', async () => {
        const register = jest.fn();
        mockUseFusionAuth({ register });

        const stateValue = 'state-value-for-register';
        render(
            <FusionAuthProvider {...TEST_CONFIG}>
                <FusionAuthRegisterButton state={stateValue} />
            </FusionAuthProvider>,
        );

        fireEvent.click(screen.getByText('Register Now'));

        expect(register).toHaveBeenCalledWith(stateValue);
    });
});
