import React from "react";
import { screen, render } from "@testing-library/react";

const Example = () => <button>Click me</button>;

describe("Example", () => {
    it("renders correct text", () => {
        render(<Example />)
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });
});
