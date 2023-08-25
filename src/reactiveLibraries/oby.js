// setup
import $, {
	root,
	effect,
	cleanup,
	memo,
	untrack,
	context,
	batch,
} from 'oby'

import { setReactiveLibrary, children, markReactive } from '#main'

setReactiveLibrary({
	root: root,
	renderEffect: v => effect(v, { sync: 'init' }),
	effect: v => effect(v, { sync: 'init' }),
	cleanup: cleanup,
	signal: (a, b) => {
		const s = $(a, b)
		return [markReactive(() => s()), s]
	},
	memo: (a, b) => markReactive(memo(a, b)),
	untrack: untrack,
	batch: batch,
	context: defaultValue => {
		const id = Symbol()
		return {
			id,
			defaultValue,
			Provider: function (props) {
				let r
				effect(
					() =>
						(r = /*untrack*/ () => {
							context({ [id]: props.value })
							return children(() => props.children)
						}),
					{ sync: 'init' },
				)
				return r
			},
		}
	},
	useContext: v => {
		const c = context(v.id)
		return c ?? v.defaultValue
	},
})

// export
export * from '#main'
