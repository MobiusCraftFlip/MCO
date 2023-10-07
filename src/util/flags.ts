
const flags = {
    sudo: [
        "*"
    ],
    techteam: [],
    glocadmin: [
        "gloc.warnings.read"
    ],
} as {[key:string]: string[]}

const joinable = {
    glocestershirePlayer: true
} as {[key:string]: boolean }

export {
    flags,
    joinable
};