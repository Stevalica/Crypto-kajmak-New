#!/bin/bash



set -ev



export MSYS_NO_PATHCONV=1



docker-compose -f docker-compose.yaml down   //ukloni prethodne

docker-compose -f docker-compose.yaml up -d ca.example.com orderer.example.com peer0.org1.example.com couchdb //couchdb baza koja se koristi za snimanje kljuceva i vrijednosti


export FABRIC_START_TIMEOUT=20  //20 sekundi da se pokrene

sleep ${FABRIC_START_TIMEOUT}

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel create -o orderer.example.com:7050 -c mychannel -f /etc/hyperledger/configtx/channel.tx
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel join -b mychannel.block

// sa e se postavlja enviroment