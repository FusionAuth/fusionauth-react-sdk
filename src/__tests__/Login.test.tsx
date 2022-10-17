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
                return new Promise(resolve =>
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
                return Math.random() * num;
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
            'https://woodridge-theme.fusionauth.io/oauth2/authorize?client_id=17cafba1-c0c1-430a-bfe8-3ed438df9fc0&scope=openid offline_access&response_type=code&redirect_uri=http://localhost&code_challenge=vQOsFCjw6ob0uDpzH_x5Z7uChm2FRTIviI0vboV__Bg&code_challenge_method=S256&state=00000000000000000000000000000000000000000000000000000000:state';
        await waitFor(() =>
            expect(mockedLocation.assign).toBeCalledWith(expectedUrl),
        );
    });
});

const renderProvider = async () => {
    waitFor(() =>
        render(
            <FusionAuthProvider
                baseURL="https://woodridge-theme.fusionauth.io/oauth2"
                clientID="17cafba1-c0c1-430a-bfe8-3ed438df9fc0"
                scope="openid offline_access"
            >
                <FusionAuthLoginButton
                    redirectURI="http://localhost"
                    state="state"
                />
            </FusionAuthProvider>,
        ),
    );
};
