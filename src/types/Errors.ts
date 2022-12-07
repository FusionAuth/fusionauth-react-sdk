export class ServerError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'ServerError';
    }
}

export class InvalidRefreshTokenError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'InvalidRefreshTokenError';
    }
}

export class NotFoundError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class UnknownError extends Error {
    constructor() {
        super('An unknown error occurred.');
        this.name = 'UnknownError';
    }
}
