import Email from '../models/Email.js'
import Client from '../models/Client.js'
import { sendEmail } from '../utils/sendEmail.js'
import { formatDateToCron } from '../utils/cronFormat.js'
import cron from 'node-cron'
import StoreData from '../models/StoreData.js'
import ClientData from '../models/ClientData.js'
import Task from '../models/Task.js'
import Style from '../models/Style.js'

export const createCampaign = async (req, res) => {
    try {
        const { address, affair, title, paragraph, buttonText, url, date } = req.body
        const newCampaign = new Email({ address, affair, title, paragraph, buttonText, url, date: date === undefined ? new Date() : date })
        await newCampaign.save()
        res.json(newCampaign)
        if (date !== undefined) {
            let subscribers = []
            if (address === 'Todos los suscriptores') {
                subscribers = await Client.find().lean()
            } else {
                subscribers = await Client.find({ tags: address }).lean()
            }
            const dateCron = formatDateToCron(new Date(date))
            const newTask = new Task({ dateCron: dateCron, startValue: address, emailData: { affair: affair, title: title, paragraph: paragraph, buttonText: buttonText, url: url }, automatizationId: newCampaign._id })
            await newTask.save()
            cron.schedule(dateCron, async () => {
                if (address === 'Todos los suscriptores') {
                    subscribers = await Client.find().lean()
                } else {
                    subscribers = await Client.find({ tags: address }).lean()
                }
                const storeData = await StoreData.find()
                const clientData = await ClientData.find()
                const style = await Style.findOne()
                subscribers = subscribers.filter(subscriber => !subscriber.tags.includes('desuscrito'))
                sendEmail({ subscribers: subscribers, emailData: { affair: affair, title: title, paragraph: paragraph, buttonText: buttonText, url: url }, clientData: clientData, storeData: storeData[0], automatizationId: newCampaign._id, style: style })
            })
        } else {
            let subscribers = []
            if (address === 'Todos los suscriptores') {
                subscribers = await Client.find().lean()
            } else {
                subscribers = await Client.find({ tags: address }).lean()
            }
            const storeData = await StoreData.find()
            const clientData = await ClientData.find()
            const style = await Style.findOne()
            subscribers = subscribers.filter(subscriber => !subscriber.tags.includes('desuscrito'))
            sendEmail({ subscribers: subscribers, emailData: { affair: affair, title: title, paragraph: paragraph, buttonText: buttonText, url: url }, clientData: clientData, storeData: storeData[0], automatizationId: newCampaign._id, style: style })
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Email.find().lean()
        return res.send(campaigns)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getCampaign = async (req, res) => {
    try {
        const campaign = await Email.findById(req.params.id)
        if (!campaign) {
            return res.sendStatus(404)
        }
        return res.send(campaign)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deleteCampaign = async (req, res) => {
    try {
        const campaignDelete = await Email.findByIdAndDelete(req.params.id)
        return res.send(campaignDelete)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const editCampaign = async (req, res) => {
    try {
        const campaignEdit = await Email.findByIdAndUpdate(req.params.id, req.body, { new: true })
        return res.json(campaignEdit)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}