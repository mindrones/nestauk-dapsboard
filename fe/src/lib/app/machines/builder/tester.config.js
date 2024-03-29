import { routeConfig } from './route.config.js';

const tester_context = {
	autoExecute: false,
	cached: false,
	hideDisabledAxes: true,
	hideDisabledAggs: false,
	hideDisabledDatasets: false,
	hideDisabledItems: true,
	matching: false,
	selectionComplete: false,
	showFullResponse: false,
	queryReady: false
};

export const builderTesterConfig = {
	id: 'TestingBuilder',
	type: 'parallel',
	context: tester_context,
	states: {
		GuardsConfig: {
			initial: 'Idle',
			states: {
				Idle: {
					on: {
						SELECTION_COMPLETE_TOGGLED: {
							target: 'Idle',
							actions: ['toggleSelectionComplete']
						},
						QUERY_READY_TOGGLED: {
							target: 'Idle',
							actions: ['toggleQueryReady']
						},
						MATCHING_TOGGLED: {
							target: 'Idle',
							actions: ['toggleMatching']
						},
						CACHED_TOGGLED: {
							target: 'Idle',
							actions: ['toggleCached']
						}
					}
				}
			}
		},
		BuilderRoute: routeConfig
	}
};
