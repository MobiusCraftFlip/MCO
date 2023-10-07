import { FlagModel } from "../models/flags.model"

let flags = {
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

const refreshFlags = async () => {
    const fflags = await FlagModel.find({}).exec()
    const flg = {} as {[key:string]: string[]}
    fflags.forEach((flag) => {
        flg[flag.name] = flag.permissions
    })
    console.log(fflags)
    console.log(flg)
    console.log(flags)

    Object.assign(flags, flg)
    console.log(flags)
}

export =  {
    flags,
    joinable,
    refreshFlags,
};