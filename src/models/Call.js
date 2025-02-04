import mongoose from 'mongoose'

const CallSchema = new mongoose.Schema({
    type: { type: String },
    nameMeeting: { type: String, required: true, unique: true },
    title: { type: String },
    duration: { type: String },
    description: { type: String },
    price: { type: Number },
    labels: [{ text: { type: String }, name: { type: String }, data: { type: String } }],
    buttonText: { type: String },
    tags: [{ type: String }],
    action: { type: String },
    message: { type: String },
    redirect: { type: String },
    calendar: { type: String }
}, {
    timestamps: true
})

const Call = mongoose.models.Call || mongoose.model('Call', CallSchema)

export default Call