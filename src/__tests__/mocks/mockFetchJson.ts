export const mockFetchJson = (json: any) => {
    // @ts-ignore
    jest.spyOn(global, 'fetch').mockResolvedValue({
        json: jest.fn().mockResolvedValue(json),
    });
};
