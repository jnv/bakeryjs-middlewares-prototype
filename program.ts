import { promisify } from 'util'
import {compose} from './compose'
import Semaphore from 'semaphore-async-await'

const wait = promisify(setTimeout)

const box = {
	meta: {
		some: 'metadata',
	},
	async process(data) {
		console.log('Running box process', data)
		return { some: 'message' }
	},
}

const generator = {
	async process(data, emit: Function) {
		wait(10)
		emit({ some: 'data1' })
		wait(5)
        emit({ some: 'data2' })
        return {final: 'data3'}
	},
}

class IterableBox {
	private semaphore: Semaphore
	private done: boolean
	private queue: Array<object>
	private box: { process: Function }
	public constructor(box) {
		this.semaphore = new Semaphore(0)
		this.done = false
		this.queue = []
		this.box = box
	}

	public async process(data) {
        const result = await this.box.process(data, this.emit.bind(this))
        this.emit(result)
        this.done = true
        console.log('process done')
	}

	private emit(message) {
		this.queue.push(message)
		this.semaphore.signal()
	}

	async *[Symbol.asyncIterator]() {
        console.log('calling iterator')
		const { queue } = this
		while (true) {
			await this.semaphore.wait()
            let value = queue.pop()
            console.log(value)
			if (queue.length === 0 && this.done) {
				return value
			}
			yield value
		}
	}
}

class Program {
	middlewares: Function[]
	public constructor() {
		this.middlewares = []
	}
	public use(...middlewares: Function[]): void {
		this.middlewares.push(...middlewares)
	}
	public async run() {
        const iterable = new IterableBox(generator)
		const mw = compose([...this.middlewares, (data) => {
            iterable.process(data)
            return iterable
        }])
		await mw({})
	}
}

export { Program }
