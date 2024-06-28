import kleur from 'kleur'

/* eslint-disable no-console */
export const log = console.log
export const warn = console.warn
export const success = (...args: any[]) =>
  console.log(kleur.green(args.join(' ')))
export const info = console.info
export const error = (...args: any[]) => console.log(kleur.red(args.join(' ')))
