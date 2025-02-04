import Calendar from '../models/Calendar.js'
import Meeting from '../models/Meeting.js'
import { sendEmail } from '../utils/sendEmail.js'
import Client from '../models/Client.js'
import axios from 'axios'
import ClientData from '../models/ClientData.js'
import moment from 'moment-timezone'
import StoreData from '../models/StoreData.js'
import bizSdk from 'facebook-nodejs-business-sdk'
import Zoom from '../models/Zoom.js'
import { isTokenExpired } from '../utils/zoom.js'
import Integrations from '../models/Integrations.js'
import Style from '../models/Style.js'

export const editCalendar = async (req, res) => {
    try {
        const calendar = await Calendar.findOne({ name: req.body.name }).lean()
        if (calendar === null) {
            const newCalendar = new Calendar(req.body)
            const newCalendarSave = await newCalendar.save()
            return res.json(newCalendarSave)
        } else {
            const calendarEdit = await Calendar.findByIdAndUpdate(req.body._id, req.body, { new: true })
            return res.json(calendarEdit)
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getCalendar = async (req, res) => {
    try {
        const calendar = await Calendar.find()
        if (!calendar) {
            return res.status(404).json({ message: "No tiene calendarios creados" });
        }
        return res.json(calendar)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getOneCalendar = async (req, res) => {
    try {
        const calendar = await Calendar.findById(req.params.id)
        return res.json(calendar)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deleteCalendar = async (req, res) => {
    try {
        const deleteCalendar = await Calendar.findByIdAndDelete(req.params.id)
        return res.json(deleteCalendar)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const CreateMeeting = async (req, res) => {
    try {
        if (req.body.type === 'Llamada por Zoom') {
            const zoom = await Zoom.findOne();
            let token
            if (!zoom || isTokenExpired(zoom.createdAt, zoom.expires_in)) {
                const response = await axios.post('https://zoom.us/oauth/token', null, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    params: {
                        "grant_type": "account_credentials",
                        "account_id": process.env.ZOOM_ACCOUNT_ID
                    }
                })
                token = response.data.access_token
                if (zoom) {
                    await Zoom.findByIdAndUpdate(zoom._id, response.data, { new: true })
                } else {
                    const newToken = new Zoom(response.data)
                    await newToken.save()
                }
            } else {
                token = zoom.access_token
            }
            const meetingData = {
                topic: req.body.call,
                type: 2,
                start_time: moment.tz(req.body.date, 'America/Santiago').format(),
                duration: req.body.duration
            }
            const meetingResponse = await axios.post(`https://api.zoom.us/v2/users/me/meetings`, meetingData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }).catch(error => console.log(error))
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
                    .setItemPrice(req.body.price && req.body.price !== '' ? Number(req.body.price) : undefined)
                const customData = (new CustomData())
                    .setContentName(req.body.meeting)
                    .setContents([content])
                    .setCurrency('clp')
                    .setValue(req.body.price && req.body.price !== '' ? Number(req.body.price) : undefined)
                const serverEvent = (new ServerEvent())
                    .setEventId(req.body.eventId)
                    .setEventName('Schedule')
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
            const newMeeting = new Meeting({ ...req.body, url: meetingResponse.data.start_url})
            const newMeetingSave = await newMeeting.save()
            const client = await Client.findOne({ email: req.body.email })
            if (client) {
                await axios.post(`${process.env.API_URL}/clients`, req.body)
            } else {
                const newClient = new Client(req.body)
                await newClient.save()
            }
            res.json(newMeetingSave)
            const clientData = await ClientData.find()
            const storeData = await StoreData.find()
            const style = await Style.find()
            await sendEmail({ subscribers: [{ name: req.body.firstName, email: req.body.email }], emailData: { affair: `¡Hola ${req.body.firstName}! Tu llamada ha sido agendada con exito`, title: 'Hemos agendado tu llamada exitosamente', paragraph: `¡Hola ${req.body.firstName}! Te queriamos informar que tu llamada con fecha ${new Date(req.body.date).getDate()}/${new Date(req.body.date).getMonth() + 1}/${new Date(req.body.date).getFullYear()} a las ${new Date(req.body.date).getHours()}:${new Date(req.body.date).getMinutes() >= 9 ? new Date(req.body.date).getMinutes() : `0${new Date(req.body.date).getMinutes()}`} ha sido agendada con exito, aqui te dejamos el acceso a la llamada en el siguiente boton.`, buttonText: 'Ingresar a la llamada', url: meetingResponse.data.start_url }, clientData: clientData, storeData: storeData[0], style: style[0] })
        } else {
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
                    .setItemPrice(req.body.price && req.body.price !== '' ? Number(req.body.price) : undefined)
                const customData = (new CustomData())
                    .setContentName(req.body.meeting)
                    .setContents([content])
                    .setCurrency('clp')
                    .setValue(req.body.price && req.body.price !== '' ? Number(req.body.price) : undefined)
                const serverEvent = (new ServerEvent())
                    .setEventId(req.body.eventId)
                    .setEventName('Schedule')
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
            const newMeeting = new Meeting(req.body)
            const newMeetingSave = await newMeeting.save()
            const client = await Client.findOne({ email: req.body.email })
            if (client) {
                await axios.post(`${process.env.API_URL}/clients`, req.body)
            } else {
                const newClient = new Client(req.body)
                await newClient.save()
            }
            res.json(newMeetingSave)
            const clientData = await ClientData.find()
            const storeData = await StoreData.find()
            const style = await Style.find()
            await sendEmail({ subscribers: [{ name: req.body.firstName, email: req.body.email }], emailData: { affair: `¡Hola ${req.body.firstName}! Tu visita ha sido agendada con exito`, title: 'Hemos agendado tu visita exitosamente', paragraph: `¡Hola ${req.body.firstName}! Te queriamos informar que tu visita con fecha ${new Date(req.body.date).getDate()}/${new Date(req.body.date).getMonth() + 1}/${new Date(req.body.date).getFullYear()} a las ${new Date(req.body.date).getHours()}:${new Date(req.body.date).getMinutes() >= 9 ? new Date(req.body.date).getMinutes() : `0${new Date(req.body.date).getMinutes()}`} ha sido agendada con exito, la visita sera en ${storeData[0].address}, ${storeData[0].city}, ${storeData[0].region}.` }, clientData: clientData, storeData: storeData[0], style: style[0] })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: error.message})
    }
}

export const deleteMeeting = async (req, res) => {
    try {
        const meetingDelete = await Meeting.findOneAndDelete(req.params.id)
        res.json(meetingDelete)
        await sendEmail({ content: `
            <h1 style="font-weight: 500; margin-bottom: 0px; color: #2A2A2A; text-align: center;">Tu llamada ha sido cancelada correctamente</h1>
            <p style="font-size: 16px; color: #2D2D2D; text-align: center;">¡Hola ${meetingDelete.firstName}! Te queriamos avisar que tu llamada ha sido cancelada correctamente.</p>
        `, subject: `¡Hola ${meetingDelete.firstName}! Tu llamada ha sido cancelada con exito`, email: meetingDelete.email })
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const editMeeting = async (req, res) => {
    try {
        const meetingEdit = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true })
        const fechaLlamada = meetingEdit.date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
        res.json(meetingEdit)
        await sendEmail({ content: `
            <h1 style="font-weight: 500; margin-bottom: 0px; color: #2A2A2A; text-align: center;">Tu llamada ha sido reagendada correctamente</h1>
            <p style="font-size: 16px; color: #2D2D2D; text-align: center;">¡Hola ${meetingEdit.firstName}! Te queriamos avisar que tu llamada para ver tu caso con respecto a la declaración de renta año 2024 ha sido reagendada correctamente.</p>
            <p style="font-size: 16px; color: #2D2D2D; text-align: center;">Fecha: ${fechaLlamada}</p>
            <div style="display: flex; margin-bottom: 6px;">
                <a href="${process.env.WEB_URL}/clase-gratis-renta-2024" target="_blank" style="padding: 8px 21px; border: none; text-decoration: none; color: white; font-size: 16px; margin: auto; width: fit-content; margin-bottom: 18px; cursor: pointer; background-color: #3478F5;">Ingresar a la llamada</a>
            </div>
        `, subject: `¡Hola ${meetingEdit.firstName}! Tu llamada ha sido reagendada con exito`, email: meetingEdit.email })
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find()
        return res.json(meetings)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
        return res.json(meeting)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getMeetingsEmail = async (req, res) => {
    try {
        const meetings = await Meeting.find({ email: req.params.email })
        return res.json(meetings)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}