import mongoose from 'mongoose'

const CalendarSchema = new mongoose.Schema({
    name: { type: String },
    dates: [{ date: { type: Date, required: true }, hours: [{ type: Number, required: true }]}],
}, {
    timestamps: true
})

const Calendar = mongoose.models.Calendar || mongoose.model('Calendar', CalendarSchema)

export default Calendar