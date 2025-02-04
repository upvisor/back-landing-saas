import { sendEmail } from '../utils/sendEmail.js'
import StoreData from '../models/StoreData.js'
import ClientData from '../models/ClientData.js'
import Style from '../models/Style.js'

export const sendEmailClient = async (req, res) => {
    try {
        const storeData = await StoreData.find()
        const clientData = await ClientData.find()
        const style = await Style.find()
        await sendEmail({ subscribers: [{ email: req.params.id }], emailData: { paragraph: req.body.email.replace(/(\r\n|\n|\r)+/g, "<br>"), affair: req.body.subject }, clientData: clientData, storeData: storeData, style: style })
        return res.status(200).json({ message: 'Correo electrónico enviado correctamente' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
};