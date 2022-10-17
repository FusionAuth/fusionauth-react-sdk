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

Object.defineProperty(global.self, 'window', {
    value: {
        location: {
            assign: url => {
                console.log(url);
            },
        },
    },
});

const Provider = () => (
    <FusionAuthProvider
        baseURL="https://sandbox.fusionauth.io/oauth2"
        clientID="85a03867-dccf-4882-adde-1a79aeec50df"
        scope="openid offline_access"
    >
        <FusionAuthLoginButton
            redirectURI="https%3A%2F%2Ffusionauth.io"
            state="state"
        />
    </FusionAuthProvider>
);

test('Login buttons renders the correct text', async () => {
    await renderProvider();
    console.log('TEST FIRST');
    expect(screen.queryAllByText('Login')).toHaveLength(1);
    console.log('TEST LAST');
});

test('Login button goes to the correct URL', async () => {
    const handleClick = jest.fn();
    await renderProvider();
    await fireEvent.click(screen.getByText('Login'));
    expect(handleClick).toHaveBeenCalledTimes(1);
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
