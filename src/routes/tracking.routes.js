import { Router } from 'express'
import { trackingClick, trackingOpen } from '../controllers/tracking.controllers.js'

const router = Router()

router.get('/tracking/open', trackingOpen)

router.get('/tracking/clic', trackingClick)

export default router