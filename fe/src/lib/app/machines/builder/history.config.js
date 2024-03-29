export const historyConfig = {
	initial: 'Saved',
	states: {
		Saved: {
			on: {
				EDITED: {
					target: 'Editing',
					actions: ['initEntry']
				}
			}
		},
		Editing: {
			on: {
				EDITED: {
					target: 'Editing',
					actions: ['updateEntry']
				},
				COMMITTED: {
					target: 'Saved',
					cond: 'isActiveForm',
					actions: ['commitLastGoodURL']
				}
			}
		},
	}
};
