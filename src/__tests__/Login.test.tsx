import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { FusionAuthLoginButton } from '../components/FusionAuthLoginButton';
import { FusionAuthProvider } from '../providers/FusionAuthProvider';
import { createHash } from 'crypto';

afterEach(() => {
    jest.clearAllMocks();
});

Object.defineProperty(global.self, 'crypto', {
    value: {
        subtle: {
            digest: (algorithm: string, data: Uint8Array) => {
                return new Promise((resolve, reject) =>
                    resolve(
                        createHash(algorithm.toLowerCase().replace('-', ''))
                            .update(data)
                            .digest(),
                    ),
                );
            },
        },
        getRandomValues: array => {
            for (const num of array) {
                return Math.random();
            }
        },
    },
});

test('Login buttons renders the correct text', async () => {
    await renderProvider();
    expect(await screen.findByText('Login')).toBeInTheDocument();
});

let location: Location;
describe('urlBuilder', () => {
    beforeEach(() => {
        location = window.location;
        jest.spyOn(window, 'location', 'get').mockRestore();
    });

    test('Login button will generate the correct url when clicked', async () => {
        const mockedLocation = {
            ...location,
            assign: jest.fn(),
        };
        jest.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

        await renderProvider();
        await fireEvent.click(screen.getByText('Login'));

        const expectedUrl =
            'https://sandbox.fusionauth.io/oauth2/authorize?client_id=85a03867-dccf-4882-adde-1a79aeec50df&scope=openid offline_access&response_type=code&redirect_url=https%3A%2F%2Ffusionauth.io&code_challenge=vQOsFCjw6ob0uDpzH_x5Z7uChm2FRTIviI0vboV__Bg&code_challenge_method=S256&state=00000000000000000000000000000000000000000000000000000000:state';
        await waitFor(() =>
            expect(mockedLocation.assign).toBeCalledWith(expectedUrl),
        );
    });
});

const renderProvider = async () => {
    waitFor(() =>
        render(
            <FusionAuthProvider
                baseURL="https://sandbox.fusionauth.io/oauth2"
                clientID="85a03867-dccf-4882-adde-1a79aeec50df"
                scope="openid offline_access"
            >
                <FusionAuthLoginButton
                    redirectURI="https%3A%2F%2Ffusionauth.io"
                    state="state"
                />
            </FusionAuthProvider>,
        ),
    );
};
