import { IFusionAuthContext } from '../../providers/FusionAuthProvider';

export const createContextMock = (
    context: Partial<IFusionAuthContext>,
): IFusionAuthContext => ({
    login: context.login ?? jest.fn(),
    logout: context.logout ?? jest.fn(),
    register: context.register ?? jest.fn(),
    isAuthenticated: context.isAuthenticated ?? false,
    user: context.user ?? {},
    refreshToken: context.refreshToken ?? jest.fn(),
    isLoading: context.isLoading ?? false,
});
