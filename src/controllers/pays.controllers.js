import Pay from '../models/Pay.js'
import Client from '../models/Client.js'
import bizSdk from 'facebook-nodejs-business-sdk'
import Integrations from '../models/Integrations.js'

export const createPay = async (req, res) => {
    try {
        const integrations = await Integrations.findOne().lean()
        if (integrations && integrations.apiToken && integrations.apiToken !== '' && integrations.apiPixelId && integrations.apiPixelId !== '') {
            const Content = bizSdk.Content
            const CustomData = bizSdk.CustomData
            const EventRequest = bizSdk.EventRequest
            const UserData = bizSdk.UserData
            const ServerEvent = bizSdk.ServerEvent
            const access_token = integrations.apiToken
            const pixel_id = integrations.apiPixelId
            const api = bizSdk.FacebookAdsApi.init(access_token)
            let current_timestamp = Math.floor(new Date() / 1000)
            const userData = (new UserData())
                .setFirstName(req.body.firstName)
                .setLastName(req.body.lastName)
                .setEmail(req.body.email)
                .setPhone(req.body.phone && req.body.phone !== '' ? `56${req.body.phone}` : undefined)
                .setClientIpAddress(req.connection.remoteAddress)
                .setClientUserAgent(req.headers['user-agent'])
                .setFbp(req.body.fbp)
                .setFbc(req.body.fbc)
            const content = (new Content())
                .setId(req.body.service)
                .setQuantity(1)
                .setItemPrice(Number(req.body.price))
            const customData = (new CustomData())
                .setContentName(req.body.service)
                .setContents([content])
                .setCurrency('clp')
                .setValue(Number(req.body.price))
            const serverEvent = (new ServerEvent())
                .setEventId(req.body.eventId)
                .setEventName('Purchase')
                .setEventTime(current_timestamp)
                .setUserData(userData)
                .setCustomData(customData)
                .setEventSourceUrl(`${process.env.WEB_URL}${req.body.page}`)
                .setActionSource('website')
            const eventsData = [serverEvent];
            const eventRequest = (new EventRequest(access_token, pixel_id))
                .setEvents(eventsData)
            eventRequest.execute().then(
                response => {
                    console.log('Response: ', response)
                },
                err => {
                    console.error('Error: ', err)
                }
            )
        }
        const newPay = new Pay(req.body)
        const newPaySave = await newPay.save()
        return res.json(newPaySave)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPays = async (req, res) => {
    try {
        const pays = await Pay.find().lean()
        return res.json(pays)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPay = async (req, res) => {
    try {
        const pay = await Pay.findById(req.params.id)
        return res.json(pay)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPayEmailService = async (req, res) => {
    try {
        const [ email, serviceId ] = req.params.id.split('-')
        const client = await Client.findOne({ email: email })
        if (client.services.length && client.services.find(service => service.service === serviceId)) {
            const servicePrice = client.services.find(service => service.service === serviceId).price
            return res.json({ price: servicePrice ? servicePrice : null })
        } else {
            return res.json({ message: 'No price' })
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const updatePay = async (req, res) => {
    try {
        const payUpdate = await Pay.findByIdAndUpdate(req.params.id, req.body, { new: true })
        return res.json(payUpdate)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}