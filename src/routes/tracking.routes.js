import { Router } from 'express'
import { trackingClick, trackingOpen } from '../controllers/tracking.controllers.js'

const router = Router()

router.post('/tracking/open', trackingOpen)

router.post('/tracking/clic', trackingClick)

export default router