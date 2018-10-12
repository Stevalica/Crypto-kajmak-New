// SPDX-License-Identifier: Apache-2.0

/*
  Sample Chaincode based on Demonstrated Scenario

 This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/chaincode/fabcar/fabcar.go
 */

package main

/* Imports  
* 4 utility libraries for handling bytes, reading and writing JSON, 
formatting, and string manipulation  
* 2 specific Hyperledger Fabric specific libraries for Smart Contracts  
*/ 
import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

//Kajmak struct definition
type Kajmak struct {
	//id se ne upisuje
	Name string `json:"name"`
	Owner string `json:"owner"`
	Animal string `json:"animal"`
	Location  string `json:"location"`
	Quantity string `json:"quantity"`
	ProductionDate string `json:"production_date"`
	ExpirationDate string `json:"expiration_date"`
}

//Init method definition
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

//Invoke method definition
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	fmt.Printf("Argumenti:", args)
	// Route to the appropriate handler function to interact with the ledger
	if function == "initLedger" {
		fmt.Printf("\nUslo u initLedger\n")
		return s.initLedger(APIstub)
	} else if function == "recordKajmak" {
		fmt.Printf("\nUslo u recordKajmak\n")
		return s.recordKajmak(APIstub, args)
	} else if function == "queryAllKajmak" {
		fmt.Printf("\nUslo u queryAllKajmak\n")
		return s.queryAllKajmak(APIstub)
	} else if function == "changeKajmakOwner" {
		return s.changeKajmakOwner(APIstub, args)
	}
	return shim.Error("Invalid Smart Contract function name.")
}

//initLedger method deifinition
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	kajmak := []Kajmak{
		Kajmak{Name: "Kajmak1", Owner: "Majra", Animal: "Sheep", Location: "Vlasic", Quantity: "340g", ProductionDate: "5.10.2018", ExpirationDate: "6.10.2018"},
		Kajmak{Name: "Kajmak2", Owner: "Dragoljuba", Animal: "Cow", Location: "Nis", Quantity: "540g", ProductionDate: "5.10.2018", ExpirationDate: "6.10.2018"},
	}

	i := 0
	for i < len(kajmak) {
		fmt.Println("i is ", i)
		kajmakAsBytes, _ := json.Marshal(kajmak[i])
		APIstub.PutState(strconv.Itoa(i+1), kajmakAsBytes)
		fmt.Println("Added", kajmak[i])
		i = i + 1
	}

	return shim.Success(nil)
}

//queryAllKajmak method definition
func (s *SmartContract) queryAllKajmak(APIstub shim.ChaincodeStubInterface) sc.Response {
	startKey := "0"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add comma before array members,suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllKajmak:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

/*

 * The recordKajmak method *

Fisherman like Sarah would use to record each of her tuna catches. 

This method takes in five arguments (attributes to be saved in the ledger). 

 */

func (s *SmartContract) recordKajmak(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	fmt.Printf("\nUslo u recordKajmak\n")
	if len(args) != 8 {
		return shim.Error("Incorrect number of arguments. Expecting 8")
	}

	var kajmak = Kajmak{ Name: args[1], Owner: args[2], Animal: args[3], Location: args[4], Quantity: args[5], ProductionDate: args[6], ExpirationDate: args[7] }
	kajmakAsBytes, _ := json.Marshal(kajmak)
	err := APIstub.PutState(args[0], kajmakAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record tuna catch: %s", args[0]))
	}
	return shim.Success(nil)
}

/*
 * The changeKajmakOwner method *
The data in the world state can be updated with who has possession. 
This function takes in 2 arguments, tuna id and new holder name. 
 */
func (s *SmartContract) changeKajmakOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	kajmakAsBytes, _ := APIstub.GetState(args[0])
	if kajmakAsBytes == nil {
		return shim.Error("Could not locate kajmak")
	}
	kajmak := Kajmak{}

	json.Unmarshal(kajmakAsBytes, &kajmak)
	// Normally check that the specified argument is a valid holder of tuna
	// we are skipping this check for this example
	kajmak.Owner = args[1]

	kajmakAsBytes, _ = json.Marshal(kajmak)
	err := APIstub.PutState(args[0], kajmakAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change kajmak owner: %s", args[0]))
	}
	return shim.Success(nil)
}

/*
/*
 * main function *
calls the Start function 
The main function starts the chaincode in the container during instantiation.
 */
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
