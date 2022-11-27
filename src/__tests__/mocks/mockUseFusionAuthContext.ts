import * as FusionAuthProvider from '../../providers/FusionAuthProvider';
import { IFusionAuthContext } from '../../providers/FusionAuthProvider';
import { createContextMock } from './createContextMock';

export const mockUseFusionAuthContext = (
    context: Partial<IFusionAuthContext> = {},
) => {
    const contextMock = createContextMock(context);
    return jest
        .spyOn(FusionAuthProvider, 'useFusionAuthContext')
        .mockReturnValue(contextMock);
};
