import mongoose from 'mongoose'

const IntegrationsSchema = new mongoose.Schema({
    apiToken: { type: String },
    apiPixelId: { type: String },
    googleAnalytics: { type: String }
}, {
    timestamps: true
})

const Integrations = mongoose.models.Integrations || mongoose.model('Integrations', IntegrationsSchema)

export default Integrations