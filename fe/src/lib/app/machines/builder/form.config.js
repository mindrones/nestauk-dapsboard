export const formConfig = {
	id: 'Form',
	initial: 'CheckingSelection',
	on: {
		SELECTION_CHANGED: {
			target: 'CheckingSelection',
			actions: [
				'clearQuery',
				'setSelection',
				'sendEdited',
				'sendFormChanged'
			]
		},
		RENAME: {
			type: 'internal',
			actions: ['rename']
		},
		DISCARDED: {
			target: 'Stopped',
		},
	},
	states: {
		CheckingSelection: {
			entry: 'computeLists',
			on: {
				'': [
					{
						target: 'SelectionComplete',
						cond: 'isSelectionComplete',
						actions: ['sendSelectionComplete']
					},
					{ target: 'SelectionIncomplete' }
				]
			}
		},
		SelectionIncomplete: {
			entry: [
				'clearQuery',
				'clearTypings',
				'sendSelectionIncomplete',
				'sendEdited',
			],
		},
		SelectionComplete: {
			initial: 'CheckingQuery',
			entry: [
				'computeTypings',
				'computeDefaultValues'
			],
			on: {
				JSON_EDIT: {
					target: 'SelectionComplete.QueryReady',
					actions: [
						'setJSON',
					]
				},
				QUERY_CHANGED: {
					target: 'SelectionComplete.CheckingQuery',
					actions: [
						'setQuery',
						'sendEdited',
						'sendFormChanged'
					]
				},
				TREE_CHANGED: {
					target: '#Inactive',
					actions: ['sendFormChanged']
				}
			},
			states: {
				Inactive: {
					id: 'Inactive',
					on: {
						ACTIVATED: 'CheckingQuery'
					}
				},
				CheckingQuery: {
					id: 'CheckingQuery',
					entry: 'computeRequest',
					on: {
						'': [
							{
								target: 'QueryReady',
								cond: 'isQueryReady'
							},
							{ target: 'QueryNotReady' }
						]
					}
				},
				QueryNotReady: {
					id: 'QueryNotReady',
				},
				QueryReady: {
					id: 'QueryReady',
					initial: 'CheckMatching',
					exit: 'setNotReadyStatus',
					states: {
						CheckMatching: {
							on: {
								'': [
									{
										target: 'Matching',
										cond: 'isMatching'
									},
									{ target: 'Dirty' }
								]
							}
						},
						Matching: {
							id: 'Matching',
							entry: 'setMatchingStatus'
						},
						Dirty: {
							id: 'Dirty',
							initial: 'Idle',
							on: {
								QUERY_EXECUTED: {
									target: 'Dirty.CheckingCache'
								}
							},
							states: {
								Idle: {
									on: {
										'': [
											{
												target: 'CheckingCache',
												cond: 'isAutoExecute',
											}
										]
									}
								},
								CheckingCache: {
									entry: [
										'computeCacheKey',
										'sendCommitted',
									],
									on: {
										'': [
											{
												target: '#Matching',
												cond: 'isInCache',
												actions: [
													'loadFromCache',
													'setMatchingStatus'
												],
											},
											{ target: 'Pending' }
										]
									}
								},
								Pending: {
									entry: 'setPendingStatus',
									invoke: {
										id: 'Pending',
										src: 'apiRequest',
										onDone: {
											target: '#Matching',
											actions: [
												'storeInCache',
												'setResponse'
											]
										},
										onError: {
											target: '#Error',
										}
									}
								},
								Error: {
									id: 'Error',
									entry: [
										'setErrorResponse',
										'setErrorStatus'
									]
								}
							}
						}
					}
				}
			}
		},
		Stopped: {
			type: 'final'
		}
	}
};
