// SPDX-License-Identifier: Apache-2.0

/*
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
	function, args := APIstub.GetFunctionAndParameters()
	if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "recordKajmak" {
		return s.recordKajmak(APIstub, args)
	} else if function == "queryAllKajmak" {
		return s.queryAllKajmak(APIstub)
	} else if function == "changeKajmakOwner" {
		return s.changeKajmakOwner(APIstub, args)
	} else if function == "deleteKajmak" {
		return s.deleteKajmak(APIstub, args)
	}
	return shim.Error("Invalid Smart Contract function name.")
}

//initLedger method deifinition
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	kajmak := []Kajmak{
		Kajmak{Name: "Kajmak1", Owner: "Majra", Animal: "Sheep", Location: "Vlasic", Quantity: "340", ProductionDate: "05.10.2018. 10:55 am", ExpirationDate: "15.10.2019. 10:55 am"},
		Kajmak{Name: "Kajmak2", Owner: "Dragoljuba", Animal: "Cow", Location: "Trebinje", Quantity: "540", ProductionDate: "06.10.2018. 10:56 pm", ExpirationDate: "16.10.2019. 10:56 pm" },
	}

	i := 0
	for i < len(kajmak) {
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

//recordKajmak method definition
func (s *SmartContract) recordKajmak(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
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

//changeKajmakOwner method definition
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
	kajmak.Owner = args[1]

	kajmakAsBytes, _ = json.Marshal(kajmak)
	err := APIstub.PutState(args[0], kajmakAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change kajmak owner: %s", args[0]))
	}
	return shim.Success(nil)
}

//deleteKajmak method definition
func (s *SmartContract) deleteKajmak(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 8 {
		return shim.Error("Incorrect number of arguments. Expecting 8")
	}

	err := APIstub.DelState(args[0])
	if (err != nil) {
		return shim.Error(fmt.Sprintf("Failed to delete kajmak: %s", args[0]))
	}
	
	eventPayload := "Kajmak with ID " + args[0] + " whose owner is " + args[2] + " was deleted because it has expired on date " + args[7]
	payloadAsBytes := []byte(eventPayload)
	eventErr := APIstub.SetEvent("deleteEvent",payloadAsBytes)
	if (eventErr != nil) {
		return shim.Error(fmt.Sprintf("Failed to emit event"))
	}
	
	return shim.Success(nil);
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
