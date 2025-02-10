import { updateClientEmailStatusById } from '../utils/updateEmail.js'

export const trackingOpen = async (req, res) => {
    try {
        const { id, email, automatizacionId } = req.query
        await updateClientEmailStatusById(email, id, 'unique_opened')
        return res.status(200).json({message: 'Email opened'})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const trackingClick = async (req, res) => {
    try {
        const { id, email, automatizacionId, url } = req.query
        await updateClientEmailStatusById(email, id, 'click')
        return res.redirect(url)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}