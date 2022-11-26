import React, { Component } from 'react';
import {
    withFusionAuth,
    WithFusionAuthProps,
} from '../components/withFusionAuth';
import { waitFor, render } from '@testing-library/react';
import {
    FusionAuthContext,
    IFusionAuthContext,
} from '../providers/FusionAuthProvider';
import { createContextMock } from '../__tests__/mocks/createContextMock';

describe('withFusionAuth', () => {
    test('component wrapped in HOC receives context values', async () => {
        const logout = jest.fn();
        await renderWrappedComponent({ logout });

        expect(logout).toBeCalled();
    });
});

class WithoutFusionAuth extends Component<WithFusionAuthProps> {
    render() {
        return <div>Test Component</div>;
    }

    componentDidMount() {
        this.props.fusionAuth.logout();
    }
}

const WithFusionAuth = withFusionAuth(WithoutFusionAuth);

const renderWrappedComponent = (context: Partial<IFusionAuthContext>) => {
    const contextMock = createContextMock(context);
    return waitFor(() =>
        render(
            <FusionAuthContext.Provider value={contextMock}>
                <WithFusionAuth />
            </FusionAuthContext.Provider>,
        ),
    );
};
