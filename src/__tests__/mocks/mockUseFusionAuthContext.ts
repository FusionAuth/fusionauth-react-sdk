import * as FusionAuthProvider from '../../providers/FusionAuthProvider';
import { IFusionAuthContext } from '../../providers/FusionAuthProvider';

export const mockUseFusionAuthContext = (
    context: Partial<IFusionAuthContext> = {},
) => {
    return jest
        .spyOn(FusionAuthProvider, 'useFusionAuthContext')
        .mockReturnValue({
            login: context.login ?? jest.fn(),
            logout: context.logout ?? jest.fn(),
        });
};
