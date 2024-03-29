import { assign } from 'xstate';

export const builderTesterOptions = {
	actions: {
		toggleAutoExecute: assign({
			autoExecute: ctx => !ctx.autoExecute
		}),
		toggleCached: assign({
			cached: ctx => !ctx.cached
		}),
		toggleHideDisabledAxes: assign({
			hideDisabledAxes: ctx => !ctx.hideDisabledAxes
		}),
		toggleHideDisabledAggs: assign({
			hideDisabledAggs: ctx => !ctx.hideDisabledAggs
		}),
		toggleHideDisabledDatasets: assign({
			hideDisabledDatasets: ctx => !ctx.hideDisabledDatasets
		}),
		toggleHideDisabledItems: assign({
			hideDisabledItems: ctx => !ctx.hideDisabledItems
		}),
		toggleShowFullResponse: assign({
			showFullResponse: ctx => !ctx.showFullResponse
		}),
		toggleMatching: assign({
			matching: ctx => !ctx.matching
		}),
		toggleSelectionComplete: assign({
			selectionComplete: ctx => !ctx.selectionComplete
		}),
		toggleQueryReady: assign({
			queryReady: ctx => !ctx.queryReady
		})
	},
	guards: {
		isAutoExecute: ctx => ctx.autoExecute,
		isInCache: ctx => ctx.cached,
		isMatching: ctx => ctx.matching,
		isSelectionComplete: ctx => ctx.selectionComplete,
		isQueryReady: ctx => ctx.queryReady
	}
};
