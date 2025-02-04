import Integrations from '../models/Integrations.js'

export const createIntegrations = async (req, res) => {
    try {
        const integrations = await Integrations.findOne()
        if (integrations) {
            const updateIntegrations = await Integrations.findByIdAndUpdate(integrations._id, req.body, { new: true })
            return res.json(updateIntegrations)
        } else {
            const newIntegrations = new Integrations(req.body)
            const newIntegrationsSave = await newIntegrations.save()
            return res.json(newIntegrationsSave)
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getIntegrations = async (req, res) => {
    try {
        const integrations = await Integrations.findOne().lean()
        return res.json(integrations)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}