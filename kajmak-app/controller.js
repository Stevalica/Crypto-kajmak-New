//SPDX-License-Identifier: Apache-2.0

/*
  This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/fabcar/query.js
  and https://github.com/hyperledger/fabric-samples/blob/release/fabcar/invoke.js
 */

// call the packages we need
var express       = require('express');        // call express
var app           = express();                 // define our app using express
var bodyParser    = require('body-parser');
var http          = require('http')
var fs            = require('fs');
var Fabric_Client = require('fabric-client');
var path          = require('path');
var util          = require('util');
var os            = require('os');
var schedule = require('node-schedule');

module.exports = (function() {
return{
	get_all_kajmak: function(req, res){
		console.log("getting all kajmak from database: ");

		var fabric_client = new Fabric_Client();

		// setup the fabric network
		var channel = fabric_client.newChannel('mychannel');
		var peer = fabric_client.newPeer('grpc://localhost:7051');
		channel.addPeer(peer);

		//
		var member_user = null;
		var store_path = path.join(os.homedir(), '.hfc-key-store');
		console.log('Store path:'+store_path);
		var tx_id = null;

		// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
		Fabric_Client.newDefaultKeyValueStore({ path: store_path
		}).then((state_store) => {
		    // assign the store to the fabric client
		    fabric_client.setStateStore(state_store);
		    var crypto_suite = Fabric_Client.newCryptoSuite();
		    // use the same location for the state store (where the users' certificate are kept)
		    // and the crypto store (where the users' keys are kept)
		    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		    crypto_suite.setCryptoKeyStore(crypto_store);
		    fabric_client.setCryptoSuite(crypto_suite);

		    // get the enrolled user from persistence, this user will sign all requests
		    return fabric_client.getUserContext('user1', true);
		}).then((user_from_store) => {
		    if (user_from_store && user_from_store.isEnrolled()) {
		        console.log('Successfully loaded user1 from persistence');
		        member_user = user_from_store;
		    } else {
		        throw new Error('Failed to get user1.... run registerUser.js');
		    }

		    // queryAllKajmak - requires no arguments , ex: args: [''],
		    const request = {
		        chaincodeId: 'kajmak-app',
		        txId: tx_id,
		        fcn: 'queryAllKajmak',
		        args: ['']
		    };

		    // send the query proposal to the peer
		    return channel.queryByChaincode(request);
		}).then((query_responses) => {
		    console.log("Query has completed, checking results");
		    // query_responses could have more than one  results if there multiple peers were used as targets
		    if (query_responses && query_responses.length == 1) {
		        if (query_responses[0] instanceof Error) {
		            console.error("error from query = ", query_responses[0]);
		        } else {
		            console.log("Response is ", query_responses[0].toString());
		            res.json(JSON.parse(query_responses[0].toString()));
		        }
		    } else {
		        console.log("No payloads were returned from query");
		    }
		}).catch((err) => {
		    console.error('Failed to query successfully :: ' + err);
		});
	},
	add_kajmak: function(req, res){
		console.log("submit recording of a kajmak catch: ");

		var array = req.params.kajmak.split("-");
		console.log(array);

		var key = array[0]
		var name = array[1]
		var owner = array[2]
		var animal = array[3]
		var location = array[4]
		var quantity = array[5]
		var productionDate = array[6]
		var expirationDate = array[7]

		var fabric_client = new Fabric_Client();

		// setup the fabric network
		var channel = fabric_client.newChannel('mychannel');
		var peer = fabric_client.newPeer('grpc://localhost:7051');
		channel.addPeer(peer);
		var order = fabric_client.newOrderer('grpc://localhost:7050')
		channel.addOrderer(order);

		var member_user = null;
		var store_path = path.join(os.homedir(), '.hfc-key-store');
		console.log('Store path:'+store_path);
		var tx_id = null;

		// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
		Fabric_Client.newDefaultKeyValueStore({ path: store_path
		}).then((state_store) => {
		    // assign the store to the fabric client
		    fabric_client.setStateStore(state_store);
		    var crypto_suite = Fabric_Client.newCryptoSuite();
		    // use the same location for the state store (where the users' certificate are kept)
		    // and the crypto store (where the users' keys are kept)
		    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		    crypto_suite.setCryptoKeyStore(crypto_store);
		    fabric_client.setCryptoSuite(crypto_suite);

		    // get the enrolled user from persistence, this user will sign all requests
		    return fabric_client.getUserContext('user1', true);
		}).then((user_from_store) => {
		    if (user_from_store && user_from_store.isEnrolled()) {
		        console.log('Successfully loaded user1 from persistence');
		        member_user = user_from_store;
		    } else {
		        throw new Error('Failed to get user1.... run registerUser.js');
		    }

		    // get a transaction id object based on the current user assigned to fabric client
		    tx_id = fabric_client.newTransactionID();
		    console.log("Assigning transaction_id: ", tx_id._transaction_id);

		    // recordKajmak - requires 5 args, ID, vessel, location, timestamp,holder - ex: args: ['10', 'Hound', '-12.021, 28.012', '1504054225', 'Hansel'], 
		    // send proposal to endorser
		    const request = {
		        //targets : --- letting this default to the peers assigned to the channel
		        chaincodeId: 'kajmak-app',
		        fcn: 'recordKajmak',
		        args: [key, name, owner, animal, location, quantity, productionDate, expirationDate],
		        chainId: 'mychannel',
		        txId: tx_id
		    };
		    
		    // send the transaction proposal to the peers
		    return channel.sendTransactionProposal(request);
		}).then((results) => {
		    var proposalResponses = results[0];
		    //console.log(proposalResponses);
		    var proposal = results[1];
		    //console.log(proposal);
		    let isProposalGood = false;
		    if (proposalResponses && proposalResponses[0].response &&
		        proposalResponses[0].response.status === 200) {
		            isProposalGood = true;
		            console.log('Transaction proposal was good');
		        } else {
		            console.error('Transaction proposal was bad');
		        }

		    if (isProposalGood) {
		        console.log(util.format(
		            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
		            proposalResponses[0].response.status, proposalResponses[0].response.message));

		        // build up the request for the orderer to have the transaction committed
		        var request = {
		            proposalResponses: proposalResponses,
		            proposal: proposal

		        };


		        // set the transaction listener and set a timeout of 30 sec
		        // if the transaction did not get committed within the timeout period,
		        // report a TIMEOUT status
		        var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
		        var promises = [];
		        var sendPromise = channel.sendTransaction(request); //vraca promise sa statusom je li sve ok

		        promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

		        // get an eventhub once the fabric client has a user assigned. The user
		        // is required bacause the event registration must be signed
		        let channel_event_hub = channel.newChannelEventHub(peer);
		        // using resolve the promise so that result status may be processed
		        // under the then clause rather than having the catch clause process
		        // the status
		        let start_block = null;
		        let txPromise = new Promise((resolve, reject) => {
		            //saceka 20 sekundi i onda izvrsi svoju funkciju
		            let handle = setTimeout(() => {
				        // do the housekeeping when there is a problem
				        channel_event_hub.unregisterTxEvent(transaction_id_string);
				        console.log('Timeout - Failed to receive the transaction event');
				        reject(new Error('Timed out waiting for block event'));
				    }, 20000);

		            channel_event_hub.connect();

		            channel_event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
		                // this is the callback for transaction event status
		                // first some clean up of event listener
		                clearTimeout(handle);
		                channel_event_hub.unregisterTxEvent(transaction_id_string);
		                channel_event_hub.disconnect();



		                // now let the application know what happened

		                var return_status = {event_status : code, tx_id : transaction_id_string};

		                if (code !== 'VALID') {

		                    console.error('The transaction was invalid, code = ' + code);

		                    resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));

		                } else {

		                    console.log('The transaction has been committed on peer ' + channel_event_hub.getPeerAddr());

		                    resolve(return_status);

		                }

		            }, (err) => {

		                //this is the callback if something goes wrong with the event registration or processing

		                reject(new Error('There was a problem with the eventhub ::'+err));

		            });

		        });
		        promises.push(txPromise);
		        return Promise.all(promises);

		    } else {

		        console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');

		        throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');

		    }

		}).then((results) => {

		    console.log('Send transaction promise and event listener promise have completed');

		    // check the results in the order the promises were added to the promise all list

		    if (results && results[0] && results[0].status === 'SUCCESS') {

		        console.log('Successfully sent transaction to the orderer.');

		        //res.send(tx_id.getTransactionID());

		    } else {

		        console.error('Failed to order the transaction. Error code: ' + response.status);

		    }



		    if(results && results[1] && results[1].event_status === 'VALID') {

		        console.log('Successfully committed the change to the ledger by the peer');

		        res.send("Poslano iz transaction eveta");

		    } else {

		        console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);

		    }

		}).catch((err) => {

		    console.error('Failed to invoke successfully :: ' + err);

		});
	},
	change_owner: function(req, res){
		console.log("changing owner of kajmak catch: ");

		var array = req.params.owner.split("-");
		var key = array[0]
		var owner = array[1];

		var fabric_client = new Fabric_Client();

		// setup the fabric network
		var channel = fabric_client.newChannel('mychannel');
		var peer = fabric_client.newPeer('grpc://localhost:7051');
		channel.addPeer(peer);
		var order = fabric_client.newOrderer('grpc://localhost:7050')
		channel.addOrderer(order);

		var member_user = null;
		var store_path = path.join(os.homedir(), '.hfc-key-store');
		console.log('Store path:'+store_path);
		var tx_id = null;

		// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
		Fabric_Client.newDefaultKeyValueStore({ path: store_path
		}).then((state_store) => {
		    // assign the store to the fabric client
		    fabric_client.setStateStore(state_store);
		    var crypto_suite = Fabric_Client.newCryptoSuite();
		    // use the same location for the state store (where the users' certificate are kept)
		    // and the crypto store (where the users' keys are kept)
		    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		    crypto_suite.setCryptoKeyStore(crypto_store);
		    fabric_client.setCryptoSuite(crypto_suite);

		    // get the enrolled user from persistence, this user will sign all requests
		    return fabric_client.getUserContext('user1', true);
		}).then((user_from_store) => {
		    if (user_from_store && user_from_store.isEnrolled()) {
		        console.log('Successfully loaded user1 from persistence');
		        member_user = user_from_store;
		    } else {
		        throw new Error('Failed to get user1.... run registerUser.js');
		    }

		    // get a transaction id object based on the current user assigned to fabric client
		    tx_id = fabric_client.newTransactionID();
		    console.log("Assigning transaction_id: ", tx_id._transaction_id);

		    // changeTunaHolder - requires 2 args , ex: args: ['1', 'Barry'],
		    // send proposal to endorser
		    var request = {
		        //targets : --- letting this default to the peers assigned to the channel
		        chaincodeId: 'kajmak-app',
		        fcn: 'changeKajmakOwner',
		        args: [key, owner],
		        chainId: 'mychannel',
		        txId: tx_id
		    };

		    // send the transaction proposal to the peers
		    return channel.sendTransactionProposal(request);
		}).then((results) => {
		    var proposalResponses = results[0];
		    var proposal = results[1];
		    let isProposalGood = false;
		    if (proposalResponses && proposalResponses[0].response &&
		        proposalResponses[0].response.status === 200) {
		            isProposalGood = true;
		            console.log('Transaction proposal was good');
		        } else {
		            console.error('Transaction proposal was bad');
		        }
		    if (isProposalGood) {
		        console.log(util.format(
		            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
		            proposalResponses[0].response.status, proposalResponses[0].response.message));

		        // build up the request for the orderer to have the transaction committed
		        var request = {
		            proposalResponses: proposalResponses,
		            proposal: proposal
		        };

		        // set the transaction listener and set a timeout of 30 sec
		        // if the transaction did not get committed within the timeout period,
		        // report a TIMEOUT status
		        var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
		        var promises = [];

		        var sendPromise = channel.sendTransaction(request);
		        promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

		        // get an eventhub once the fabric client has a user assigned. The user
		        // is required bacause the event registration must be signed
		        let channel_event_hub = channel.newChannelEventHub(peer);
		        
		        // using resolve the promise so that result status may be processed
		        // under the then clause rather than having the catch clause process
		        // the status
		        let txPromise = new Promise((resolve, reject) => {
		            let handle = setTimeout(() => {
				        // do the housekeeping when there is a problem
				        channel_event_hub.unregisterTxEvent(transaction_id_string);
				        console.log('Timeout - Failed to receive the transaction event');
				        reject(new Error('Timed out waiting for block event'));
				    }, 20000);
		            channel_event_hub.connect();
		            channel_event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
		                // this is the callback for transaction event status
		                // first some clean up of event listener
		                clearTimeout(handle);
		                channel_event_hub.unregisterTxEvent(transaction_id_string);
		                channel_event_hub.disconnect();



		                // now let the application know what happened

		                var return_status = {event_status : code, tx_id : transaction_id_string};

		                if (code !== 'VALID') {

		                    console.error('The transaction was invalid, code = ' + code);

		                    resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));

		                } else {

		                    console.log('The transaction has been committed on peer ' + channel_event_hub.getPeerAddr());

		                    resolve(return_status);

		                }

		            }, (err) => {

		                //this is the callback if something goes wrong with the event registration or processing

		                reject(new Error('There was a problem with the eventhub ::'+err));

		            });

		        });
		        promises.push(txPromise);

		        return Promise.all(promises);
		    } else {
		        console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		        throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		        // throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		    }
		}).then((results) => {
		    console.log('Send transaction promise and event listener promise have completed');
		    // check the results in the order the promises were added to the promise all list
		    if (results && results[0] && results[0].status === 'SUCCESS') {
		        console.log('Successfully sent transaction to the orderer.');
		        //res.json(tx_id.getTransactionID())
		    } else {
		        console.error('Failed to order the transaction. Error code: ' + response.status);
		        //res.send("Error: no tuna catch found");
		    }

		    if(results && results[1] && results[1].event_status === 'VALID') {
		        console.log('Successfully committed the change to the ledger by the peer');
		        res.send("Poslano iz transaction eveta");
		    } else {
		        console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
		    }
		}).catch((err) => {
		    console.error('Failed to invoke successfully :: ' + err);
		    //res.send("Error: no tuna catch found");
		});
	},
	delete_kajmak: function(req, res){
		console.log("deleting kajmak");

		var array = req.params.kjmk.split("-");
		console.log(array);

		var key = array[0]
		var name = array[1]
		var owner = array[2]
		var animal = array[3]
		var location = array[4]
		var quantity = array[5]
		var productionDate = array[6]
		var expirationDate = array[7]

		var fabric_client = new Fabric_Client();

		// setup the fabric network
		var channel = fabric_client.newChannel('mychannel');
		var peer = fabric_client.newPeer('grpc://localhost:7051');
		channel.addPeer(peer);
		var order = fabric_client.newOrderer('grpc://localhost:7050')
		channel.addOrderer(order);

		var member_user = null;
		var store_path = path.join(os.homedir(), '.hfc-key-store');
		console.log('Store path:'+store_path);
		var tx_id = null;

		// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
		Fabric_Client.newDefaultKeyValueStore({ path: store_path
		}).then((state_store) => {
		    // assign the store to the fabric client
		    fabric_client.setStateStore(state_store);
		    var crypto_suite = Fabric_Client.newCryptoSuite();
		    // use the same location for the state store (where the users' certificate are kept)
		    // and the crypto store (where the users' keys are kept)
		    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		    crypto_suite.setCryptoKeyStore(crypto_store);
		    fabric_client.setCryptoSuite(crypto_suite);

		    // get the enrolled user from persistence, this user will sign all requests
		    return fabric_client.getUserContext('user1', true);
		}).then((user_from_store) => {
		    if (user_from_store && user_from_store.isEnrolled()) {
		        console.log('Successfully loaded user1 from persistence');
		        member_user = user_from_store;
		    } else {
		        throw new Error('Failed to get user1.... run registerUser.js');
		    }

		    // get a transaction id object based on the current user assigned to fabric client
		    tx_id = fabric_client.newTransactionID();
		    console.log("Assigning transaction_id: ", tx_id._transaction_id);

		    // changeTunaHolder - requires 2 args , ex: args: ['1', 'Barry'],
		    // send proposal to endorser
		    var request = {
		        //targets : --- letting this default to the peers assigned to the channel
		        chaincodeId: 'kajmak-app',
		        fcn: 'deleteKajmak',
		        args: [key, name, owner, animal, location, quantity, productionDate, expirationDate],
		        chainId: 'mychannel',
		        txId: tx_id
		    };

		    // send the transaction proposal to the peers
		    return channel.sendTransactionProposal(request);
		}).then((results) => {
		    var proposalResponses = results[0];
		    var proposal = results[1];
		    let isProposalGood = false;
		    if (proposalResponses && proposalResponses[0].response &&
		        proposalResponses[0].response.status === 200) {
		            isProposalGood = true;
		            console.log('Transaction proposal was good');
		        } else {
		            console.error('Transaction proposal was bad');
		        }
		    if (isProposalGood) {
		        console.log(util.format(
		            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
		            proposalResponses[0].response.status, proposalResponses[0].response.message));

		        // build up the request for the orderer to have the transaction committed
		        var request = {
		            proposalResponses: proposalResponses,
		            proposal: proposal
		        };

		        // set the transaction listener and set a timeout of 30 sec
		        // if the transaction did not get committed within the timeout period,
		        // report a TIMEOUT status
		        var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
		        var promises = [];

		        var sendPromise = channel.sendTransaction(request);
		        promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

		        // get an eventhub once the fabric client has a user assigned. The user
		        // is required bacause the event registration must be signed
		        let channel_event_hub = channel.newChannelEventHub(peer);
		        
		        // using resolve the promise so that result status may be processed
		        // under the then clause rather than having the catch clause process
		        // the status
		        let txPromise = new Promise((resolve, reject) => {
		        	let regid = null;
		            let handle = setTimeout(() => {
				        if(regid) {
				        	channel_event_hub.unregisterChaincodeEvent(regid);
            				console.log('Timeout - Failed to receive the chaincode event');
				        }
				        reject(new Error('Timed out waiting for chaincode event'));
				    }, 20000);
		            channel_event_hub.connect(true);
		            regid = channel_event_hub.registerChaincodeEvent('kajmak-app', 'deleteEvent',
				        (event, block_num, txnid, status) => {
				        // This callback will be called when there is a chaincode event name
				        // within a block that will match on the second parameter in the registration
				        // from the chaincode with the ID of the first parameter.
				        console.log('Successfully got a chaincode event with transid:'+ txnid + ' with status:'+status);

				        // might be good to store the block number to be able to resume if offline
				        //storeBlockNumForLater(block_num);

				        // to see the event payload, the channel_event_hub must be connected(true)
				        let event_payload = event.payload.toString();
				        console.log(event_payload);
				        if(event_payload.indexOf('Kajmak') > -1) {
				            clearTimeout(handle);
				            // Chaincode event listeners are meant to run continuously
				            // Therefore the default to automatically unregister is false
				            // So in this case we want to shutdown the event listener once
				            // we see the event with the correct payload
				            channel_event_hub.unregisterChaincodeEvent(regid);
				            console.log('Successfully received the chaincode event on block number '+ block_num);
				            resolve(event_payload);
				        } else {
				            console.log('Successfully got chaincode event ... just not the one we are looking for on block number '+ block_num);
				        }
				    }, (error)=> {
				        clearTimeout(handle);
				        console.log('Failed to receive the chaincode event ::'+error);
				        reject(error);
				    }
				        // no options specified
				        // startBlock will default to latest
				        // endBlock will default to MAX
				        // unregister will default to false
				        // disconnect will default to false
				    );
		        });
		        //===================================================================================================
		        promises.push(txPromise);
		        return Promise.all(promises);
		    } else {
		        console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		        throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		        // throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		    }
		}).then((results) => {
		    console.log('Send transaction promise and event listener promise have completed');
		    // check the results in the order the promises were added to the promise all list
		    if (results && results[0] && results[0].status === 'SUCCESS') {
		        console.log('Successfully sent transaction to the orderer.');
		        //res.json(tx_id.getTransactionID())
		    } else {
		        console.error('Failed to order the transaction. Error code: ' + response.status);
		        //res.send("Error: no tuna catch found");
		    }
		    
		    if(results && results[1]) {
		        console.log('Successfully committed the change to the ledger by the peer');
		        var filename = "notifikacije.txt";
		        var content = results[1] + '\r\n';
				fs.appendFile(filename,content,function(err) {
					if(err) throw err;
					console.log("Saved!");
				});
		        res.send("Poslano iz chaincode eveta");
		    } else {
		        console.log('Transaction failed to be committed to the ledger due to ::'+results[1]);
		    }
		}).catch((err) => {
		    console.error('Failed to invoke successfully :: ' + err);
		    //res.send("Error: no tuna catch found");
		});
	}
}
})();