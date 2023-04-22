import { EVMResults, Stack, Memory, Storage } from "./components";
import { useState, useMemo, useRef } from "react";

import "./App.css";

type vEVMState = {
  code: string;
  data: string;
  value: string;
  pc: string;
  stack: string[];
  mem: string;
  storageKey: string[];
  storageData: string[];
  logs: string[];
  output: string;
};

export function App() {
  const [textCode, setTextCode] = useState("");
  const [textData, setTextData] = useState("");
  const [textValue, setTextValue] = useState("");
  const [bytecode, setBytecode] = useState("");
  const [data, setData] = useState("");
  const [value, setValue] = useState("");

  const [executing, setExecuting] = useState<boolean>();

  const [puzzleId, setPuzzleId] = useState(1);
  const [puzzleDesc, setPuzzleDesc] = useState<string>();
  const [puzzleAnswer, setPuzzleAnswer] = useState<vEVMState>();
  const [puzzleStatus, setPuzzleStatus] = useState<boolean>();

  const [activePuzzle, setActivePuzzle] = useState(1);

  const setPuzzle = () => {
    setPuzzleStatus(false);
    switch (puzzleId) {
      case 1:
        setPuzzleDesc(
          `PUSH is an opcode that places 32 bytes of data on the stack.\n\n` +
            `There are 32 variants of PUSH, corresponding to the size of the data you want to push.\n` +
            `The stack has 1024 slots of 32 bytes each. A PUSH of any size takes an entire slot.\n` +
            `The hex data you are pushing follows the opcode.\n\n` +
            `Look up PUSH1 on evm.codes and find the opcode.\n` +
            `Place the hex value 0x10 on the stack.`
        );
        setPuzzleAnswer({
          code: "",
          data: "",
          value: "",
          pc: "",
          stack: [
            "0x0000000000000000000000000000000000000000000000000000000000000010",
          ],
          mem: "",
          storageKey: [],
          storageData: [],
          logs: [],
          output: "",
        });
        setActivePuzzle(1);

        return;
      case 2:
        setPuzzleDesc(
          `MSTORE is an opcode that takes data from the stack and places it in memory.\n\n` +
            `Unlike PUSH, you need to specify where in memory to want the data.\n` +
            `There are no data alignment constraints; you can place the data anywhere.\n` +
            `However, MSTORE pushes 32 bytes.  We'll learn MSTORE8 later which pushes 1 byte.\n\n` +
            `If you place the data higher in memory, unused skipped memory locations are fill with zero.\n` +
            `Note that this Memory Expansion can get expensive in contracts.\n\n` +
            // `(there is a bug that currently displays a full 32bytes; that will be resolved soon).\n\n` +
            `Look up MSTORE on evm.codes and find the opcode.\n` +
            `Place the hex value 0x10 on the stack, then move it to memory location 0x20.`
        );
        setPuzzleAnswer({
          code: "",
          data: "",
          value: "",
          pc: "",
          stack: [],
          mem: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010",
          storageKey: [],
          storageData: [],
          logs: [],
          output: "",
        });
        setActivePuzzle(2);
        return;
      case 3:
        setPuzzleDesc(
          `SSTORE is an opcode that takes data from the stack and places it in storage.\n\n` +
            `Unlike MSTORE, you specify a storage slot instead of a memory location.\n` +
            `This data can be directly accessed later from the same storage slot.\n\n` +
            `Look up SSTORE on evm.codes and find the opcode.\n` +
            `Place the hex value 0x10 on the stack, then move it to storage slot 0x30.`
        );
        setPuzzleAnswer({
          code: "",
          data: "",
          value: "",
          pc: "",
          stack: [],
          mem: "",
          storageKey: [
            "0x0000000000000000000000000000000000000000000000000000000000000030",
          ],
          storageData: [
            "0x0000000000000000000000000000000000000000000000000000000000000010",
          ],
          logs: [],
          output: "",
        });
        setActivePuzzle(3);
        return;
      case 4:
        setPuzzleDesc(
          `Show me what you've got.\n\n` +
            `The final state should have:\n` +
            `0x10 on the stack\n` +
            `0x20 in memory at location 0x00 (as a 32byte value)\n` +
            `0x30 in storage at location 0x00\n\n` +
            `Screencap when you've got it right and tweet it at @kethcode.\n`
        );
        setPuzzleAnswer({
          code: "",
          data: "",
          value: "",
          pc: "",
          stack: [
            "0x0000000000000000000000000000000000000000000000000000000000000010",
          ],
          mem: "0x0000000000000000000000000000000000000000000000000000000000000020",
          storageKey: [
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
          storageData: [
            "0x0000000000000000000000000000000000000000000000000000000000000030",
          ],
          logs: [],
          output: "",
        });
        setActivePuzzle(4);
        return;
      default:
        return;
    }
  };

  const checkAnswer = (results: vEVMState) => {
    if (!puzzleAnswer) return;
    switch (puzzleId) {
      case 1:
        if (isEqual(results.stack, puzzleAnswer.stack)) {
          console.log("correct!");
          setPuzzleStatus(true);
        } else {
          console.log("incorrect!");
          setPuzzleStatus(false);
        }
        return;
      case 2:
        if (results.mem === puzzleAnswer.mem) {
          console.log("correct!");
          setPuzzleStatus(true);
        } else {
          console.log("incorrect!");
          setPuzzleStatus(false);
        }
        return;
      case 3:
        if (
          isEqual(results.storageData, puzzleAnswer.storageData) &&
          isEqual(results.storageKey, puzzleAnswer.storageKey)
        ) {
          console.log("correct!");
          setPuzzleStatus(true);
        } else {
          console.log("incorrect!");
          setPuzzleStatus(false);
        }
        return;
      case 4:
        console.log("stack: ", isEqual(results.stack, puzzleAnswer.stack));
        console.log("mem: ", results.mem === puzzleAnswer.mem);
        console.log(
          "storageData: ",
          isEqual(results.storageData, puzzleAnswer.storageData)
        );
        console.log(
          "storageKey: ",
          isEqual(results.storageKey, puzzleAnswer.storageKey)
        );

        if (
          isEqual(results.stack, puzzleAnswer.stack) &&
          results.mem === puzzleAnswer.mem &&
          isEqual(results.storageData, puzzleAnswer.storageData) &&
          isEqual(results.storageKey, puzzleAnswer.storageKey)
        ) {
          console.log("correct!");
          setPuzzleStatus(true);
        } else {
          console.log("incorrect!");
          setPuzzleStatus(false);
        }
        return;
      default:
        return;
    }
  };

  // https://stackoverflow.com/questions/62459785/comparing-two-state-arrays-in-react-will-not-return-a-boolean-true-if-they-are
  // https://stackoverflow.com/a/62459873
  function isEqual(value: any, other: any) {
    // Get the value type
    var type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) {
      return false;
    }

    // If items are not an object or array, return false
    if (["[object Array]", "[object Object]"].indexOf(type) < 0) {
      return false;
    }

    // Compare the length of the length of the two items
    var valueLen =
      type === "[object Array]" ? value.length : Object.keys(value).length;
    var otherLen =
      type === "[object Array]" ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) {
      return false;
    }
    // Compare two items
    var compare = function (item1: any, item2: any) {
      // Get the object type
      var itemType = Object.prototype.toString.call(item1);

      // If an object or array, compare recursively
      if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
        if (!isEqual(item1, item2)) {
          return false;
        }
      }

      // Otherwise, do a simple comparison
      else {
        // If the two items are not the same type, return false
        if (itemType !== Object.prototype.toString.call(item2)) return false;

        // Else if it's a function, convert to a string and compare
        // Otherwise, just compare
        if (itemType === "[object Function]") {
          if (item1.toString() !== item2.toString()) return false;
        } else {
          if (item1 !== item2) return false;
        }
      }
    };

    // Compare properties
    if (type === "[object Array]") {
      for (var i = 0; i < valueLen; i++) {
        if (compare(value[i], other[i]) === false) return false;
      }
    } else {
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          if (compare(value[key], other[key]) === false) return false;
        }
      }
    }

    // If nothing failed, return true
    return true;
  }

  const sendParamters = () => {
    if (textCode.length != 0) {
      // console.log("textCode: [%d]", textCode, textCode.length);
      setBytecode(textCode);
      setData(textData);
      setValue(textValue);
      // console.log("submitting [%d]:", bytecode, bytecode.length % 2);
      setExecuting(true);
    } else {
      setExecuting(false);
    }
  };

  const [evmResults, setEvmResults] = useState<vEVMState>();
  const returnEvmResults = (results: vEVMState) => {
    setEvmResults(results);
    setExecuting(false);
    if (results) {
      checkAnswer(results);
    }
  };

  const [update, triggerUpdate] = useState(0);

  const checkAndExecute = (input: string) => {
    // console.log("input: [%d]", input, input.length);
    setTextCode(input);
    if (input) {
      if (input.length % 2 == 0) {
        triggerUpdate(update + 1);
      }
    }
  };

  const updateResult = useMemo(() => sendParamters(), [update]);
  const puzzleIdResult = useMemo(() => setPuzzle(), [puzzleId]);

  return (
    <>
      <header>
        <div className="header">
          <h1>NotYourKeys</h1>
        </div>
      </header>
      <div className="main">
        <div className="columns">
          <div className="col left">
            <button
              className={
                activePuzzle === 1
                  ? "button-puzzle-select active"
                  : "button-puzzle-select"
              }
              onClick={(e) => setPuzzleId(1)}
            >
              puzzle 1: PUSH
            </button>
            <button
              className={
                activePuzzle === 2
                  ? "button-puzzle-select active"
                  : "button-puzzle-select"
              }
              onClick={(e) => setPuzzleId(2)}
            >
              puzzle 2: MSTORE
            </button>
            <button
              className={
                activePuzzle === 3
                  ? "button-puzzle-select active"
                  : "button-puzzle-select"
              }
              onClick={(e) => setPuzzleId(3)}
            >
              puzzle 3: SSTORE
            </button>
            <button
              className={
                activePuzzle === 4
                  ? "button-puzzle-select active"
                  : "button-puzzle-select"
              }
              onClick={(e) => setPuzzleId(4)}
            >
              puzzle 4: QUIZ
            </button>
          </div>

          <div className="col center">
            <div className="box">{puzzleDesc}</div>
            <textarea
              autoFocus
              className="textarea-terminal"
              value={textCode}
              placeholder="type your bytecode answer here"
              onChange={(e) => checkAndExecute(e.target.value)}
            />
            {executing ? (
              <button className="button-execute on">Executing...</button>
            ) : (
              <button className="button-waiting on">Awaiting Input...</button>
            )}
            {bytecode && (
              <EVMResults
                bytecode={bytecode}
                data={data}
                value={value}
                returnEvmResults={returnEvmResults}
              />
            )}
            {puzzleStatus && (
              <div className="answer-box">
                SUCCESS.
                <br></br>
                <br></br>
                YOU DID IT.
              </div>
            )}
          </div>
          <div className="col right">
            <Stack stack={evmResults?.stack} />
            <Memory memory={evmResults?.mem} />
            <Storage
              storageData={evmResults?.storageData}
              storageKey={evmResults?.storageKey}
            />
            {/* {evmResults?.stack && evmResults?.stack.length > 0 && (
              <Stack stack={evmResults.stack} />
            )}
            {evmResults?.mem && evmResults?.mem.length > 2 && (
              <Memory memory={evmResults.mem} />
            )}
            {evmResults?.storageData &&
              evmResults?.storageKey &&
              evmResults?.storageData.length > 0 &&
              evmResults?.storageKey.length > 0 && (
                <Storage
                  storageData={evmResults?.storageData}
                  storageKey={evmResults?.storageKey}
                />
              )} */}
          </div>
        </div>
      </div>

      <footer>
        <a href="https://vevm-demo.vercel.app" target={"_blank"}>
          https://vevm-demo.vercel.app
        </a>
        <a href="https://www.evm.codes" target={"_blank"}>
          https://www.evm.codes
        </a>
        <a
          href="https://ethereum.github.io/execution-specs/autoapi/ethereum/shanghai/vm"
          target={"_blank"}
        >
          https://ethereum.github.io/execution-specs/autoapi/ethereum/shanghai/vm
        </a>
        <a href="https://etherscan.io" target={"_blank"}>
          https://etherscan.io
        </a>
        <a href="https://github.com/kethcode/vEVM" target={"_blank"}>
          https://github.com/kethcode/vEVM
        </a>
        <a href="https://www.4byte.directory" target={"_blank"}>
          https://www.4byte.directory
        </a>
        <a
          href="https://emn178.github.io/online-tools/keccak_256.html"
          target={"_blank"}
        >
          https://emn178.github.io/online-tools/keccak_256.html
        </a>
        <a
          href="https://www.browserling.com/tools/utc-to-unix"
          target={"_blank"}
        >
          https://www.browserling.com/tools/utc-to-unix
        </a>
      </footer>
    </>
  );
}
