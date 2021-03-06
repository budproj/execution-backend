import { existsSync, readFileSync } from 'fs'

import { LoggerService, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'

import { createConfig } from '@config'
import { LoggingConfig } from '@config/logging'
import { ServerConfig } from '@config/server'
import { buildLogger } from '@lib/logger'

import { BootstrapModule } from './bootstrap.module'

type CustomFastifyServerOptions = {
  https: CustomFastifyServerHTTPSOptions
}

type CustomFastifyServerHTTPSOptions = {
  key: Buffer
  cert: Buffer
}

async function bootstrap(): Promise<void> {
  const serverConfig = createConfig().server
  const fastifyServerOptions = buildFastifyServerOptions(serverConfig)

  const application = await NestFactory.create<NestFastifyApplication>(
    BootstrapModule,
    new FastifyAdapter(fastifyServerOptions),
  )

  const configService = application.get<ConfigService>(ConfigService)
  const loggingConfig = configService.get<LoggingConfig>('logging')

  const logger = buildLogger(loggingConfig?.level, loggingConfig?.serviceName)

  setupServer(application, logger, serverConfig)
  await launchServer(application, logger, serverConfig)
}

function buildFastifyServerOptions(
  serverConfig: ServerConfig,
): CustomFastifyServerOptions | undefined {
  const httpsConfig = buildHttpsConfig(serverConfig)
  if (!httpsConfig) return

  return {
    https: httpsConfig,
  }
}

function buildHttpsConfig({ https }: ServerConfig): CustomFastifyServerHTTPSOptions | undefined {
  const isHttpsEnabled = https.enabled
  if (!isHttpsEnabled) return
  if (!https || !https?.credentialFilePaths) return

  const hasValidCredentials =
    existsSync(https.credentialFilePaths.key) && existsSync(https.credentialFilePaths.cert)
  if (!hasValidCredentials) return

  return {
    key: readFileSync(https.credentialFilePaths.key),
    cert: readFileSync(https.credentialFilePaths.cert),
  }
}

function setupServer(
  application: NestFastifyApplication,
  logger: LoggerService,
  serverConfig: ServerConfig,
): void {
  const defaultGlobalPrefix = ''

  application.setGlobalPrefix(serverConfig?.prefix ?? defaultGlobalPrefix)
  application.useLogger(logger)
  application.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  application.enableCors({
    credentials: serverConfig.cors.credentialsFlag,
    origin: serverConfig.cors.allowedOrigins,
  })
}

async function launchServer(
  application: NestFastifyApplication,
  logger: LoggerService,
  serverConfig: ServerConfig,
): Promise<void> {
  await application.listen(serverConfig.port, serverConfig.networkAddress)
  logger.log(`Started server listening to port ${serverConfig.port.toString()}`)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap()
