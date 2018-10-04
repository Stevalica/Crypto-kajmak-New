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
	Name string `json:"name"`
	Owner string `json:"owner"`
	Location  string `json:"location"`
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
		return s.initLedger(APIstub)
	} 

	return shim.Error("Invalid Smart Contract function name.")
}

//initLedger method deifinition
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	kajmak := []Kajmak{
		Kajmak{Name: "Kajmak1", Owner: "MAjra", Location: "Vlasic"},
		Kajmak{Name: "Kajmak2", Owner: "Dragoljuba", Location: "Nis"},
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
