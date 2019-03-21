import {AsyncStorage} from 'react-native';
import {encrypt} from '../utils.js';

import {
	USER,
	USER_UPDATE_PASSWORD,
} from '../actions/user.js';

const init = {
	timestamp: 0,
	mnemonic: '',          // encrypted
};

export default function user(state = init, action){
	let new_state;
	let should_update_db = false;
	switch(action.type){
		case USER:
			new_state = Object.assign({}, {
	        	hashed_password: action.hashed_password,
	        	mnemonic: action.mnemonic
	      	});
	      	should_update_db = true;
	      	break;
	    case USER_UPDATE_PASSWORD:
	    	new_state = Object.assign({}, state, {
	    		hashed_password: action.hashed_password
	    	});
	    	should_update_db = true;
	    	break;

		default:
			new_state = state;
			break;
	}
	if(should_update_db){
		AsyncStorage.setItem(
			'user',
			JSON.stringify(new_state)
		);
	}
	return new_state;
};
