import mongoose from 'mongoose'

const StyleSchema = new mongoose.Schema({
    design: { type: String },
    form: { type: String },
    primary: { type: String },
    secondary: { type: String },
    button: { type: String },
    borderButton: { type: Number },
    borderBlock: { type: Number },
    borderColor: { type: String }
}, {
    timestamps: true
})

const Style = mongoose.models.Style || mongoose.model('Style', StyleSchema)

export default Style