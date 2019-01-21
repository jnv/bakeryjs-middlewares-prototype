import {Program} from './program'

const middlewares = [
    async function* (ctx, next) {
        console.log('before mw1', ctx)
        const iterator = await next()
        for await (const message of iterator) {
            console.log('iterating mw1', message)
            yield message
        }
        console.log('after mw1')
    },
    async function* (ctx, next) {
        console.log('before mw2', ctx)
        console.log(next.toString())
        const iterator = await next()
        console.log(iterator)
        for await (const message of iterator) {
            console.log('iterating mw2', message)
            yield message
        }
        console.log('after mw2')
    }
]

const pr = new Program()
pr.use(...middlewares)
pr.run()