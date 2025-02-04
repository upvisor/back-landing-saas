import Contact from '../models/Contact.js'
import bizSdk from 'facebook-nodejs-business-sdk'
import Integrations from '../models/Integrations.js'

export const createMessage = async (req, res) => {
    try {
        const {name, email, message, images, fbp, fbc} = req.body
        const integrations = await Integrations.findOne().lean()
        if (integrations && integrations.apiToken && integrations.apiToken !== '' && integrations.apiPixelId && integrations.apiPixelId !== '') {
            const EventRequest = bizSdk.EventRequest
            const UserData = bizSdk.UserData
            const ServerEvent = bizSdk.ServerEvent
            const access_token = integrations.apiToken
            const pixel_id = integrations.apiPixelId
            const api = bizSdk.FacebookAdsApi.init(access_token)
            let current_timestamp = new Date()
            const userData = (new UserData())
                .setFirstName(name.toLowerCase())
                .setEmail(email.toLowerCase())
                .setClientIpAddress(req.connection.remoteAddress)
                .setClientUserAgent(req.headers['user-agent'])
                .setFbp(fbp)
                .setFbc(fbc)
            const serverEvent = (new ServerEvent())
                .setEventName('Contact')
                .setEventTime(current_timestamp)
                .setUserData(userData)
                .setEventSourceUrl(`${process.env.WEB_URL}${req.body.page}`)
                .setActionSource('website')
            const eventsData = [serverEvent]
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
        const nuevoMensaje = new Contact({name, email, message, images})
        await nuevoMensaje.save()
        return res.json(nuevoMensaje)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getMessages = async (req, res) => {
    try {
        const mensajes = await Contact.find()
        res.send(mensajes)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}