export type Id = string & { readonly __tag: "id" };

const s4 = (): string =>
    Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);

export const uuid = (): Id =>
    (s4() +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        s4() +
        s4()) as Id;
