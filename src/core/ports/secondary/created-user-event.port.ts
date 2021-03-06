import { UnmarshalledUserEntity } from '@core/modules/user/domain/entities/user.entity'
import { Action } from '@infrastructure/bus/action/action'
import { Event } from '@infrastructure/bus/event/event'

export const CREATED_USER_EVENT = 'CreatedUser'
const EVENT_VERSION = 1

type CreatedUserEventPortProperties = {
  data: UnmarshalledUserEntity
  previousAction: Action
  aggregateID: string
}

export class CreatedUserEventPort extends Event<UnmarshalledUserEntity> {
  public readonly data!: UnmarshalledUserEntity

  constructor({ aggregateID, previousAction, data }: CreatedUserEventPortProperties) {
    super({
      type: CREATED_USER_EVENT,
      version: EVENT_VERSION,
      aggregateID,
      previousAction,
      data,
    })
  }
}
