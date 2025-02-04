import mongoose from 'mongoose'

const FormSchema = new mongoose.Schema({
    nameForm: { type: String, required: true, unique: true },
    title: { type: String },
    informations: [{ icon: { type: String }, text: { type: String }, subText: { type: String } }],
    labels: [{ type: { type: String }, text: { type: String }, name: { type: String }, data: { type: String }, datas: [{ type: String }] }],
    button: { type: String },
    tags: [{ type: String }],
    action: { type: String, required: true },
    redirect: { type: String },
    message: { type: String }
}, {
    timestamps: true
})

const Form = mongoose.models.Form || mongoose.model('Form', FormSchema)

export default Form