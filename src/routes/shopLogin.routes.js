import {Router} from 'express'
import { createAccount, editAccountData, getAccountData, getAccounts } from '../controllers/shopLogin.controllers.js'

const router = Router()

router.post('/shop-login', createAccount)

router.get('/shop-login', getAccountData)

router.put('/shop-login', editAccountData)

router.get('/accounts', getAccounts)

export default router