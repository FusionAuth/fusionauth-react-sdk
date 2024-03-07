import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Unauthenticated } from '../components/Unauthenticated';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { TEST_CONFIG } from './mocks/testConfig';

describe('FusionAuthLogoutButton', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Only renders children if not authenticated', async () => {
        // set up provider to fetch user, which will authenticate
        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: `app.idt=abc123;`,
        });
        const mockUser = { name: 'AuthGuy5000' };
        const response = {
            ok: true,
            json: () => Promise.resolve(mockUser),
        } as Response;
        jest.spyOn(global, 'fetch').mockResolvedValue(response);

        const contentForTheUnauthenticated = 'for unauthenticated eyes only';
        const { queryByText } = render(
            <FusionAuthProvider {...TEST_CONFIG}>
                <Unauthenticated>
                    <p>{contentForTheUnauthenticated}</p>
                </Unauthenticated>
            </FusionAuthProvider>,
        );

        // content appears before user is fetched
        expect(queryByText(contentForTheUnauthenticated)).toBeInTheDocument();

        // user is authenticated -- content disappears
        await waitFor(() => {
            expect(
                queryByText(contentForTheUnauthenticated),
            ).not.toBeInTheDocument();
        });
    });
});
