import wcmatch from 'wildcard-match'
import { flags } from './flags';


export function check(user:any , permission:string) {
    let has = false
    user.flags.forEach((flag: string) => {
        if (flagHasPermission(flag, permission)) {
            has = true
        }
    });
    return has
}

export function flagHasPermission(flag: string, permission: string) {
    let yes = false
    flags[flag]?.forEach(perm => {
        if (wcmatch(perm)(permission)) {
            yes = true
            
        }
    })
    return yes
}