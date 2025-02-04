import Task from "../models/Task.js"
import Client from '../models/Client.js'
import ClientData from '../models/ClientData.js'
import StoreData from '../models/StoreData.js'
import cron from 'node-cron'
import { sendEmail } from '../utils/sendEmail.js'
import Style from '../models/Style.js'

export const loadTasks = async () => {
    const tasks = await Task.find()
    tasks.map(async (task) => {
        cron.schedule(task.dateCron, async () => {
            if (task.subscriber) {
                const client = await Client.findOne({ email: task.subscriber }).lean()
                if (client) {
                    const tagsCondition = task.condition.every(tag => !client.tags.includes(tag) && !client.tags.includes('desuscrito'))
                    let funnelOrServiceCondition = true;
                    if (task.startType === 'Añadido a una etapa de un embudo') {
                        funnelOrServiceCondition = client.funnels.some(funnel => funnel.step === task.startValue);
                    } else if (task.startType === 'Añadido a una etapa de un servicio') {
                        funnelOrServiceCondition = client.services.some(service => service.step === task.startValue);
                    }
                    if (tagsCondition && funnelOrServiceCondition) {
                        const clientData = await ClientData.find();
                        const storeData = await StoreData.find();
                        const style = await Style.find();
                        sendEmail({ subscribers: [client], emailData: task.emailData, clientData: clientData, storeData: storeData[0], automatizationId: task.automatizationId, style: style[0] });
                    }
                }
            } else if (task.subscribers.length) {
                const emails = task.subscribers;
                const updatedSubscribers = await Client.find({ email: { $in: emails } }).lean()
                const filteredSubscribers = updatedSubscribers.filter(subscriber => {
                    const tagsCondition = task.condition.every(tag => !subscriber.tags.includes(tag) && !subscriber.tags.includes('desuscrito'))
                    let funnelOrServiceCondition = true
                    if (task.startType === 'Añadido a una etapa de un embudo') {
                        funnelOrServiceCondition = subscriber.funnels.some(funnel => funnel.step === task.startValue)
                    } else if (task.startType === 'Añadido a una etapa de un servicio') {
                        funnelOrServiceCondition = subscriber.services.some(service => service.step === task.startValue)
                    }
                    return tagsCondition && funnelOrServiceCondition
                })
                if (filteredSubscribers.length > 0) {
                    const clientData = await ClientData.find()
                    const storeData = await StoreData.find()
                    const style = await Style.findOne()
                    sendEmail({ subscribers: filteredSubscribers, emailData: task.emailData, clientData: clientData, storeData: storeData[0], automatizationId: task.automatizationId, style: style })
                }
            } else {
                const subscribers = await Client.find({ tags: task.startValue }).lean()
                const clientData = await ClientData.find()
                const storeData = await StoreData.find()
                const style = await Style.findOne()
                sendEmail({ subscribers: subscribers, emailData: task.emailData, clientData: clientData, storeData: storeData[0], automatizationId: task.automatizationId, style: style })
            }
        })
    })
}