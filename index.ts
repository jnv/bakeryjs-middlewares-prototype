import {Program} from './program'

const middlewares = [
    /*async (ctx, next) => {
        console.log('before mw1', ctx)
        const message = await next()
        console.log('after mw1', message)
        return message
    },*/
    async (ctx, next) => {
        console.log('before mw2', ctx)
        console.log(next.toString())
        const iterator = await next()
        console.log(iterator)
        for await (const message of iterator) {
            console.log('iterating mw2', message)
        }
    }
]

const pr = new Program()
pr.use(...middlewares)
pr.run()