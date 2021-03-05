import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql'

import { GraphQLAdapterFactory } from './graphql-adapter.factory'
import { UserResolver } from './resolvers/user.resolver'

@Module({
  imports: [
    NestGraphQLModule.forRootAsync({
      imports: [ConfigModule],
      useClass: GraphQLAdapterFactory,
    }),
  ],
  providers: [UserResolver],
})
export class GraphQLAdapterModule {}
