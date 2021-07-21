export enum EServerConnectionName {
	AUTH = 'Auth'
}

export enum EServerConnectionAction {
  REGISTER_SERVICE = 'Register Service',
}


export interface IServerConnection {
	action?: EServerConnectionAction,
	service: EServerConnectionName,
	host: string,
	port: number
}