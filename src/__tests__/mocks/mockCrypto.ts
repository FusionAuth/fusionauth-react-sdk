import { createHash } from 'crypto';

export const mockCrypto = () => {
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
            getRandomValues: (array: number[]): Uint32Array => {
                return new Uint32Array(array.length);
            },
        },
    });
};
