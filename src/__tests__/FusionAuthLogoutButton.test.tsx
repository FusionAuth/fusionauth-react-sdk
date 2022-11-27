import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { FusionAuthLogoutButton } from '../components/FusionAuthLogoutButton';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { mockUseFusionAuth } from './mocks/mockUseFusionAuth';
import { TEST_CONFIG } from './mocks/testConfig';

describe('FusionAuthLogoutButton', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Logout buttons renders the correct text', async () => {
        await renderProvider();
        expect(await screen.findByText('Logout')).toBeInTheDocument();
    });

    test('Logout button will call the useFusionAuth hook', async () => {
        const logout = jest.fn();
        mockUseFusionAuth({ logout });

        await renderProvider();

        fireEvent.click(screen.getByText('Logout'));

        expect(logout).toBeCalledWith();
    });
});

const renderProvider = () => {
    return waitFor(() =>
        render(
            <FusionAuthProvider {...TEST_CONFIG}>
                <FusionAuthLogoutButton />
            </FusionAuthProvider>,
        ),
    );
};
