import { Router } from 'express'
import { createDesign, getDesign, updateDesign, getPagesAndFunnels, getPagesFunnels, editPage, createDefaultPages } from '../controllers/design.controllers.js'

const router = Router()

router.post('/design', createDesign)

router.get('/design', getDesign)

router.put('/design/:id', updateDesign)

router.put('/page/:id', editPage)

router.get('/pages-funnels', getPagesAndFunnels)

router.get('/page-funnel/:id', getPagesFunnels)

router.get('/create-default-design', createDefaultPages)

export default router