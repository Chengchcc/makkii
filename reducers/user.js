import bip39 from 'bip39'
import {hashPassword} from '../utils.js';

import { 
	USER,  
	USER_REGISTER, 
	USER_SIGNOUT 
} from '../actions/user.js'; 

const init = {
	timestamp: 0,  
	hashed_password: '',    
	mnemonic: '',
	default_account_name: 'account',
};

export default function user(state = init, action){
	switch(action.type){
		case USER: 
			return Object.assign({}, action.user);
		case USER_REGISTER:
			return Object.assign({}, state, {
	        	timestamp: Date.now(),
	        	hashed_password: hashPassword(action.password),
	        	mnemonic: bip39.generateMnemonic() 
	      	});
		case USER_SIGNOUT:
			return Object.assign({}, state, {
	        	timestamp: 0,
	        	hashed_password: '',
	      	});
		default: 
			return state;
	}
};
