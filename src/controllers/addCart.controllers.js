import AddCart from '../models/AddCart.js'
import bizSdk, { Content } from 'facebook-nodejs-business-sdk'

export const createAddCart = async (req, res) => {
    try {
        const {product, fbp, fbc} = req.body
        const CustomData = bizSdk.CustomData
        const EventRequest = bizSdk.EventRequest
        const UserData = bizSdk.UserData
        const ServerEvent = bizSdk.ServerEvent
        const access_token = process.env.APIFACEBOOK_TOKEN
        const pixel_id = process.env.APIFACEBOOK_PIXELID
        const api = bizSdk.FacebookAdsApi.init(access_token)
        let current_timestamp = new Date()
        const userData = (new UserData())
            .setClientIpAddress(req.connection.remoteAddress)
            .setClientUserAgent(req.headers['user-agent'])
            .setFbp(fbp)
            .setFbc(fbc)
        const content = (new Content())
            .setId(product._id)
            .setCategory(product.category.category)
            .setQuantity(Number(product.quantity))
            .setItemPrice(product.price)
        const customData = (new CustomData())
            .setContentName(product.name)
            .setContentType(product.category.category)
            .setCurrency('clp')
            .setValue(product.price * Number(product.quantity))
            .setContentIds([product._id])
            .setContents([content])
        const serverEvent = (new ServerEvent())
            .setEventName('AddToCart')
            .setEventTime(current_timestamp)
            .setUserData(userData)
            .setCustomData(customData)
            .setEventSourceUrl(`${process.env.WEB_URL}/tienda/${product.category.slug}/${product.slug}`)
            .setActionSource('website')
        const eventsData = [serverEvent]
        const eventRequest = (new EventRequest(access_token, pixel_id))
            .setEvents(eventsData)
            eventRequest.execute().then(
                response => {
                    console.log('Response: ', response)
                },
                err => {
                    console.error('Error: ', err)
                }
            )
        const nuevoAñadir = new AddCart({quantity, name, price, category})
        await nuevoAñadir.save()
        return res.json(nuevoAñadir)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getAddCart = async (req, res) => {
    try {
        const data = await AddCart.find()
        res.send(data)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}