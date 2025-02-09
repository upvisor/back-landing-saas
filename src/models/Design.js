import mongoose from 'mongoose'

const pageSchema = new mongoose.Schema({
    page: { type: String },
    slug: { type: String },
    header: { type: Boolean },
    button: { type: Boolean },
    metaTitle: { type: String },
    metaDescription: { type: String },
    image: { type: String },
    subPage: [{ page: { type: String }, slug: { type: String } }],
    design: [{ content: { type: String }, meetings: [{ type: String }], meeting: { type: String }, form: { type: String }, service: { service: { type: String }, plan: { type: String } }, services: [{ service: { type: String }, url: { type: String } }], info: { banner: [{ title: { type: String }, description: { type: String }, button: { type: String }, buttonLink: { type: String }, image: { type: String } }], title: { type: String }, subTitle: { type: String }, description: { type: String }, image: { type: String }, titleForm: { type: String }, button: { type: String }, buttonLink: { type: String }, subTitle2: { type: String }, description2: { type: String }, button2: { type: String }, buttonLink2: { type: String }, subTitle3: { type: String }, description3: { type: String }, button3: { type: String }, buttonLink3: { type: String }, subTitle4: { type: String }, descriptionView: { type: Boolean }, video: { type: String }, typeBackground: { type: String }, background: { type: String }, textColor: { type: String }, faq: [{ question: { type: String }, response: { type: String } }], blocks: [{ title: { type: String }, description: { type: String }, buttonText: { type: String }, buttonLink: { type: String } }], reviews: [{ review: { type: String }, stars: { type: String }, name: { type: String } }], form: [{ type: { type: String }, text: { type: String }, name: { type: String }, data: { type: String }, datas: [{ type: String }] }] } }]
}, {
    timestamps: true
})

const DesignSchema = new mongoose.Schema({
    header: {
        topStrip: { type: String },
        bgColor: { type: String },
        textColor: { type: String },
        logo: { type: String },
        bgColorTop: { type: String },
        textColorTop: { type: String },
    },
    footer: {
        bgColor: { type: String },
        textColor: { type: String },
        funnelText: { type: String }
    },
    chat: {
        bgColor: { type: String }
    },
    pages: [pageSchema],
    popup: { active: { type: Boolean }, wait: { type: Number }, title: { type: String }, description: { type: String }, content: { type: String }, buttonText: { type: String }, buttonLink: { type: String } },
    whatsapp: { type: Boolean }
}, {
    timestamps: true
})

const Design = mongoose.models.Design || mongoose.model('Design', DesignSchema)

export default Design