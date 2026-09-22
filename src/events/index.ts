import { birthEvent } from './birth'
import { deathEvent } from './death'
import { stillbirthEvent } from './stillbirth'
import { marriageNoticeEvent } from './marriageNotice'
import { adoptionEvent } from './adoption'
import { divorceEvent } from './divorce'
import { marriageRegistrationEvent } from './marriageRegistration'
import { nameChangeEvent } from './nameChange'

export const eventConfigs = [
  birthEvent,
  deathEvent,
  marriageNoticeEvent,
  stillbirthEvent,
  adoptionEvent,
  divorceEvent,
  marriageRegistrationEvent,
  nameChangeEvent
]
