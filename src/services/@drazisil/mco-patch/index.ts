import http from 'http'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./server.config.js')
import logger from '@drazisil/mco-logger'

export const CastanetResponse = {
  body: Buffer.from('cafebeef00000000000003', 'hex'),
  header: {
    type: 'Content-Type',
    value: 'application/octet-stream',
  },
}

export class PatchServer {
  static _instance: PatchServer
  _config: typeof config
  _server: http.Server
  _serviceName = 'MCOServer:Patch'

  static getInstance(): PatchServer {
    if (!PatchServer._instance) {
      PatchServer._instance = new PatchServer()
    }
    return PatchServer._instance
  }

  private constructor() {
    this._config = config

    this._server = http.createServer((request, response) => {
      this.handleRequest(request, response)
    })

    this._server.on('error', error => {
      process.exitCode = -1
      logger.log(`Server error: ${error.message}`, {
        level: 'error',
        service: this._serviceName,
      })
      logger.log(`Server shutdown: ${process.exitCode}`, {
        service: this._serviceName,
      })
      process.exit()
    })
  }

  handleRequest(request: http.IncomingMessage, response: http.ServerResponse) {
    const responseData = CastanetResponse

    switch (request.url) {
      case '/games/EA_Seattle/MotorCity/UpdateInfo':
      case '/games/EA_Seattle/MotorCity/NPS':
      case '/games/EA_Seattle/MotorCity/MCO':
        logger.log(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
          { level: 'debug', service: this._serviceName },
        )

        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break

      default:
        response.statusCode = 404
        response.end('')
        break
    }
  }

  start() {
    const host = config.serverSettings.host || 'localhost'
    const port = config.serverSettings.port || 80
    return this._server.listen({ port, host }, () => {
      logger.debug(`port ${port} listening`, { service: this._serviceName })
      logger.log('Patch server is listening...', {
        service: this._serviceName,
      })
    })
  }
}
