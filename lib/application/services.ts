import { CommandDTO } from 'lib/bus/command/dtos'
import { CommandDispatcher } from 'lib/bus/command/services'
import { QueryDispatcher } from 'lib/bus/query/services'
import { MutationResult } from 'lib/graphql/models'

export abstract class ApplicationService {
  protected readonly commandDispatcher: CommandDispatcher
  protected readonly queryDispatcher: QueryDispatcher

  protected buildGraphQLMutationResult<P = any>(commandResult: CommandDTO<P>): MutationResult {
    return {
      correlationID: commandResult.tracing.correlationID,
    }
  }
}