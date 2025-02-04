import { Router } from 'express'
import { createIntegrations, getIntegrations } from '../controllers/integrations.controllers.js'

const router = Router()

router.post('/integrations', createIntegrations)

router.get('/integrations', getIntegrations)

export default router