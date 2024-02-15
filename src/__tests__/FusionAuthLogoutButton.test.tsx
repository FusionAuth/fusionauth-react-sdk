import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { FusionAuthLogoutButton } from '../components/FusionAuthLogoutButton';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { mockUseFusionAuth } from './mocks/mockUseFusionAuth';
import { TEST_CONFIG } from './mocks/testConfig';

describe('FusionAuthLogoutButton', () => {
    test('Logout button will call the useFusionAuth hook', () => {
        const logout = jest.fn();
        mockUseFusionAuth({ logout });

        render(
            <FusionAuthProvider {...TEST_CONFIG}>
                <FusionAuthLogoutButton />
            </FusionAuthProvider>,
        );

        fireEvent.click(screen.getByText('Logout'));

        expect(logout).toHaveBeenCalled();
    });
});
