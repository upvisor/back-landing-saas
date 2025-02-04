import mongoose from 'mongoose'

const LeadSchema = new mongoose.Schema({
    form: { type: String },
    page: { type: String },
    service: { type: String },
    funnel: { type: String },
    step: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: Number },
    data: [{ name: { type: String }, value: { type: String } }]
}, {
    timestamps: true
})

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema)

export default Lead