export default function f() {
    return 1;
}

export const a = 2;

function f2() {
    return null;
}

export const f2;

export const c = 1, d = 2;

// TODO: is this a valid statement? What is the result?
// export default e = 1, f = 3;
