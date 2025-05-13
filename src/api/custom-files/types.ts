export type TActivateCustomizationOn = 'login' | 'client'
export interface IStyleTagOptions {
  media?: string
  crossorigin?: string
  integrity?: string
  title?: string
  disabled?: boolean
  type?: string
}

export interface IScriptTagOptions {
  async?: boolean
  defer?: boolean
  nomodule?: boolean
  onload?: ((this: any, ev: any) => any) | null
  onerror?: any
  crossorigin?: string
  integrity?: string
}

export interface ITag {
  url: string
  activateOn: TActivateCustomizationOn[]
}

export interface IStyleTag extends ITag {
  options: IStyleTagOptions
}

export interface IScriptTag extends ITag {
  options: IScriptTagOptions
}

export interface IAdvancedFrontendCustomizations {
  customFiles: boolean
  externalScripts: IScriptTag[]
  externalStyles: IStyleTag[]
}
